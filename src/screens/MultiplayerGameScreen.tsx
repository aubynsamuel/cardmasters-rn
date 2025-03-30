import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
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
import AnimatedScoreDisplay from "../components/AnimatedScoreDisplay";
import { CardsGameState, GameScore, Player } from "../Types";
import { GAME_TO } from "../gameLogic/MultiplayerGameClass";
import { useSocket } from "../SocketContext";

type GameScreenStackParamList = {
  GameOver: {
    winner: Player;
    score: GameScore[];
    isCurrentPlayer: boolean;
    isMultiPlayer: boolean;
  };
};

type GameScreenProps = NativeStackNavigationProp<
  GameScreenStackParamList,
  "GameOver"
>;

interface RoomData {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: "waiting" | "playing" | "full";
  ownerId: string;
}

const MultiPlayerGameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenProps>();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { isConnected, socket } = useSocket();

  // Get roomId from route params
  const { roomId } = route.params || {};

  const [gameState, setGameState] = useState<CardsGameState | null>(null);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);

  useEffect(() => {
    if (socket && isConnected) {
      const handleGameStateUpdate = (newState: CardsGameState) => {
        console.log("Game state update received:", newState);
        setGameState(newState);
        setIsLoading(false);
      };

      socket.on("game_state_update", handleGameStateUpdate);

      // Request initial game state if needed
      if (roomId) {
        console.log("Requesting initial game state for room:", roomId);
        socket.emit("request_game_state", { roomId });
      }

      // Cleanup listener on unmount
      return () => {
        socket.off("game_state_update", handleGameStateUpdate);
      };
    }
  }, [socket, isConnected, roomId]);

  useEffect(() => {
    if (!gameState) return;

    if (
      gameState.players[0]?.score >= GAME_TO ||
      gameState.players[1]?.score >= GAME_TO
    ) {
      // Make sure gameOverData exists before navigating
      if (gameState.gameOverData) {
        navigation.navigate("GameOver", {
          ...gameState.gameOverData,
          isCurrentPlayer:
            gameState.gameOverData.winner.id === gameState?.players[0].id,
        });
      }
    }
  }, [gameState?.cardsPlayed, gameState?.players]);

  useEffect(() => {
    if (!gameState || !gameState.currentControl) return;

    if (gameState.currentControl.id === gameState.players[1]?.id)
      computerControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      computerControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });

    if (gameState.currentControl.id === gameState.players[0]?.id)
      humanControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      humanControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });
  }, [gameState?.currentControl, gameState?.players]);

  if (isLoading || !gameState || !gameState.players) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading game...</Text>
      </View>
    );
  }

  // Make sure we have the currentUser and opponent before rendering
  const currentUser = gameState.players[0] || {
    name: "You",
    id: "player1",
    hands: [],
    score: 0,
  };

  const opponent = gameState.players[1] || {
    name: "Opponent",
    id: "player2",
    hands: [],
    score: 0,
  };

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
                startNewGame={() => {
                  // Add new game functionality if needed
                  socket?.emit("request_new_game", { roomId });
                }}
                gameOver={gameState.gameOver}
                onClose={() => setShowControlsOverlay(false)}
              />
            </View>
          </TouchableOpacity>
        )}

        <TopRow
          deck={gameState.deck || []}
          setShowControlsOverlay={(value) => setShowControlsOverlay(value)}
          gameScoreList={[
            { playerName: currentUser.name, score: currentUser.score },
            { playerName: opponent.name, score: opponent.score },
          ]}
        />

        {/* MAIN GAME AREA */}
        <View style={styles.mainGameArea}>
          {/* Opponents's Hand at the Top */}
          <View style={[styles.computerSection]}>
            <AnimatedScoreDisplay
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
                    key={`opponent-card-${index}`}
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
                {gameState.message || "Game in progress..."}
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
            <AnimatedScoreDisplay
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
                    key={`currentUser-card-${index}`}
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
