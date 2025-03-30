import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSocket } from "../SocketContext";
import { useAuth } from "../AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Player } from "../Types";

// Room interface
interface LobbyRoom {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "playing" | "full";
}

type RootStackParamList = {
  RoomScreen: {
    roomId: string;
    initialRoomData: {
      id: string;
      name: string;
      players: Player[];
      maxPlayers: number;
      status: string;
      ownerId: string;
    };
  };
};

type LobbyNavigation = NativeStackNavigationProp<
  RootStackParamList,
  "RoomScreen"
>;

interface RoomItemProps {
  item: LobbyRoom;
}

const MultiplayerLobbyScreen = () => {
  const navigation = useNavigation<LobbyNavigation>();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track the room the user is already in (if any)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();
  const { userData } = useAuth();

  // Socket event handlers
  const handleLobbyRoomsUpdate = useCallback(
    (updatedRooms: React.SetStateAction<LobbyRoom[]>) => {
      setRooms(updatedRooms);
      setIsLoading(false);
    },
    []
  );

  const handleRoomJoined = useCallback(
    ({
      roomId,
      room,
    }: {
      roomId: string;
      room: {
        id: string;
        name: string;
        players: Player[];
        maxPlayers: number;
        status: string;
        ownerId: string;
      };
    }) => {
      console.log(`Joined room ${roomId}`);
      setCurrentRoomId(roomId);
      navigation.navigate("RoomScreen", {
        roomId,
        initialRoomData: room,
      });
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

  // Set up socket listeners when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (socket && isConnected) {
        console.log("Setting up lobby listeners");
        setIsLoading(true);

        socket.on("lobby_rooms", handleLobbyRoomsUpdate);
        socket.on("room_joined", handleRoomJoined);
        socket.on("join_error", handleJoinError);
        socket.on("create_error", handleCreateError);

        // Immediately request the latest lobby rooms
        socket.emit("request_lobby_rooms");

        return () => {
          console.log("Cleaning up lobby listeners");
          socket.off("lobby_rooms", handleLobbyRoomsUpdate);
          socket.off("room_joined", handleRoomJoined);
          socket.off("join_error", handleJoinError);
          socket.off("create_error", handleCreateError);
        };
      } else {
        setIsLoading(false);
        setRooms([]);
      }
    }, [
      socket,
      isConnected,
      handleLobbyRoomsUpdate,
      handleRoomJoined,
      handleJoinError,
      handleCreateError,
    ])
  );

  // Actions
  const handleCreateRoom = () => {
    if (socket && isConnected) {
      const playerName = userData?.displayName || "Player";
      socket.emit("create_room", { playerName });
    } else {
      Alert.alert("Not Connected", "Unable to connect to game server.");
    }
  };

  const handleJoinRoom = (roomId: string) => {
    // If the user is already in the room, navigate directly
    if (currentRoomId === roomId) {
      navigation.reset({
        index: 0,
        routes: [{ name: "RoomScreen", params: { roomId } }],
      });
    } else if (socket && isConnected) {
      const playerName = userData?.displayName || "Player";
      socket.emit("join_room", { roomId, playerName });
    } else {
      Alert.alert("Not Connected", "Unable to connect to game server.");
    }
  };

  // Refresh room list
  const handleRefresh = () => {
    if (socket && isConnected) {
      setIsLoading(true);
      socket.emit("request_lobby_rooms");
    }
  };

  // Render a room item
  const renderRoomItem = ({ item }: RoomItemProps) => (
    <TouchableOpacity
      style={styles.roomItemContainer}
      onPress={() => handleJoinRoom(item.id)}
      disabled={item.status !== "waiting"}
    >
      <LinearGradient
        colors={
          item.status === "waiting"
            ? ["#4CAF50", "#2E7D32"]
            : ["#757575", "#424242"]
        }
        style={styles.roomItemGradient}
      >
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomPlayers}>
            Players: {item.players} / {item.maxPlayers}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={
              item.status === "waiting"
                ? ["#FFA000", "#FF6F00"]
                : ["#757575", "#424242"]
            }
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#076324", "#076345"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Game Lobby</Text>
          <Text style={styles.connectionStatus}>
            Status: {isConnected ? "Connected" : "Disconnected"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={!isConnected}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={styles.loader}
          />
        ) : rooms.length === 0 && isConnected ? (
          <Text style={styles.noRoomsText}>
            No available rooms. Create one!
          </Text>
        ) : !isConnected ? (
          <Text style={styles.noRoomsText}>Connecting to server...</Text>
        ) : (
          <FlatList
            data={rooms}
            renderItem={renderRoomItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
          />
        )}
      </View>

      {/* Create Room Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createRoomButton}
          onPress={handleCreateRoom}
          disabled={!isConnected}
        >
          <LinearGradient
            colors={
              isConnected ? ["#1E88E5", "#0D47A1"] : ["#BDBDBD", "#9E9E9E"]
            }
            style={styles.createButtonGradient}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="#ffffff"
              style={styles.buttonIcon}
            />
            <Text style={styles.createButtonText}>Create Room</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  contentContainer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  connectionStatus: {
    color: "#FFF",
    textAlign: "center",
    marginTop: 5,
    opacity: 0.8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  roomItemContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  roomItemGradient: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 5,
  },
  roomPlayers: {
    fontSize: 14,
    color: "#e0f2e9",
  },
  badgeContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  badgeGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  buttonContainer: {
    padding: 20,
  },
  createRoomButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  noRoomsText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#e0f2e9",
  },
});

export default MultiplayerLobbyScreen;
