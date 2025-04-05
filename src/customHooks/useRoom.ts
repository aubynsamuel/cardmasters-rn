import { useState, useEffect, useCallback } from "react";
import { BackHandler } from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
  RouteProp,
} from "@react-navigation/native";
import { useSocket } from "../SocketContext";
import {
  Room,
  OwnerChangedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  GameStartedPayload,
  ErrorPayload,
  Player,
  PlayerStatus,
  Message,
} from "../Types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCustomAlerts } from "../CustomAlertsContext";

type RootStackParamList = {
  RoomScreen: {
    roomId: string;
    initialRoomData: Room;
  };
  MultiplayerLobby: undefined;
  MultiPlayerGameScreen: {
    roomId: string;
    roomData: Room;
  };
};

type RoomScreenRouteProp = RouteProp<RootStackParamList, "RoomScreen">;
type RoomNavigation = NativeStackNavigationProp<RootStackParamList>;

const useRoom = () => {
  const route = useRoute<RoomScreenRouteProp>();
  const navigation = useNavigation<RoomNavigation>();
  const { socket, isConnected } = useSocket();
  const { roomId, initialRoomData } = route.params;
  const [roomState, setRoomState] = useState<Room | null>(
    initialRoomData || null
  );
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >(isConnected ? "connected" : "connecting");
  const { showAlert, showToast } = useCustomAlerts();

  useEffect(() => {
    if (roomState && socket) {
      setIsOwner(roomState.ownerId === socket.id);
      navigation.setOptions({ title: roomState.name });
    }
  }, [roomState, socket, navigation]);

  useEffect(() => {
    const onBackPress = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MultiplayerLobby" }],
      });
      console.log("[useRoom] Hardware Back Press From RoomScreen");
      socket?.emit("leave_room", { roomId });
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  const handlePlayerJoined = (data: PlayerJoinedPayload) => {
    console.log("[useRoom] Player joined:", data.playerName);
    setRoomState((prev) =>
      prev ? { ...prev, players: data.updatedPlayers } : null
    );
  };

  const handlePlayerLeft = useCallback(
    (data: PlayerLeftPayload) => {
      setRoomState((prev) => {
        if (!prev) return null;
        return { ...prev, players: data.updatedPlayers };
      });
    },
    [socket, navigation]
  );

  const handleOwnerChanged = useCallback(
    (data: OwnerChangedPayload) => {
      setRoomState((prev) =>
        prev
          ? {
              ...prev,
              ownerId: data.newOwnerId,
              players: data.updatedPlayers,
            }
          : null
      );
    },
    [socket]
  );

  const handleGameStarted = useCallback(
    (data: GameStartedPayload) => {
      setIsLoading(false);

      if (data && data.roomData) {
        setRoomState(data.roomData);
      }

      navigation.navigate({
        name: "MultiPlayerGameScreen",
        params: {
          roomId: roomId,
          roomData: data.roomData || roomState,
        },
      });
    },
    [navigation, roomId, roomState]
  );

  const handleStartError = useCallback((error: ErrorPayload) => {
    showAlert({
      title: "Cannot Start Game",
      message: error.message,
      type: "error",
    });

    setIsLoading(false);
  }, []);

  const handleLeaveError = useCallback((error: ErrorPayload) => {
    showAlert({
      title: "Error Leaving Room",
      message: error.message,
      type: "error",
    });
    setIsLoading(false);
  }, []);

  const handleLeaveRoom = () => {
    if (!socket || !isConnected || !roomId) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MultiplayerLobby" }],
      });
      return;
    }

    setIsLoading(true);
    socket.emit("leave_room", { roomId });
    navigation.reset({
      index: 0,
      routes: [{ name: "MultiplayerLobby" }],
    });
  };

  const handleStartGame = (gameTo: number) => {
    if (!socket || !isConnected || !roomId || !isOwner) return;

    if (gameTo < 1) {
      showToast({
        message: "Target score cannot be less than 1",
        type: "error",
      });
      return;
    }

    if (!roomState) return;

    if (roomState.players.length < 2) {
      showAlert({
        title: "Cannot Start Game",
        message: "Need at least 2 players to start.",
        type: "error",
      });
      return;
    }

    if (roomState.players.length > 4) {
      showAlert({
        title: "Cannot Start Game",
        message: "Maximum 4 players allowed.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    socket.emit("start_game", { roomId, gameTo });
  };

  const handleJoinRequest = (data: {
    requestId: string;
    userId: string;
    playerName: string;
  }) => {
    console.log("[useRoom] Join request received:", data.playerName);
    showAlert({
      title: "Join Request",
      message: `${data.playerName} wants to join the room.`,
      type: "info",
      buttons: [
        {
          text: "Decline",
          negative: true,
          onPress: () => {
            socket?.emit("respond_to_join_request", {
              requestId: data.requestId,
              accepted: false,
            });
          },
        },
        {
          text: "Accept",
          onPress: () => {
            socket?.emit("respond_to_join_request", {
              requestId: data.requestId,
              accepted: true,
            });
          },
        },
      ],
    });
  };

  const handleReadyToggle = (roomId: string, status: PlayerStatus) => {
    socket?.emit("update_player_status", { roomId, status });
  };

  const handlePlayerStatusChanges = (data: {
    userId: string;
    playerName: string;
    newStatus: PlayerStatus;
    updatedPlayers: Player[];
  }) => {
    setRoomState((prev) =>
      prev ? { ...prev, players: data.updatedPlayers } : null
    );
  };

  // useEffect(() => {
  //   socket?.emit("get_room", { roomId });
  // });

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
  };

  const handleMessageReceived = ({ message }: { message: Message }) => {
    setRoomState((prev) => {
      if (!prev) return null;
      return { ...prev, messages: [...prev.messages, message] };
    });
  };

  const sendMessage = (text: string) => {
    const currentUser = roomState?.players.find((p) => p.id === socket?.id);
    if (!currentUser) return;
    const message: Message = {
      senderName: currentUser.name,
      senderId: currentUser.id,
      text: text,
      timestamp: new Date(),
    };
    socket?.emit("send_message", { roomId, message });
  };

  const handlePlayerKicked = ({ message }: { message: string }) => {
    showAlert({
      title: "Player Kicked",
      message,
      type: "error",
    });
    navigation.reset({
      index: 0,
      routes: [{ name: "MultiplayerLobby" }],
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (socket && isConnected && roomId) {
        socket.on("player_joined", handlePlayerJoined);
        socket.on("player_left", handlePlayerLeft);
        socket.on("owner_changed", handleOwnerChanged);
        socket.on("game_started", handleGameStarted);
        socket.on("start_error", handleStartError);
        socket.on("leave_error", handleLeaveError);
        socket.on("join_request", handleJoinRequest);
        socket.on("player_status_changed", handlePlayerStatusChanges);
        socket.on("player_kicked", handlePlayerKicked);
        // socket.on("get_room_response", ({ room }) => {
        //   console.log("[useRoom] Room from get data", room);
        //   setRoomState(room);
        // });
        socket.on("disconnect", handleDisconnect);
        socket.on("message_received", handleMessageReceived);

        return () => {
          socket.off("player_joined", handlePlayerJoined);
          socket.off("player_left", handlePlayerLeft);
          socket.off("owner_changed", handleOwnerChanged);
          socket.off("game_started", handleGameStarted);
          socket.off("start_error", handleStartError);
          socket.off("leave_error", handleLeaveError);
          socket.off("join_request", handleJoinRequest);
          socket.off("player_status_changed", handlePlayerStatusChanges);
          socket.off("disconnect", handleDisconnect);
          socket.off("message_received", handleMessageReceived);
          socket.off("player_kicked", handlePlayerKicked);
          // socket.off("get_room_response");
        };
      }
    }, [
      socket,
      isConnected,
      roomId,
      handlePlayerJoined,
      handlePlayerLeft,
      handleOwnerChanged,
      handleGameStarted,
      handleStartError,
      handleLeaveError,
      handleJoinRequest,
      handlePlayerStatusChanges,
      handleMessageReceived,
      navigation,
    ])
  );
  return {
    roomState,
    isOwner,
    isLoading,
    connectionStatus,
    handleStartGame,
    handleLeaveRoom,
    navigation,
    socket,
    handleReadyToggle,
    handlePlayerStatusChanges,
    sendMessage,
  };
};

export default useRoom;
