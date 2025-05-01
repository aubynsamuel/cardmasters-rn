import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { gameScoreToString } from "../gameLogic/GamePlayUtils";
import { GameOverScreenProps } from "../types/ScreenTypes";

const GameOverScreen: React.FC<GameOverScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const {
    winner,
    score,
    isCurrentPlayer,
    isMultiPlayer,
    initialRoomData,
    roomId,
  } = route.params;

  const titleOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.8);
  const winnerScale = useSharedValue(0.8);
  const buttonsOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withSequence(
      withDelay(300, withTiming(1, { duration: 800 })),
      withTiming(1, { duration: 300 })
    );
    containerScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.elastic(1.1),
    });
    winnerScale.value = withDelay(
      600,
      withTiming(1, {
        duration: 700,
        easing: Easing.elastic(1.1),
      })
    );
    buttonsOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    confettiOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      handleNavigation();
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const winnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winnerScale.value }],
    opacity: winnerScale.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const handleNavigation = () => {
    if (isMultiPlayer) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "RoomScreen" as never,
            params: {
              roomId,
              initialRoomData,
            },
          },
        ],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Game" as never,
          },
        ],
      });
    }
  };

  return (
    <LinearGradient
      colors={["#076345", "#0a8132"]}
      className="items-center justify-center flex-1"
    >
      <View className="absolute inset-0 overflow-hidden">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Animated.View
              key={i}
              style={[
                {
                  top: 50 + i * 90,
                  left: i % 2 === 0 ? -20 : width - 40,
                  transform: [{ rotate: `${i * 30}deg` }],
                },
                confettiStyle,
              ]}
              className="absolute w-20 border-2 rounded-lg h-28 bg-white/15 border-white/30"
            />
          ))}
      </View>

      <Animated.View
        style={containerStyle}
        className={`flex-1 md:flex-row flex-col gap-5 w-[90%] items-center justify-center my-5`}
      >
        <View className="items-center w-full md:h-full md:w-3/5">
          <Animated.View style={titleStyle}>
            <Text className="text-4xl font-bold text-white mb-8 md:mb-2.5 text-center shadow-lg">
              Game Over
            </Text>
          </Animated.View>
          <Animated.View
            style={winnerStyle}
            className="w-full mb-5 overflow-hidden shadow-lg rounded-2xl md:h-4/5"
          >
            <LinearGradient
              colors={
                isCurrentPlayer
                  ? ["#FFD700", "#FFA500"]
                  : ["#9E9E9E", "#616161"]
              }
              className="p-5 rounded-2xl"
            >
              <View className="md:h-full items-center gap-2.5 justify-evenly">
                <Text className="text-lg font-semibold text-white/80">
                  Winner
                </Text>
                <Text className="text-3xl font-bold text-white shadow">
                  {winner.name}
                </Text>

                <View>
                  <Ionicons
                    name={isCurrentPlayer ? "trophy" : "sad-outline"}
                    size={50}
                    color={isCurrentPlayer ? "#FFF" : "#E0E0E0"}
                  />
                </View>

                {score !== undefined && (
                  <View className="bg-black/20 px-5 py-2.5 rounded-3xl">
                    <Text className="text-sm text-center text-white/80">
                      Final Score
                    </Text>
                    <Text className="text-2xl font-bold text-center text-white">
                      {gameScoreToString(score)}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        <View className="items-center justify-center w-full md:w-2/5 md:h-full">
          <Animated.View
            style={buttonsStyle}
            className="w-full gap-4 md:w-11/12"
          >
            <TouchableOpacity
              className="w-full overflow-hidden shadow-md rounded-xl"
              onPress={handleNavigation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF9800", "#F57C00"]}
                className="flex-row items-center justify-center p-4 rounded-xl"
              >
                <Ionicons
                  name="reload"
                  size={20}
                  color="#FFF"
                  className="mr-2.5"
                />
                <Text className="text-lg font-semibold text-white">
                  {!isMultiPlayer ? "Play Again" : "Return to room"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isMultiPlayer && (
              <TouchableOpacity
                className="w-full overflow-hidden shadow-md rounded-xl"
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainMenu" as never }],
                  })
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  className="flex-row items-center justify-center p-4 rounded-xl"
                >
                  <Ionicons
                    name="home"
                    size={20}
                    color="#FFF"
                    className="mr-2.5"
                  />
                  <Text className="text-lg font-semibold text-white">
                    Return to Main Menu
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

export default GameOverScreen;
