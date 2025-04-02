import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  BackHandler,
  Alert,
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AnimatedScoreDisplay from "../components/AnimatedScoreDisplay";
import { GameScore, Player } from "../Types";
import CardsGame, {
  CardsGameUIState,
  GAME_TO,
} from "../gameLogic/SinglePlayerGameClass";
import { useAuth } from "../AuthContext";

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

const GameScreen = () => {
  const navigation = useNavigation<GameScreenProps>();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { userData, userId } = useAuth();

  const initialPlayers = [
    {
      hands: [],
      id: userId || "1234",
      name: userData?.displayName || "You",
      score: 0,
    },
    {
      hands: [],
      id: "5678",
      name: "Computer",
      score: 0,
    },
  ];

  const gameRef = useRef<CardsGame | null>(null);
  const [gameState, setGameState] = useState<CardsGameUIState | null>(null);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);

  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);

  // const ref = useRef<number>(null);
  // console.log(`Re-rendered ${ref.current++} times`);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new CardsGame(initialPlayers);

      gameRef.current.setCallbacks({
        onStateChange: (newState: CardsGameUIState) => {
          setGameState({ ...newState });
        },
      });

      setGameState(gameRef.current.getState());
      gameRef.current.startGame();
    }

    return () => {
      gameRef.current = null;
    };
  }, []);

  const QuitGameAlert = () => {
    Alert.alert("Quit Game", "Do you want to quit game", [
      { text: "No", onPress: () => {} },
      {
        text: "Yes",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "MainMenu" as never }],
          });
        },
      },
    ]);
  };

  useEffect(() => {
    const onBackPress = () => {
      QuitGameAlert();
      console.log("Hardware Back Press From GameScreen");
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;

    if (
      gameRef?.current?.players[0].score >= GAME_TO ||
      gameRef?.current?.players[1].score >= GAME_TO
    ) {
      navigation.navigate("GameOver", gameRef.current.gameOverData);
    }
  }, [gameState?.cardsPlayed]);

  useEffect(() => {
    if (!gameState) return;

    if (gameState.currentControl.id === gameState.players[1].id)
      computerControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      computerControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });

    if (gameState.currentControl.id === gameState.players[0].id)
      humanControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      humanControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });
  }, [gameState?.currentControl]);

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading game...</Text>
      </View>
    );
  }

  const currentUser = gameState.players[0];
  const opponent = gameState.players[1];

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
                startNewGame={() => gameRef.current?.startGame()}
                gameOver={gameState.gameOver}
                onClose={() => setShowControlsOverlay(false)}
                onQuitGame={QuitGameAlert}
                isMultiPlayer={false}
              />
            </View>
          </TouchableOpacity>
        )}

        <TopRow
          deck={gameState.deck}
          setShowControlsOverlay={(value) => setShowControlsOverlay(value)}
          gameScoreList={[
            { playerName: currentUser.name, score: currentUser.score },
            { playerName: opponent.name, score: opponent.score },
          ]}
          gameTo={GAME_TO}
        />

        {/* MAIN GAME AREA */}
        <View style={styles.mainGameArea}>
          {/* Opponents's Hand at the Top */}
          <View style={[styles.computerSection]}>
            <AnimatedScoreDisplay
              points={gameState.accumulatedPoints}
              visible={
                gameState.accumulatedPoints > 0 &&
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
              {opponent.hands.map((card, index) => (
                <Animated.View
                  key={`opponent-card-${card.suit}-${card.rank}`}
                  entering={
                    gameState.isDealing
                      ? FlipInEasyX.delay(
                          (index + opponent.hands.length) * 200
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
              {gameState.currentPlays.find(
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
              {gameState.currentPlays.find(
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
              points={gameState.accumulatedPoints}
              visible={
                gameState.accumulatedPoints > 0 &&
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
              {currentUser.hands.map((card, index) => (
                <Animated.View
                  key={`currentUser-card-${card.suit}-${card.rank}`}
                  entering={
                    gameState.isDealing
                      ? FlipInEasyX.delay(
                          (index + opponent.hands.length) * 200
                        ).duration(300)
                      : undefined
                  }
                >
                  <CardComponent
                    card={card}
                    playCard={() => gameRef.current?.humanPlayCard(card, index)}
                    width={width}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        </View>

        {gameState.showStartButton && (
          <View style={{ width: "100%", alignItems: "center" }}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                gameRef.current?.startPlaying();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.overlayButtonText}>{"Start Game"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <GameHistory gameHistory={gameState.gameHistory} width={width} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default GameScreen;
