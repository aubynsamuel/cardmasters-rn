import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import getStyles from "../styles/GameScreenStyles";
import { StatusBar } from "expo-status-bar";
import GameHistory from "../components/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";
import ShufflingAnimation from "../components/ShufflingAnimations";
import EmptyCard from "../components/EmptySlotCard";
import SlotCard from "../components/SlotCard";
import TopRow from "../components/TopRow";
import GameControls from "../components/GameControls";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  GameRecord,
  GameRecordPlayer,
  GameScore,
  Player,
} from "../types/Types";
import CardsGame, {
  CardsGameUIState,
} from "../gameLogic/SinglePlayerGameClass";
import { useAuth } from "../context/AuthContext";
import OpponentSection from "../components/OpponentSection";
import PlayerSection from "../components/PlayerSection";
import { useCustomAlerts } from "../context/CustomAlertsContext";
import { useSettingsStore } from "../context/SettingsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storeGameRecordToFirestore } from "../gameLogic/FirestoreFunctions";

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
  const { showAlert } = useCustomAlerts();
  const { targetScore } = useSettingsStore();

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.targetScore = targetScore;
        setGameState(gameRef.current.getState());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [targetScore]);

  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new CardsGame(initialPlayers, targetScore);

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
    showAlert({
      title: "Quit Game",
      message: "Do you want to quit game",
      type: "warning",
      buttons: [
        {
          text: "No",
          onPress: () => {},
        },
        {
          text: "Yes",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainMenu" as never }],
            });
          },
          negative: true,
        },
      ],
    });
  };

  useEffect(() => {
    const onBackPress = () => {
      QuitGameAlert();
      console.log(
        "[SinglePlayerGameScreen] Hardware Back Press From GameScreen"
      );
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  const playersListBuilder = () => {
    const playersList: GameRecordPlayer[] = [];
    if (!gameRef.current || !gameRef.current.players) return [];
    for (const player of gameRef.current.players) {
      playersList.push({
        finalScore: player.score,
        id: player.id,
        name: player.name === userData?.displayName ? "You" : player.name,
        position: 1,
      });
    }
    return playersList;
  };

  useEffect(() => {
    if (!gameRef.current) return;

    if (
      gameRef?.current?.players[0].score >= gameRef.current.targetScore ||
      gameRef?.current?.players[1].score >= gameRef.current.targetScore
    ) {
      const gameRecord: GameRecord = {
        dateString: new Date().toUTCString(),
        gameId: "game" + Math.random().toString(),
        mode: "single-player",
        playerCount: 2,
        targetScore: targetScore,
        winnerName:
          gameRef.current.gameOverData.winner.name === userData?.displayName
            ? "You"
            : gameRef.current.gameOverData.winner.name,
        winnerId: gameRef.current.gameOverData.winner.id,
        players: playersListBuilder(),
      };

      // Retrieve existing records, append the new one, and save back
      AsyncStorage.getItem("gameRecord")
        .then(async (storedRecords) => {
          const records = storedRecords ? JSON.parse(storedRecords) : [];
          records.push(gameRecord); // Add the new record to the list
          return AsyncStorage.setItem("gameRecord", JSON.stringify(records));
        })
        .then(() => console.log("Record Stored"))
        .catch((error) => console.error("Error saving game record:", error));
      storeGameRecordToFirestore(userId || "", gameRecord);
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
      <View className="flex-1 px-2.5 bg-containerBackground justify-center">
        <Text className="text-lg text-center text-mainTextColor">
          Loading game...
        </Text>
      </View>
    );
  }

  const currentUser = gameState.players[0];
  const opponent = gameState.players[1];

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="justify-center flex-1 px-2.5 bg-containerBackground">
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
            // onPress={() => setShowControlsOverlay(false)}
          >
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Options</Text>
                <TouchableOpacity
                  onPress={() => setShowControlsOverlay(false)}
                  style={{ right: 15 }}
                >
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
          gameTo={gameState.targetScore}
        />

        {width > 600 && (
          <View
            className="bottom-8 w-min-[150px] w-1/3 px-5 p-1
           bg-logContainerBackground rounded-2xl self-center"
          >
            <Text
              numberOfLines={2}
              className="text-lg text-center text-mainTextColor"
            >
              {gameState.message}
            </Text>
          </View>
        )}

        {/* MAIN GAME AREA */}
        <View className="flex-col items-center justify-between flex-1 my-4 md:flex-row">
          <View
            className={`items-center bg-opponentArea rounded-[20px] p-2.5 w-10/12 md:w-1/3 h-36`}
          >
            <OpponentSection
              opponent={opponent}
              isDealing={gameState.isDealing}
              accumulatedPoints={gameState.accumulatedPoints}
              currentControlId={gameState.currentControl.id}
              controlScale={computerControlScale}
            />
          </View>

          {/* Game Results in the Middle */}
          <View className="items-center w-full gap-8 mx-4 md:w-1/4 justify-evenly">
            {width < 500 && (
              <View
                className="p-1 px-5 bg-logContainerBackground rounded-2xl"
                style={{ minWidth: "50%" }}
              >
                <Text
                  numberOfLines={2}
                  className="text-lg text-center text-mainTextColor"
                >
                  {gameState.message}
                </Text>
              </View>
            )}

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

          <View className="items-center bg-playerArea rounded-[20px] p-2.5 w-10/12 md:w-1/3 h-36">
            <PlayerSection
              player={currentUser}
              isDealing={gameState.isDealing}
              accumulatedPoints={gameState.accumulatedPoints}
              currentControlId={gameState.currentControl.id}
              controlScale={humanControlScale}
              playCard={(card, index) =>
                gameRef.current?.humanPlayCard(card, index) ?? {
                  error: "",
                  message: "",
                }
              }
              width={width}
              playersHandsLength={opponent.hands.length}
            />
          </View>
        </View>

        {gameState.showStartButton && (
          <View className="items-center w-full mt-2 md:top-3">
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

        {(height > 700 || width > 600) && (
          <GameHistory gameHistory={gameState.gameHistory} />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default GameScreen;
