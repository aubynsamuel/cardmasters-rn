import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
import { GameScore } from "../components/TopRow";

interface GameOverScreenProps {
  route: { params: { winner: string; score: GameScore } };
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { winner, score } = route.params;

  // Animation values
  const titleOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.9);
  const winnerScale = useSharedValue(0.8);
  const buttonsOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations
    titleOpacity.value = withSequence(
      withDelay(300, withTiming(1, { duration: 800 })),
      withTiming(1, { duration: 300 })
    );
    containerScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.elastic(1.2),
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

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    // transform: [{ scale: interpolateScale(titleOpacity.value) }],
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
    // transform: [{ translateY: interpolateTranslateY(buttonsOpacity.value) }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  // Helper functions
  // const interpolateScale = (value: number) => {
  //   return 0.7 + value * 0.3;
  // };

  // const interpolateTranslateY = (value: number) => {
  //   return (1 - value) * 30;
  // };

  const isPlayerWinner = winner === "You" || winner === "Player";

  return (
    <LinearGradient
      colors={["#076345", "#0a8132"]}
      style={styles.gradientBackground}
    >
      {/* Decorative card elements */}
      <View style={styles.decorationContainer}>
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.cardDecoration,
                {
                  top: 50 + i * 90,
                  left: i % 2 === 0 ? -20 : Dimensions.get("window").width - 40,
                  transform: [{ rotate: `${i * 30}deg` }],
                },
                confettiStyle,
              ]}
            />
          ))}
      </View>

      <Animated.View style={[styles.contentContainer, containerStyle]}>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Game Over</Text>
        </Animated.View>

        <Animated.View style={[styles.resultContainer, winnerStyle]}>
          <LinearGradient
            colors={
              isPlayerWinner ? ["#FFD700", "#FFA500"] : ["#9E9E9E", "#616161"]
            }
            style={styles.resultGradient}
          >
            <View style={styles.winnerContainer}>
              <Text style={styles.winnerLabel}>Winner</Text>
              <Text style={styles.winnerText}>{winner}</Text>

              <View style={styles.trophyContainer}>
                <Ionicons
                  name={isPlayerWinner ? "trophy" : "sad-outline"}
                  size={50}
                  color={isPlayerWinner ? "#FFF" : "#E0E0E0"}
                />
              </View>

              {score !== undefined && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Final Score</Text>
                  <Text style={styles.scoreText}>
                    {" "}
                    {`AI ${score.computer} : ${score.human} You`}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Game" as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF9800", "#F57C00"]}
              style={styles.buttonGradient}
            >
              <Ionicons
                name="reload"
                size={20}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("MainMenu" as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              style={styles.buttonGradient}
            >
              <Ionicons
                name="home"
                size={20}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Return to Main Menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  cardDecoration: {
    position: "absolute",
    width: 80,
    height: 110,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  contentContainer: {
    width: width * 0.9,
    maxWidth: 450,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  resultContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resultGradient: {
    borderRadius: 16,
    padding: 20,
  },
  winnerContainer: {
    alignItems: "center",
  },
  winnerLabel: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  winnerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  trophyContainer: {
    marginVertical: 15,
  },
  scoreContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default GameOverScreen;
