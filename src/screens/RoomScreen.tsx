import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useRoom from "../hooks/useRoom";
import RoomChatComponent from "../components/RoomChatComponent";
import { useCustomAlerts } from "../context/CustomAlertsContext";
import { Player, PlayerStatus } from "../types/ServerPayloadTypes";

const RoomScreen = () => {
  const {
    roomState,
    isOwner,
    isLoading,
    connectionStatus,
    handleStartGame,
    handleLeaveRoom,
    handleReadyToggle,
    socket,
    navigation,
    sendMessage,
  } = useRoom();
  const [gameTo, setGameTo] = useState(5);
  const [showChat, setShowChat] = useState(false);
  const [showUnreadBadge, setShowUnreadBadge] = useState(false);
  const { showToast } = useCustomAlerts();

  useEffect(() => {
    if (!roomState || roomState.messages.length < 1) {
      setShowUnreadBadge(false);
      return;
    }
    if (
      roomState?.messages?.length > 0 &&
      roomState?.messages[roomState.messages.length - 1]?.senderId !==
        socket?.id
    ) {
      setShowUnreadBadge(true);
    }
  }, [roomState?.messages]);

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.playerItem}
      onLongPress={() => {
        if (isOwner && item.id !== socket?.id) {
          socket?.emit("kick_player", { playerToKickId: item.id });
        }
      }}
      activeOpacity={0.7}
      onPress={() => {
        if (isOwner && item.id !== socket?.id) {
          showToast({
            message: "Long press to kick player from the room",
            duration: 2000,
            type: "info",
          });
        }
      }}
    >
      <Ionicons
        name="person-circle-outline"
        size={24}
        color="#e0f2e9"
        style={styles.playerIcon}
      />
      <Text style={styles.playerName}>{item.name}</Text>
      <Text style={styles.playerStatus}>{item.status}</Text>
      {roomState && item.id === roomState.ownerId && (
        <Text style={styles.ownerText}>(Owner)</Text>
      )}
      {item.id === socket?.id && <Text style={styles.youText}>(You)</Text>}
    </TouchableOpacity>
  );

  if (connectionStatus === "disconnected") {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="wifi-outline" size={40} color="#e57373" />
        <Text style={styles.errorText}>Connection Lost</Text>
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
        <ActivityIndicator size="large" color="#4CAF59" />
        <Text style={styles.loadingText}>Loading Room...</Text>
      </View>
    );
  }

  const canStartGame =
    isOwner &&
    roomState.players.length >= 2 &&
    roomState.players.length <= 4 &&
    roomState.players.every((p) => p.status === PlayerStatus.READY);

  const currentPlayer = roomState.players.find((p) => p.id === socket?.id);
  const playerReady = currentPlayer?.status === PlayerStatus.READY;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#1a2a1f" }}
      contentContainerStyle={{ backgroundColor: "yellow" }}
    >
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
        {isOwner && (
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              marginVertical: 20,
            }}
          >
            <Text style={styles.gameToLabel}>Select Target Score :</Text>
            <TextInput
              inputMode="numeric"
              style={styles.gameToInput}
              value={gameTo.toString()}
              onChangeText={(text) => setGameTo(Number(text))}
              placeholder={gameTo.toString()}
              placeholderTextColor={"white"}
              keyboardType="numeric"
            />
          </View>
        )}

        <FlatList
          data={roomState.players}
          renderItem={renderPlayerItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.playerList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {!isOwner && playerReady && (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.waitingText}>
              Waiting for the owner to start...
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isOwner ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                !canStartGame && styles.disabledButton,
              ]}
              onPress={() => handleStartGame(gameTo)}
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
                <Text style={styles.buttonText}>Start Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                !playerReady && styles.disabledButton,
              ]}
              onPress={() =>
                handleReadyToggle(
                  roomState.id,
                  currentPlayer?.status !== PlayerStatus.READY
                    ? PlayerStatus.READY
                    : PlayerStatus.NOT_READY
                )
              }
            >
              <LinearGradient
                colors={
                  playerReady ? ["#4CAF50", "#2E7D32"] : ["#9E9E9E", "#616161"]
                }
                style={styles.buttonGradient}
              >
                <FontAwesome
                  name="gamepad"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Ready</Text>
              </LinearGradient>
            </TouchableOpacity>
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
        {roomState && (
          <>
            {/* Chat toggle button*/}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => {
                setShowChat(true);
                setShowUnreadBadge(false);
              }}
            >
              <LinearGradient
                colors={["#4CAF50", "#2E7D32"]}
                style={styles.chatButtonGradient}
              >
                <Ionicons name="chatbubble-outline" size={30} color="white" />
                {showUnreadBadge && <View style={styles.badgeContainer} />}
              </LinearGradient>
            </TouchableOpacity>

            {/* Chat component */}
            {showChat && (
              <RoomChatComponent
                messages={roomState.messages}
                currentUserId={currentPlayer?.id}
                onSendMessage={sendMessage}
                onDismiss={() => {
                  setShowChat(false);
                  setShowUnreadBadge(false);
                }}
              />
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
  playerStatus: {
    fontSize: 16,
    color: "#ffffff",
    marginHorizontal: 5,
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
  gameToLabel: {
    padding: 10,
    color: "white",
    fontWeight: "bold",
  },
  gameToInput: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    color: "white",
    fontWeight: "bold",
    width: 50,
    textAlign: "center",
  },
  chatButton: {
    position: "absolute",
    top: "50%",
    right: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 4,
  },
  chatButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default RoomScreen;
