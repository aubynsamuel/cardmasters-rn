import { useState, useCallback, useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { JoinRequestResponsePayload, LobbyRoom, Room } from "../types/Types";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useCustomAlerts } from "../context/CustomAlertsContext";

type RoomJoined = {
  roomId: string;
  room: Room;
};

type RootStackParamList = {
  RoomScreen: RoomJoined;
};

type LobbyNavigation = NativeStackNavigationProp<
  RootStackParamList,
  "RoomScreen"
>;

export const useLobby = () => {
  const navigation = useNavigation<LobbyNavigation>();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinRequests, setJoinRequests] = useState<Record<string, string>>({});
  const { socket, isConnected } = useSocket();
  const { userData, userId } = useAuth();
  const { showAlert, showToast } = useCustomAlerts();

  useEffect(() => {
    const onBackPress = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainMenu" as never }],
      });
      console.log("[useLobby] Hardware Back Press From Lobby");
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  const handleLobbyRoomsUpdate = useCallback((updatedRooms: LobbyRoom[]) => {
    setRooms(updatedRooms);
    setIsLoading(false);
  }, []);

  const handleRoomCreated = useCallback(
    ({ roomId, room }: RoomJoined) => {
      // Event handler for creating and joining a room
      console.log(`[useLobby] Joined room ${roomId}`);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "RoomScreen",
            params: {
              roomId,
              initialRoomData: room,
            },
          },
        ],
      });
    },
    [navigation]
  );

  const handleJoinRequestResponse = useCallback(
    (response: JoinRequestResponsePayload) => {
      // Remove from pending requests
      setJoinRequests((prev) => {
        const updated = { ...prev };
        delete updated[response.requestId];
        return updated;
      });

      if (response.accepted && response.roomId && response.roomData) {
        console.log(
          `[useLobby] Join request accepted for room ${response.roomId}`
        );
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "RoomScreen",
              params: {
                roomId: response.roomId,
                initialRoomData: response.roomData,
              },
            },
          ],
        });
      } else {
        showToast({
          message:
            response.message || "Your request to join the room was declined.",
          type: "error",
        });
      }
    },
    [navigation]
  );

  const handleJoinError = useCallback(
    (error: { message: string | undefined }) => {
      showAlert({
        title: "Error Joining Room",
        message: error.message || "An unknown error occurred.",
        type: "error",
      });
    },
    []
  );

  const handleCreateError = useCallback(
    (error: { message: string | undefined }) => {
      showAlert({
        title: "Error Creating Room",
        message: error.message || "An unknown error occurred.",
        type: "error",
      });
    },
    []
  );

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !isConnected) {
      showAlert({
        title: "Not Connected",
        message: "Unable to connect to game server.",
        type: "error",
      });

      return;
    }
    const playerName =
      userData?.displayName || `Player${(Math.random() * 100).toFixed(0)}`;

    // Save this request in our local state
    const requestKey = `${roomId}_${Date.now()}`;
    setJoinRequests((prev) => ({
      ...prev,
      [requestKey]: roomId,
    }));

    showToast({
      message: "Waiting for room owner to approve your request...",
      type: "info",
      duration: 2000,
    });

    socket.emit("request_join_room", { roomId, playerName, userId });
  };

  const handleCreateRoom = () => {
    if (!socket || !isConnected) {
      showAlert({
        title: "Not Connected",
        message: "Unable to connect to game server",
        type: "error",
      });
      return;
    }

    const playerName =
      userData?.displayName || `Player${(Math.random() * 100).toFixed(0)}`;
    const roomName = `${playerName}'s Game`;

    socket.emit("create_room", { playerName, roomName, userId });
  };

  const handleRefresh = () => {
    if (socket && isConnected) {
      setIsLoading(true);
      socket.emit("request_lobby_rooms");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (socket && isConnected) {
        setIsLoading(true);

        socket.on("lobby_rooms", handleLobbyRoomsUpdate);
        socket.on("room_created", handleRoomCreated);
        socket.on("join_error", handleJoinError);
        socket.on("create_error", handleCreateError);
        socket.on("join_request_response", handleJoinRequestResponse);

        socket.emit("request_lobby_rooms");

        return () => {
          socket.off("lobby_rooms", handleLobbyRoomsUpdate);
          socket.off("room_created", handleRoomCreated);
          socket.off("join_error", handleJoinError);
          socket.off("create_error", handleCreateError);
          socket.off("join_request_response", handleJoinRequestResponse);
        };
      } else {
        setIsLoading(false);
        setRooms([]);
      }
    }, [
      socket,
      isConnected,
      handleLobbyRoomsUpdate,
      handleRoomCreated,
      handleJoinError,
      handleCreateError,
      handleJoinRequestResponse,
    ])
  );

  return {
    rooms,
    isLoading,
    handleJoinRoom,
    handleCreateRoom,
    handleRefresh,
    isConnected,
    navigation,
    pendingRequests: Object.keys(joinRequests).length > 0,
  };
};

export default useLobby;
