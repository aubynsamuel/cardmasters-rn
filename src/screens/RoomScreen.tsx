import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
  RouteProp,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSocket } from "../SocketContext";
import {
  Player,
  Room,
  OwnerChangedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  GameStartedPayload,
  ErrorPayload,
} from "../Types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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

const RoomScreen = () => {
  const route = useRoute<RoomScreenRouteProp>();
  const navigation = useNavigation<RoomNavigation>();
  const { socket, isConnected } = useSocket();
  const { roomId, initialRoomData } = route.params;
  const [roomState, setRoomState] = useState<Room | null>(
    initialRoomData || null
  );
  // console.log("Room Data:", initialRoomData);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >(isConnected ? "connected" : "connecting");

  useEffect(() => {
    if (roomState && socket) {
      setIsOwner(roomState.ownerId === socket.id);
      navigation.setOptions({ title: roomState.name });
    }
  }, [roomState, socket, navigation]);

  useEffect(() => {
    setConnectionStatus(isConnected ? "connected" : "disconnected");

    if (!isConnected && connectionStatus === "connected") {
      Alert.alert(
        "Connection Lost",
        "Lost connection to the game server. Returning to lobby.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "MultiplayerLobby" }],
              }),
          },
        ]
      );
    }
  }, [isConnected, connectionStatus, navigation]);

  useEffect(() => {
    const onBackPress = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MultiplayerLobby" }],
      });
      console.log("Hardware Back Press From RoomScreen");
      socket?.emit("leave_room", { roomId });
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  const handlePlayerJoined = useCallback((data: PlayerJoinedPayload) => {
    console.log("Player joined:", data.playerName);
    setRoomState((prev) =>
      prev ? { ...prev, players: data.updatedPlayers } : null
    );
  }, []);

  const handlePlayerLeft = useCallback(
    (data: PlayerLeftPayload) => {
      if (data.userId !== socket?.id) {
        // TODO: Make a toast
        Alert.alert("Player left", `${data.playerName} left the room`);
        console.log("You are no longer in the room.");
      }

      setRoomState((prev) => {
        if (!prev) return null;
        return { ...prev, players: data.updatedPlayers };
      });
    },
    [socket, navigation]
  );

  const handleOwnerChanged = useCallback(
    (data: OwnerChangedPayload) => {
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
    (data: GameStartedPayload) => {
      // console.log("Game Started! Navigating...", data);
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
    Alert.alert("Cannot Start Game", error.message);
    setIsLoading(false);
  }, []);

  const handleLeaveError = useCallback((error: ErrorPayload) => {
    Alert.alert("Error Leaving Room", error.message);
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

  const handleStartGame = () => {
    if (!socket || !isConnected || !roomId || !isOwner) return;

    if (!roomState) return;

    if (roomState.players.length < 2) {
      Alert.alert("Cannot Start Game", "Need at least 2 players to start.");
      return;
    }

    if (roomState.players.length > 4) {
      Alert.alert("Cannot Start Game", "Maximum 4 players allowed.");
      return;
    }

    setIsLoading(true);
    socket.emit("start_game", { roomId });
  };

  useFocusEffect(
    useCallback(() => {
      if (socket && isConnected && roomId) {
        // console.log(`Setting up room listeners for ${roomId}`);

        socket.on("player_joined", handlePlayerJoined);
        socket.on("player_left", handlePlayerLeft);
        socket.on("owner_changed", handleOwnerChanged);
        socket.on("game_started", handleGameStarted);
        socket.on("start_error", handleStartError);
        socket.on("leave_error", handleLeaveError);

        const handleDisconnect = () => {
          setConnectionStatus("disconnected");
          Alert.alert(
            "Disconnected",
            "Lost connection to the game server. Returning to lobby.",
            [
              {
                text: "OK",
                onPress: () =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MultiplayerLobby" }],
                  }),
              },
            ]
          );
        };

        socket.on("disconnect", handleDisconnect);

        return () => {
          // console.log(`Cleaning up room listeners for ${roomId}`);
          socket.off("player_joined", handlePlayerJoined);
          socket.off("player_left", handlePlayerLeft);
          socket.off("owner_changed", handleOwnerChanged);
          socket.off("game_started", handleGameStarted);
          socket.off("start_error", handleStartError);
          socket.off("leave_error", handleLeaveError);
          socket.off("disconnect", handleDisconnect);
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
      navigation,
    ])
  );

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <View style={styles.playerItem}>
      <Ionicons
        name="person-circle-outline"
        size={24}
        color="#e0f2e9"
        style={styles.playerIcon}
      />
      <Text style={styles.playerName}>{item.name}</Text>
      {roomState && item.id === roomState.ownerId && (
        <Text style={styles.ownerText}>(Owner)</Text>
      )}
      {item.id === socket?.id && <Text style={styles.youText}>(You)</Text>}
    </View>
  );

  if (connectionStatus === "disconnected") {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="wifi-outline" size={40} color="#e57373" />
        <Text style={styles.errorText}>Connection Lost</Text>
        <Text style={styles.subErrorText}>Returning to lobby...</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MultiplayerLobby" }],
            })
          }
        >
          <LinearGradient
            colors={["#4CAF50", "#2E7D32"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Return to Lobby</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!roomState) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Room...</Text>
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

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}

      <FlatList
        data={roomState.players}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id.toString()}
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
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.waitingText}>
              Waiting for the owner to start...
            </Text>
          </View>
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
    backgroundColor: "#1a2a1f",
    padding: 20,
    paddingTop: 40,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#1a2a1f",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    color: "#b0e0b0",
    textAlign: "center",
    marginBottom: 20,
  },
  playerList: {
    flex: 1,
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
    flex: 1,
  },
  ownerText: {
    fontSize: 12,
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: 5,
  },
  youText: {
    fontSize: 12,
    color: "#81D4FA",
    fontWeight: "bold",
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.8,
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
  waitingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  waitingText: {
    color: "#a0a0a0",
    fontSize: 14,
    textAlign: "center",
    marginLeft: 10,
    fontStyle: "italic",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "#e57373",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  subErrorText: {
    color: "#a0a0a0",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default RoomScreen;
