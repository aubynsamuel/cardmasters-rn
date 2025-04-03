import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LobbyRoom } from "../Types";
import { useLobby } from "../customHooks/useLobby";

interface RoomItemProps {
  item: LobbyRoom;
}

const MultiplayerLobbyScreen = () => {
  const {
    handleCreateRoom,
    handleJoinRoom,
    handleRefresh,
    isLoading,
    rooms,
    isConnected,
    navigation,
  } = useLobby();

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
                : item.status === "playing"
                ? ["#2196F3", "#1565C0"]
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
      {/* Background decorative elements */}
      <View style={styles.decorationContainer}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              style={[
                styles.cardDecoration,
                {
                  top: 100 + i * 120,
                  left: i % 2 === 0 ? -20 : Dimensions.get("window").width - 40,
                  transform: [{ rotate: `${i * 35}deg` }],
                  opacity: 0.15,
                },
              ]}
            />
          ))}
      </View>

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MainMenu" as never }],
            })
          }
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

      {/* Room List */}
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
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  cardDecoration: {
    position: "absolute",
    width: 80,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
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
