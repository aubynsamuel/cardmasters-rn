import { GameRecord, GameRecordPlayer } from "@/types/gamePlayTypes";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import GameControls from "../components/GameControls";
import GameHistory from "../components/GameHistory";
import OpponentSection from "../components/OpponentSection";
import PlayerSection from "../components/PlayerSection";
import ShufflingAnimation from "../components/ShufflingAnimations";
import GameResults from "../components/SinglePlayerGameResults";
import TopRow from "../components/TopRow";
import { useAuth } from "../context/AuthContext";
import { useCustomAlerts } from "../context/CustomAlertsContext";
import { useSocket } from "../context/SocketContext";
import { saveLocalGameRecord } from "../data/gameRecordRepository";
import CardsGame, {
  CardsGameUIState,
} from "../gameLogic/SinglePlayerGameClass";
import { useLegacyNavigation } from "../navigation/legacyNavigation";
import { syncPendingGameRecords } from "../services/gameRecordSync";
import { useSettingsStore } from "../store/settingsStore";
import getStyles from "../styles/GameScreenStyles";
import { GameScreenProps } from "../types/screenTypes";

const GameScreen = () => {
  const navigation = useLegacyNavigation<GameScreenProps>();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { userData, userId } = useAuth();
  const { socket } = useSocket();
  const { showAlert } = useCustomAlerts();
  const { targetScore } = useSettingsStore();
  const gameRef = useRef<CardsGame | null>(null);
  const [gameState, setGameState] = useState<CardsGameUIState | null>(null);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.targetScore = targetScore;
        setGameState(gameRef.current.getState());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [targetScore]);

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
    // return () =>
    //   BackHandler.removeEventListener("hardwareBackPress", onBackPress);
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
        gameId: `game_${Date.now()}_${Math.random().toString(16).slice(2)}`,
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

      void saveLocalGameRecord(gameRecord, userId)
        .then(() => syncPendingGameRecords(socket, userId))
        .catch((error) => console.error("Error saving game record:", error));
      navigation.navigate("GameOver", gameRef.current.gameOverData);
    }
  }, [gameState?.cardsPlayed]);

  useEffect(() => {
    if (!gameState) return;

    if (gameState.currentControl.id === gameState.players[1].id)
      computerControlScale.value = withSpring(1.2, {
        duration: 500,
      });
    else
      computerControlScale.value = withSpring(0, {
        duration: 500,
      });

    if (gameState.currentControl.id === gameState.players[0].id)
      humanControlScale.value = withSpring(1.2, {
        duration: 500,
      });
    else
      humanControlScale.value = withSpring(0, {
        duration: 500,
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
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 10,
          backgroundColor: "#076324",
        }}
      >
        <StatusBar style="light" hidden />

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
          <TouchableOpacity activeOpacity={1} style={styles.overlayContainer}>
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
        <View className="flex-col flex-1 justify-between items-center my-4 md:flex-row">
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

          {/* Game Results { Message, Slots and PlayedCards} */}
          <GameResults
            width={width}
            gameStateMessage={gameState.message}
            currentRoundStyles={styles.currentRound}
            currentPlays={gameState.currentPlays}
            opponent={opponent}
            currentUser={currentUser}
          />

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
          <View className="items-center mt-2 w-full md:top-3">
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
