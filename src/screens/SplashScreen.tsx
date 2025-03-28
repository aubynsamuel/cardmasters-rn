import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Animated as RNAnimated,
  useWindowDimensions,
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
import { useAuth } from "../AuthContext";

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const [titleOpacity] = useState(new RNAnimated.Value(0));
  const [subtitleOpacity] = useState(new RNAnimated.Value(0));
  const styles = getStyles(width, height);
  const { isAuthenticated, isLoading } = useAuth();

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

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      scale.value = withTiming(5, { duration: 400 });

      // if (!isLoading) {
      //   if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainMenu" as never }],
      });
      //   } else {
      //     navigation.reset({ index: 0, routes: [{ name: "Auth" as never }] });
      //   }
      // }
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated, isLoading]);

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

const getStyles = (width: number, height: number) => {
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
  return styles;
};

export default SplashScreen;
