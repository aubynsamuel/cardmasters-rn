import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const MainMenuScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const extendedStyles = getExtendedStyles(width, height);

  // Shared values for animations
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const buttonOpacity1 = useSharedValue(0);
  const buttonOpacity2 = useSharedValue(0);
  const buttonOpacity3 = useSharedValue(0);
  const buttonTranslateY1 = useSharedValue(50);
  const buttonTranslateY2 = useSharedValue(50);
  const buttonTranslateY3 = useSharedValue(50);
  const backgroundOpacity = useSharedValue(0);
  const decorationScale = useSharedValue(0);

  useEffect(() => {
    // Animate background
    backgroundOpacity.value = withTiming(1, { duration: 1000 });

    // Animate title: fade in and scale up
    titleOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    titleScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Animate decorative elements
    decorationScale.value = withDelay(
      400,
      withSpring(1, { damping: 10, stiffness: 80 })
    );

    // Animate buttons sequentially
    buttonOpacity1.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonTranslateY1.value = withDelay(
      600,
      withSpring(0, { damping: 14, stiffness: 100 })
    );

    buttonOpacity2.value = withDelay(750, withTiming(1, { duration: 500 }));
    buttonTranslateY2.value = withDelay(
      750,
      withSpring(0, { damping: 14, stiffness: 100 })
    );

    buttonOpacity3.value = withDelay(900, withTiming(1, { duration: 500 }));
    buttonTranslateY3.value = withDelay(
      900,
      withSpring(0, { damping: 14, stiffness: 100 })
    );
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const animatedDecorationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: decorationScale.value }],
    opacity: decorationScale.value,
  }));

  const animatedButtonStyle1 = useAnimatedStyle(() => ({
    opacity: buttonOpacity1.value,
    transform: [{ translateY: buttonTranslateY1.value }],
  }));

  const animatedButtonStyle2 = useAnimatedStyle(() => ({
    opacity: buttonOpacity2.value,
    transform: [{ translateY: buttonTranslateY2.value }],
  }));

  const animatedButtonStyle3 = useAnimatedStyle(() => ({
    opacity: buttonOpacity3.value,
    transform: [{ translateY: buttonTranslateY3.value }],
  }));

  return (
    <View style={extendedStyles.mainContainer}>
      <Animated.View
        style={[extendedStyles.backgroundContainer, animatedBackgroundStyle]}
      >
        <LinearGradient
          colors={["#076324", "#076345"]}
          style={extendedStyles.gradientBackground}
        >
          {/* Decorative pattern */}
          <Animated.View
            style={[
              extendedStyles.decorationContainer,
              animatedDecorationStyle,
            ]}
          >
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[
                    extendedStyles.cardDecoration,
                    {
                      top: 50 + i * 90,
                      left: i % 2 === 0 ? 20 : width - 70,
                      transform: [{ rotate: `${i * 45}deg` }],
                    },
                  ]}
                />
              ))}
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <View style={extendedStyles.contentContainer}>
        <Animated.View
          style={[extendedStyles.titleContainer, animatedTitleStyle]}
        >
          <Text style={extendedStyles.titleText}>Card Masters</Text>
          <View style={extendedStyles.underline} />
        </Animated.View>

        <View style={extendedStyles.buttonContainer}>
          <Animated.View
            style={[extendedStyles.buttonWrapper, animatedButtonStyle1]}
          >
            <TouchableOpacity
              style={extendedStyles.menuButton}
              onPress={() => navigation.navigate("Game" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#0a8132", "#076324"]}
                style={extendedStyles.buttonGradient}
              >
                <Ionicons
                  name="game-controller"
                  size={24}
                  color="#fff"
                  style={extendedStyles.buttonIcon}
                />
                <Text style={extendedStyles.buttonText}>SinglePlayer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[extendedStyles.buttonWrapper, animatedButtonStyle2]}
          >
            <TouchableOpacity
              style={extendedStyles.menuButton}
              onPress={() => navigation.navigate("MultiplayerLobby" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#ff7e47", "#ff5722"]}
                style={extendedStyles.buttonGradient}
              >
                <Ionicons
                  name="people"
                  size={24}
                  color="#fff"
                  style={extendedStyles.buttonIcon}
                />
                <Text style={extendedStyles.buttonText}>Multiplayer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[extendedStyles.buttonWrapper, animatedButtonStyle3]}
          >
            <TouchableOpacity
              style={extendedStyles.menuButton}
              onPress={() => navigation.navigate("Settings" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#4a5568", "#2d3748"]}
                style={extendedStyles.buttonGradient}
              >
                <Ionicons
                  name="settings"
                  size={24}
                  color="#fff"
                  style={extendedStyles.buttonIcon}
                />
                <Text style={extendedStyles.buttonText}>Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const getExtendedStyles = (width: number, height: number) => {
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#076324",
    },
    backgroundContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    gradientBackground: {
      flex: 1,
    },
    decorationContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    cardDecoration: {
      position: "absolute",
      width: 50,
      height: 70,
      borderRadius: 8,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: 60,
    },
    titleText: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#fff",
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    underline: {
      width: 150,
      height: 4,
      backgroundColor: "#FFD700",
      borderRadius: 2,
      marginTop: 10,
    },
    buttonContainer: {
      width: "100%",
      alignItems: "center",
    },
    buttonWrapper: {
      width: "80%",
      marginBottom: 20,
    },
    menuButton: {
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
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    buttonIcon: {
      marginRight: 12,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
  });
  return styles;
};

export default MainMenuScreen;
