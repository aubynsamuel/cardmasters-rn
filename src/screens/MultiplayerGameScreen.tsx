import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  BackHandler,
  Alert,
  ToastAndroid,
} from "react-native";
import getStyles from "../Styles";
import { StatusBar } from "expo-status-bar";
import CardComponent from "../components/CardComponent";
import GameHistory from "../components/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FlipInEasyX,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import ShufflingAnimation from "../components/ShufflingAnimations";
import EmptyCard from "../components/EmptySlotCard";
import SlotCard from "../components/SlotCard";
import OpponentCard from "../components/OpponentCard";
import TopRow from "../components/TopRow";
import GameControls from "../components/GameControls";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AccumulatedScoreDisplay from "../components/AccumulatedScoreDisplay";
import {
  CardsGameState,
  GameScore,
  GameStartedPayload,
  Player,
  PlayerLeftPayload,
  validPlay,
} from "../Types";
import { useSocket } from "../SocketContext";
import { useAuth } from "../AuthContext";

type GameScreenStackParamList = {
  RoomScreen: GameStartedPayload;
  GameOver: {
    winner: Player;
    score: GameScore[];
    isCurrentPlayer: boolean;
    isMultiPlayer: boolean;
  };
};

type GameScreenProps = NativeStackNavigationProp<
  GameScreenStackParamList,
  "GameOver",
  "RoomScreen"
>;

