import { GameOverScreenProps } from "@/types/screenTypes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  BackHandler,
  StyleSheet,
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
    <LinearGradient colors={["#076345", "#0a8132"]} style={styles.screen}>
      <View className="overflow-hidden absolute inset-0">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiCard,
                {
                  top: 50 + i * 90,
                  left: i % 2 === 0 ? -20 : width - 40,
                  transform: [{ rotate: `${i * 30}deg` }],
                },
                confettiStyle,
              ]}
            />
          ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          width > 600 && styles.contentWide,
          containerStyle,
        ]}
      >
        <View className="items-center w-full md:h-full md:w-3/5">
          <Animated.View style={titleStyle}>
            <Text className="text-4xl font-bold text-white mb-8 md:mb-2.5 text-center shadow-lg">
              Game Over
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.winnerCard,
              width > 600 && styles.winnerCardWide,
              winnerStyle,
            ]}
          >
            <LinearGradient
              colors={
                isCurrentPlayer
                  ? ["#FFD700", "#FFA500"]
                  : ["#9E9E9E", "#616161"]
              }
              style={styles.winnerGradient}
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
            style={[
              styles.buttons,
              width > 600 && styles.buttonsWide,
              buttonsStyle,
            ]}
          >
            <TouchableOpacity
              className="overflow-hidden w-full rounded-xl shadow-md"
              onPress={handleNavigation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF9800", "#F57C00"]}
                style={styles.actionGradient}
              >
                <Ionicons
                  name="reload"
                  size={20}
                  color="#FFF"
                  style={styles.actionIcon}
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
                  style={styles.actionGradient}
                >
                  <Ionicons
                    name="home"
                    size={20}
                    color="#FFF"
                    style={styles.actionIcon}
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

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", alignItems: "center" },
  confettiCard: {
    position: "absolute",
    width: 80,
    height: 112,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  content: {
    flex: 1,
    flexDirection: "column",
    gap: 20,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  contentWide: { flexDirection: "row" },
  winnerCard: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
  },
  winnerCardWide: { height: "80%" },
  winnerGradient: { padding: 20, borderRadius: 16 },
  buttons: { width: "100%", gap: 16 },
  buttonsWide: { width: "91.666%" },
  actionGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  actionIcon: { marginRight: 10 },
});

export default GameOverScreen;
