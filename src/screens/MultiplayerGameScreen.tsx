import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import GameHistory from "../components/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ShufflingAnimation from "../components/ShufflingAnimations";
import EmptyCard from "../components/EmptySlotCard";
import SlotCard from "../components/SlotCard";
import TopRow from "../components/TopRow";
import GameControls from "../components/GameControls";
import { Ionicons } from "@expo/vector-icons";
import PlayerSection from "../components/PlayerSection";
import OpponentSection from "../components/OpponentSection";
import Colors from "../theme/colors";
import getStyles from "../styles/GameScreenStyles";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";

const MultiPlayerGameScreen = () => {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);
  const {
    gameState,
    isLoading,
    userId,
    socketId,
    reconnectionDisplay,
    socket,
    roomId,
    QuitGameAlert,
  } = useMultiplayerGame();

  // Current Control Indicator Animation
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
  }, [gameState?.currentControl]);

  // Hardware-Back-Press Event Handler
  useEffect(() => {
    const onBackPress = () => {
      QuitGameAlert();
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

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
  const randomOpponent = opponentPlayers[
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
      <View className="items-center justify-center w-28">
        <Text
          style={{
            fontWeight: "bold",
            color: "lightgrey",
            width: "100%",
            textAlign: "center",
          }}
          numberOfLines={1}
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

        {reconnectionDisplay.show && (
          <View style={styles.animationOverlay}>
            <View className="items-center justify-center p-5 bg-mainTextColor rounded-xl elevation-md">
              <Text className="text-lg text-center text-black">
                {reconnectionDisplay.message}
              </Text>
              <ActivityIndicator size={"large"} color={Colors.gold} />
            </View>
          </View>
        )}

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
            className={`items-center bg-opponentArea rounded-[20px] p-2.5 w-10/12 md:w-1/3 h-36`}
          >
            <OpponentSection
              opponent={randomOpponent}
              isDealing={gameState.isDealing}
              accumulatedPoints={gameState.accumulatedPoints}
              currentControlId={gameState.currentControl.id}
              controlScale={computerControlScale}
            />
          </View>

          {/* Game Results in the Middle */}
          <View className="items-center w-full gap-8 mx-4 md:w-1/4 justify-evenly">
            {width < 600 && (
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
            <View className="flex-col items-center justify-around gap-5 text-xl text-center">
              {/* Opponent's Play Spot */}

              <View className="flex-row justify-center">
                {opponentPlayers.map((opponent) => {
                  const play = gameState.currentPlays?.find(
                    (play) => play.player.id === opponent.id
                  );
                  const isCurrentControl =
                    gameState.currentControl.id === opponent.id;
                  return (
                    <View
                      key={opponent.id + opponent.name}
                      className="items-center justify-center w-28"
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "lightgrey",
                          width: "100%",
                          textAlign: "center",
                        }}
                        numberOfLines={1}
                      >
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

          <View className="bg-playerArea rounded-[20px] p-2.5 w-10/12 md:w-1/3 h-36">
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
              playersHandsLength={currentUser.hands.length}
            />
          </View>
        </View>

        {(height > 700 || width > 600) && (
          <GameHistory gameHistory={gameState.gameHistory} />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MultiPlayerGameScreen;
