import React, { useEffect, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CardsGameState,
  GameScore,
  GameStartedPayload,
  Player,
  PlayerLeftPayload,
  validPlay,
} from "../types/Types";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import PlayerSection from "../components/PlayerSection";
import OpponentSection from "../components/OpponentSection";
import { useCustomAlerts } from "../context/CustomAlertsContext";

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
  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);
  const { showAlert, showToast } = useCustomAlerts();

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
    showToast({
      message: valid.message,
      duration: 2000,
      type: "error",
    });
  };

  const handleGameStateUpdate = (newState: CardsGameState) => {
    setGameState((prev) => ({ ...prev, ...newState }));
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    showAlert({
      title: "Connection Lost",
      message: "Lost connection to the game server. Returning to lobby.",
      type: "error",
      buttons: [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MultiplayerLobby" as never }],
            }),
        },
      ],
    });
  };

  const handlePlayerLeft = (data: PlayerLeftPayload) => {
    if (data.userId !== socket?.id) {
      if (data.updatedPlayers && data.updatedPlayers.length >= 2) {
        showAlert({
          title: `${data.playerName} left the game`,
          message: "Game will continue with the remaining players.",
          type: "info",
        });
        setGameState((prevState) => {
          if (!prevState) return null;
          return {
            ...prevState,
            players: data.updatedPlayers,
          };
        });
      } else {
        showAlert({
          title: `${data.playerName} left the game`,
          message: "Not enough players to continue. Returning to lobby.",
          type: "error",
          buttons: [
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
          ],
        });
      }
    }
  };

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
          negative: true,
          onPress: () => {
            socket?.emit("leave_room", { roomId });
            navigation.reset({
              index: 0,
              routes: [{ name: "MultiplayerLobby" as never }],
            });
          },
        },
      ],
    });
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

  const opponentPlayers = gameState.players.filter(
    (player) => player.id !== socketId
  );

  // display the hands for one opponent selected at random
  const opponent = opponentPlayers[
    Math.floor(Math.random() * opponentPlayers.length)
  ] || {
    name: "Opponent",
    id: "player2",
    hands: [],
    score: 0,
  };

  const gameScoreList = gameState.players.map((player) => ({
    playerName: player.name,
    score: player.score,
  }));

  const humanPlaySpot = () => {
    const play = gameState.currentPlays.find(
      (play) => play.player.id === currentUser.id
    );
    return (
      <View className="items-center justify-center w-20">
        <Text
          style={{
            fontWeight: "bold",
            color: "lightgrey",
          }}
        >
          {currentUser.name}
          {gameState.currentControl.id === currentUser.id ? "🔥" : ""}
        </Text>
        {play ? <SlotCard card={play.card} /> : <EmptyCard />}
      </View>
    );
  };

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
            className={`items-center bg-opponentArea rounded-[20px] p-2.5 w-10/12 md:w-1/3`}
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
          <View className="items-center gap-8 mx-4 md:w-1/4 justify-evenly">
            {width < 600 && (
              <View className="w-full p-1 px-5 bg-logContainerBackground rounded-2xl">
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

              <View className="flex-row justify-center gap-5 md:gap-3">
                {opponentPlayers.map((opponent) => {
                  const play = gameState.currentPlays?.find(
                    (play) => play.player.id === opponent.id
                  );
                  const isCurrentControl =
                    gameState.currentControl.id === opponent.id;
                  return (
                    <View
                      key={opponent.id + opponent.name}
                      className="items-center justify-center w-20"
                    >
                      <Text style={{ fontWeight: "bold", color: "lightgrey" }}>
                        {opponent.name}
                        {isCurrentControl ? "🔥" : ""}
                      </Text>
                      {play ? <SlotCard card={play.card} /> : <EmptyCard />}
                    </View>
                  );
                })}
              </View>

              {/* Human Play Spot */}
              {humanPlaySpot()}
            </View>
          </View>

          <View className="bg-playerArea rounded-[20px] p-2.5 w-10/12 md:w-1/3">
            <PlayerSection
              player={currentUser}
              isDealing={gameState.isDealing}
              accumulatedPoints={gameState.accumulatedPoints}
              currentControlId={gameState.currentControl.id}
              controlScale={humanControlScale}
              playCard={(card, index) => {
                socket?.emit("play_card", {
                  roomId: roomId,
                  playerId: currentUser.id,
                  card,
                  cardIndex: index,
                });
                return { error: "", message: "" };
              }}
              width={width}
              opponentHandsLength={opponent.hands.length}
            />
          </View>
        </View>

        {<GameHistory gameHistory={gameState.gameHistory} />}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MultiPlayerGameScreen;
