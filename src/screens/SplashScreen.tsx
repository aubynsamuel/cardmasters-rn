import React, { useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import EnhancedShufflingAnimation from "../components/EnhancedShufflingAnimation";

const { width, height } = Dimensions.get("window");

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const titleOpacity = useRef(new RNAnimated.Value(0)).current;
  const subtitleOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    // Animate title and subtitle
    RNAnimated.sequence([
      RNAnimated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      RNAnimated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate the card shuffle container
    opacity.value = withDelay(
      200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    scale.value = withDelay(
      200,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.back(2)) })
    );

    // Navigate to main menu after animation completes
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      scale.value = withTiming(5, { duration: 400 });

      navigation.navigate("MainMenu" as never);
      // navigation.reset({ index: 0, routes: [{ name: "MainMenu" as never }] });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient colors={["#076324", "#076345"]} style={styles.container}>
      <RNAnimated.View
        style={[styles.titleContainer, { opacity: titleOpacity }]}
      >
        <Text style={styles.title}>CARD MASTER</Text>
      </RNAnimated.View>

      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <EnhancedShufflingAnimation />
      </Animated.View>

      <RNAnimated.View
        style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}
      >
        <Text style={styles.subtitle}>Shuffle • Play • Win</Text>
      </RNAnimated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#142850",
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  cardContainer: {
    width: width * 0.9,
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitleContainer: {
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#dae1e7",
    letterSpacing: 1,
  },
});

export default SplashScreen;
