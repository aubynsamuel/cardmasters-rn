import { GameOverScreenProps } from "@/types/screenTypes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  BackHandler,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { gameScoreToString } from "../gameLogic/GamePlayUtils";
import { useLegacyNavigation } from "../navigation/legacyNavigation";

const GameOverScreen: React.FC<GameOverScreenProps> = ({ route }) => {
  const navigation = useLegacyNavigation();
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
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
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
      className="flex-1 justify-center items-center"
    >
      <View className="overflow-hidden absolute inset-0">
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
              className="absolute w-20 h-28 rounded-lg border-2 bg-white/15 border-white/30"
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
            className="overflow-hidden mb-5 w-full rounded-2xl shadow-lg md:h-4/5"
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

        <View className="justify-center items-center w-full md:w-2/5 md:h-full">
          <Animated.View
            style={buttonsStyle}
            className="gap-4 w-full md:w-11/12"
          >
            <TouchableOpacity
              className="overflow-hidden w-full rounded-xl shadow-md"
              onPress={handleNavigation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF9800", "#F57C00"]}
                className="flex-row justify-center items-center p-4 rounded-xl"
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
                className="overflow-hidden w-full rounded-xl shadow-md"
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
                  className="flex-row justify-center items-center p-4 rounded-xl"
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
