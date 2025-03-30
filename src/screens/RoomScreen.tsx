import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSocket } from "../SocketContext";
import { Player } from "../Types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Interface for room data
interface RoomData {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: "waiting" | "playing" | "full";
  ownerId: string;
}

type RootStackParamList = {
  RoomScreen: {
    roomId: string;
    initialRoomData: RoomData;
  };
  MultiplayerLobby: undefined;
  MultiPlayerGameScreen: {
    roomId: string;
    roomData: RoomData;
  };
};

type RoomNavigation = NativeStackNavigationProp<
  RootStackParamList,
  "RoomScreen" | "MultiplayerLobby" | "MultiPlayerGameScreen"
>;

const RoomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<RoomNavigation>();
  const { socket, isConnected } = useSocket();

  const { roomId, initialRoomData } = route.params;

  const [roomState, setRoomState] = useState(initialRoomData);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set header title and determine if the current user is the room owner
  useEffect(() => {
    if (roomState && socket) {
      setIsOwner(roomState.ownerId === socket.id);
      navigation.setOptions({ title: roomState.name });
    } else if (!isConnected) {
      Alert.alert("Disconnected", "Lost connection. Returning to lobby.");
      navigation.navigate("MultiplayerLobby");
    }
  }, [roomState, socket, isConnected, navigation, roomId]);

  // Remove the player from the room when navigating away if still waiting
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      // Only leave if the game hasn't started (i.e. still waiting)
      if (roomState && roomState.status === "waiting" && socket) {
        socket.emit("leave_room", { roomId });
      }
    });
    return unsubscribe;
  }, [navigation, roomState, socket, roomId]);

  // Socket event handlers
  const handlePlayerJoined = useCallback((data) => {
    console.log("Player joined:", data.playerName);
    setRoomState((prev) =>
      prev ? { ...prev, players: data.updatedPlayers } : null
    );
  }, []);

  const handlePlayerLeft = useCallback(
    (data) => {
      console.log("Player left:", data.playerName);

      if (data.userId === socket?.id) {
        Alert.alert("Removed", "You are no longer in the room.");
        navigation.navigate("MultiplayerLobby");
        return;
      }

      setRoomState((prev) => {
        if (!prev) return null;
        return { ...prev, players: data.updatedPlayers };
      });
    },
    [socket, navigation]
  );

  const handleOwnerChanged = useCallback(
    (data) => {
      console.log("Owner changed to:", data.newOwnerId);
      setRoomState((prev) =>
        prev
          ? {
              ...prev,
              ownerId: data.newOwnerId,
              players: data.updatedPlayers,
            }
          : null
      );

      if (socket) {
        const newIsOwner = data.newOwnerId === socket.id;
        setIsOwner(newIsOwner);

        if (newIsOwner) {
          Alert.alert("Ownership Change", "You are now the room owner.");
        }
      }
    },
    [socket]
  );

  const handleGameStarted = useCallback(
    (data) => {
      console.log("Game Started! Navigating...", data);

      // Update room state with latest data from server
      if (data && data.roomData) {
        setRoomState(data.roomData);
      }

      // Navigate to game screen with the room data
      navigation.navigate("MultiPlayerGameScreen", {
        roomId: roomId,
        roomData: data.roomData || roomState,
      });
    },
    [navigation, roomId, roomState]
  );

  const handleStartError = useCallback(
    (error: { message: string | undefined }) => {
      Alert.alert("Cannot Start Game", error.message);
      setIsLoading(false);
    },
    []
  );

  const handleLeaveError = useCallback(
    (error: { message: string | undefined }) => {
      Alert.alert("Error Leaving Room", error.message);
      setIsLoading(false);
    },
    []
  );

  // Set up socket listeners when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (socket && isConnected && roomId) {
        console.log(`Setting up room listeners for ${roomId}`);

        socket.on("player_joined", handlePlayerJoined);
        socket.on("player_left", handlePlayerLeft);
        socket.on("owner_changed", handleOwnerChanged);
        socket.on("game_started", handleGameStarted);
        socket.on("start_error", handleStartError);
        socket.on("leave_error", handleLeaveError);

        const handleDisconnect = () => {
          Alert.alert("Disconnected", "Lost connection. Returning to lobby.");
          navigation.navigate("MultiplayerLobby");
        };
        socket.on("disconnect", handleDisconnect);

        return () => {
          console.log(`Cleaning up room listeners for ${roomId}`);
          socket.off("player_joined", handlePlayerJoined);
          socket.off("player_left", handlePlayerLeft);
          socket.off("owner_changed", handleOwnerChanged);
          socket.off("game_started", handleGameStarted);
          socket.off("start_error", handleStartError);
          socket.off("leave_error", handleLeaveError);
          socket.off("disconnect", handleDisconnect);
        };
      } else if (!isConnected) {
        Alert.alert("Disconnected", "Lost connection. Returning to lobby.");
        navigation.navigate("MultiplayerLobby");
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
      navigation,
    ])
  );

  const handleLeaveRoom = () => {
    if (!socket || !isConnected || !roomId) return;
    setIsLoading(true);
    socket.emit("leave_room", { roomId });
    navigation.navigate("MultiplayerLobby");
  };

  const handleStartGame = () => {
    if (!socket || !isConnected || !roomId || !isOwner) return;
    setIsLoading(true);
    socket.emit("start_game", { roomId });
  };

  // Render a player item
  const renderPlayerItem = ({ item }) => (
    <View style={styles.playerItem}>
      <Ionicons
        name="person-circle-outline"
        size={24}
        color="#e0f2e9"
        style={styles.playerIcon}
      />
      <Text style={styles.playerName}>{item.name}</Text>
      {item.id === roomState?.ownerId && (
        <Text style={styles.ownerText}>(Owner)</Text>
      )}
      {item.id === socket?.id && <Text style={styles.youText}>(You)</Text>}
    </View>
  );

  // Loading state
  if (!roomState) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading Room...</Text>
      </View>
    );
  }

  const canStartGame =
    isOwner && roomState.players.length >= 2 && roomState.players.length <= 4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting Room</Text>
      <Text style={styles.roomNameText}>Room: {roomState.name}</Text>
      <Text style={styles.playerCountText}>
        Players: {roomState.players.length} / {roomState.maxPlayers}
      </Text>

      <FlatList
        data={roomState.players}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        style={styles.playerList}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.buttonContainer}>
        {isOwner && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              !canStartGame && styles.disabledButton,
            ]}
            onPress={handleStartGame}
            disabled={!canStartGame || isLoading}
          >
            <LinearGradient
              colors={
                canStartGame ? ["#4CAF50", "#2E7D32"] : ["#9E9E9E", "#616161"]
              }
              style={styles.buttonGradient}
            >
              <Ionicons
                name="play-circle-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {roomState.players.length < 2
                  ? "Need More Players"
                  : "Start Game"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {!isOwner && (
          <Text style={styles.waitingText}>
            Waiting for the owner to start...
          </Text>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLeaveRoom}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#f44336", "#c62828"]}
            style={styles.buttonGradient}
          >
            <Ionicons
              name="exit-outline"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Leave Room</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a2a1f", // Dark background consistent with lobby
    padding: 20,
    paddingTop: 40, // Adjust as needed
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  roomNameText: {
    fontSize: 16,
    color: "#e0f2e9",
    textAlign: "center",
    marginBottom: 5,
  },
  playerCountText: {
    fontSize: 18,
    color: "#b0e0b0", // Light green
    textAlign: "center",
    marginBottom: 20,
  },
  playerList: {
    flex: 1, // Takes up available space before buttons
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  playerIcon: {
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
    color: "#ffffff",
    flex: 1, // Allow name to take space
  },
  ownerText: {
    fontSize: 12,
    color: "#FFD700", // Gold color for owner
    fontWeight: "bold",
    marginLeft: 5,
  },
  youText: {
    fontSize: 12,
    color: "#81D4FA", // Light blue for "You"
    fontWeight: "bold",
    marginLeft: 5,
  },
  buttonContainer: {
    // Buttons at the bottom
  },
  actionButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },
  disabledButton: {
    // Optionally reduce opacity further or change background if not using gradient change
    // opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  waitingText: {
    color: "#a0a0a0",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
});

export default RoomScreen;
