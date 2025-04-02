import { useState, useCallback, useEffect } from "react";
import { Alert, BackHandler, ToastAndroid } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSocket } from "../SocketContext";
import { useAuth } from "../AuthContext";
import {
  LobbyRoom,
  Room,
  JoinRequestResponsePayload,
} from "../../server/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
        ToastAndroid.show(
          response.message || "Your request to join the room was declined.",
          100
        );
        // Alert.alert(
        //   "Join Request Declined",
        //   response.message || "Your request to join the room was declined."
        // );
      }
    },
    [navigation]
  );

  const handleJoinError = useCallback(
    (error: { message: string | undefined }) => {
      Alert.alert("Error Joining Room", error.message);
    },
    []
  );

  const handleCreateError = useCallback(
    (error: { message: string | undefined }) => {
      Alert.alert("Error Creating Room", error.message);
    },
    []
  );

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !isConnected) {
      Alert.alert("Not Connected", "Unable to connect to game server.");
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

    // Show loading indicator or message
    ToastAndroid.show("Waiting for room owner to approve your request...", 100);
    // Alert.alert(
    //   "Join Request Sent",
    //   "Waiting for room owner to approve your request..."
    // );

    // Send the join request
    socket.emit("request_join_room", { roomId, playerName, userId });
  };

  const handleCreateRoom = () => {
    if (!socket || !isConnected) {
      Alert.alert("Not Connected", "Unable to connect to game server.");
      return;
    }

    const playerName =
      userData?.displayName || `Player${(Math.random() * 100).toFixed(0)}`;
    const roomName = `${playerName}'s Game`; // You could make this customizable

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
        // console.log("[useLobby] Setting up lobby listeners");
        setIsLoading(true);

        socket.on("lobby_rooms", handleLobbyRoomsUpdate);
        socket.on("room_created", handleRoomCreated);
        socket.on("join_error", handleJoinError);
        socket.on("create_error", handleCreateError);
        socket.on("join_request_response", handleJoinRequestResponse);

        socket.emit("request_lobby_rooms");

        return () => {
          // console.log("[useLobby] Cleaning up lobby listeners");
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