const MultiPlayerGameScreen = () => {
  const navigation = useNavigation<GameScreenProps>();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { isConnected, socket, socketId } = useSocket();
  const { userId } = useAuth();
  const { roomId, roomData } = route.params as GameStartedPayload;
  const [gameState, setGameState] = useState<CardsGameState | null>(null);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // console.log("[MultiPlayerGameScreen] ", gameState);
  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("game_state_update", handleGameStateUpdate);
      socket.on("player_left", handlePlayerLeft);
      socket.on("play_error", handlePlayError);
      socket.on("disconnect", handleDisconnect);

      return () => {
        socket.off("game_state_update", handleGameStateUpdate);
        socket.off("player_left", handlePlayerLeft);
        socket.off("play_error", handlePlayError);
        socket.off("disconnect", handleDisconnect);
      };
    }
  }, [socket, isConnected, roomId]);

  const handlePlayError = ({ valid }: validPlay) => {
    // Alert.alert(valid.error, valid.message);
    ToastAndroid.show(valid.message, 100);
  };

  const handleGameStateUpdate = (newState: CardsGameState) => {
    setGameState((prev) => ({ ...prev, ...newState }));
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnected",
      "Lost connection to the game server. Returning to lobby.",
      [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MultiplayerLobby" as never }],
            }),
        },
      ]
    );
  };

  const handlePlayerLeft = (data: PlayerLeftPayload) => {
    console.log(
      "[MultiPlayerGameScreen] Player left:",
      data.playerName,
      "From GameScreen"
    );

    if (data.userId !== socket?.id) {
      console.log("[MultiPlayerGameScreen] Another player left");
      if (data.updatedPlayers && data.updatedPlayers.length >= 2) {
        console.log(
          "[MultiPlayerGameScreen] Game will continue with",
          data.updatedPlayers.length,
          "players"
        );
        Alert.alert(
          `${data.playerName} left the game`,
          "Game will continue with the remaining players."
        );
        setGameState((prevState) => {
          if (!prevState) return null;
          return {
            ...prevState,
            players: data.updatedPlayers,
          };
        });
      } else {
        console.log("[MultiPlayerGameScreen] Not enough players to continue");
        Alert.alert(
          `${data.playerName} left the game`,
          "Not enough players to continue. Returning to lobby.",
          [
            {
              text: "OK",
              onPress: () => {
                socket?.emit("leave_room", { roomId });
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MultiplayerLobby" as never }],
                });
              },
            },
          ]
        );
      }
    }
  };

  const QuitGameAlert = () => {
    Alert.alert("Quit Game", "Do you want to quit game", [
      { text: "No", onPress: () => {} },
      {
        text: "Yes",
        onPress: () => {
          socket?.emit("leave_room", { roomId });
          navigation.reset({
            index: 0,
            routes: [{ name: "MultiplayerLobby" as never }],
          });
        },
      },
    ]);
  };

  useEffect(() => {
    const onBackPress = () => {
      QuitGameAlert();
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  useEffect(() => {
    if (!gameState) return;

    const currentPlayer = gameState.players.find(
      (player) => player.id === userId || player.id === socketId
    );

    const opponentPlayer = gameState.players.find(
      (player) => player.id !== userId && player.id !== socketId
    );

    if (!currentPlayer || !opponentPlayer) return;

    if (gameState.players.some((p) => p.score >= gameState.gameTo)) {
      socket?.emit("game_ended", { roomId });
      const gameScoreList = gameState.players.map((player) => ({
        playerName: player.name,
        score: player.score,
      }));
      if (gameState.gameOverData) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "GameOver",
              params: {
                winner: gameState.gameOverData.winner,
                isCurrentPlayer:
                  gameState.gameOverData.winner.id === currentPlayer?.id,
                isMultiPlayer: true,
                score: gameScoreList,
                roomId: roomId,
                initialRoomData: roomData,
              },
            },
          ],
        });
      }
    }
  }, [gameState?.cardsPlayed, gameState?.players]);

  useEffect(() => {
    if (!gameState || !gameState.currentControl) return;

    const currentPlayer = gameState.players.find(
      (player) => player.id === userId || player.id === socketId
    );

    const opponentPlayer = gameState.players.find(
      (player) => player.id !== userId && player.id !== socketId
    );

    if (gameState.currentControl.id === opponentPlayer?.id)
      computerControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      computerControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });

    if (gameState.currentControl.id === currentPlayer?.id)
      humanControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      humanControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });
  }, [gameState?.currentControl, gameState?.players, userId, socketId]);

  if (isLoading || !gameState || !gameState.players) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "green",
        }}
      >
        <Text style={styles.message}>Loading game...</Text>
      </View>
    );
  }

  const currentUser = gameState.players.find(
    (player) => player.id === userId || player.id === socketId
  ) || {
    name: "You",
    id: "player1",
    hands: [],
    score: 0,
  };

  const opponent = gameState.players.find(
    (player) => player.id !== userId && player.id !== socketId
  ) || {
    name: "Opponent",
    id: "player2",
    hands: [],
    score: 0,
  };

  const gameScoreList = gameState.players.map((player) => ({
    playerName: player.name,
    score: player.score,
  }));

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="transparent" style="light" hidden={true} />

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
                    left: i % 2 === 0 ? -20 : width - 40,
                    transform: [{ rotate: `${i * 35}deg` }],
                    opacity: 0.15,
                  },
                ]}
              />
            ))}
        </View>

        {gameState.isShuffling && (
          <View style={styles.animationOverlay}>
            <ShufflingAnimation />
          </View>
        )}

        {gameState.isDealing && (
          <View style={styles.animationOverlay}>
            <Text style={styles.dealingText}>Dealing Cards...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControlsOverlay && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.overlayContainer}
            onPress={() => setShowControlsOverlay(false)}
          >
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Game Controls</Text>
                <TouchableOpacity onPress={() => setShowControlsOverlay(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <GameControls
                showStartButton={gameState.showStartButton}
                gameOver={gameState.gameOver}
                onClose={() => setShowControlsOverlay(false)}
                onQuitGame={QuitGameAlert}
                isMultiPlayer={true}
              />
            </View>
          </TouchableOpacity>
        )}

        <TopRow
          deck={gameState.deck || []}
          setShowControlsOverlay={(value) => setShowControlsOverlay(value)}
          gameScoreList={gameScoreList}
          gameTo={gameState.gameTo}
        />

        {/* MAIN GAME AREA */}
        <View style={styles.mainGameArea}>
          {/* Opponents's Hand at the Top */}
          <View style={[styles.computerSection]}>
            <AccumulatedScoreDisplay
              points={gameState.accumulatedPoints || 0}
              visible={
                gameState.accumulatedPoints > 0 &&
                gameState.currentControl &&
                gameState.currentControl.id === opponent.id
              }
            />
            <Text style={styles.sectionHeader}>
              {opponent.name}
              <Animated.View
                style={{
                  transform: [{ scale: computerControlScale }],
                }}
              >
                <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
              </Animated.View>
            </Text>
            <View style={styles.hand}>
              {opponent.hands &&
                opponent.hands.map((card, index) => (
                  <Animated.View
                    key={`${opponent.id}-card-${card.suit}-${card.rank}`}
                    entering={
                      gameState.isDealing
                        ? FlipInEasyX.delay(
                            (index + (opponent.hands?.length || 0)) * 200
                          ).duration(300)
                        : undefined
                    }
                  >
                    <OpponentCard />
                  </Animated.View>
                ))}
            </View>
          </View>

          {/* Game Results in the Middle */}
          <View style={[styles.gameResultSection]}>
            <View style={styles.messageContainer}>
              <Text numberOfLines={2} style={[styles.message]}>
                {gameState.message}
              </Text>
            </View>

            {/* Current Play Cards */}
            <View style={styles.currentRound}>
              {/* Opponent's Play Spot */}
              {gameState.currentPlays &&
              gameState.currentPlays.find(
                (play) => play.player.id === opponent.id
              ) ? (
                <SlotCard
                  card={
                    gameState.currentPlays.find(
                      (play) => play.player.id === opponent.id
                    )!.card
                  }
                />
              ) : (
                <EmptyCard />
              )}

              {/* Human Play Spot */}
              {gameState.currentPlays &&
              gameState.currentPlays.find(
                (play) => play.player.id === currentUser.id
              ) ? (
                <SlotCard
                  card={
                    gameState.currentPlays.find(
                      (play) => play.player.id === currentUser.id
                    )!.card
                  }
                />
              ) : (
                <EmptyCard />
              )}
            </View>
          </View>

          {/* Human's Hand at the Bottom */}
          <View style={[styles.humanSection]}>
            <AccumulatedScoreDisplay
              points={gameState.accumulatedPoints || 0}
              visible={
                gameState.accumulatedPoints > 0 &&
                gameState.currentControl &&
                gameState.currentControl.id === currentUser.id
              }
            />
            <Text style={styles.sectionHeader}>
              {currentUser.name}
              <Animated.View
                style={{
                  transform: [{ scale: humanControlScale }],
                }}
              >
                <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
              </Animated.View>
            </Text>
            <View style={styles.hand}>
              {currentUser.hands &&
                currentUser.hands.map((card, index) => (
                  <Animated.View
                    key={`currentUser-card-${card.suit}-${card.rank}`}
                    entering={
                      gameState.isDealing
                        ? FlipInEasyX.delay(
                            (index + (opponent.hands?.length || 0)) * 200
                          ).duration(300)
                        : undefined
                    }
                  >
                    <CardComponent
                      card={card}
                      playCard={() => {
                        socket?.emit("play_card", {
                          roomId: roomId,
                          playerId: currentUser.id,
                          card,
                          cardIndex: index,
                        });
                        return { error: "", message: "" };
                      }}
                      width={width}
                    />
                  </Animated.View>
                ))}
            </View>
          </View>
        </View>

        <GameHistory gameHistory={gameState.gameHistory || []} width={width} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MultiPlayerGameScreen;
