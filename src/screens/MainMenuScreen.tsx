import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import {
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
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  useFocusEffect,
  useLegacyNavigation,
} from "../navigation/legacyNavigation";

const MainMenuScreen = () => {
  const navigation = useLegacyNavigation();
  const { width } = useWindowDimensions();
  const extendedStyles = getStyles();
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const buttonOpacity1 = useSharedValue(0);
  const buttonOpacity2 = useSharedValue(0);
  const buttonOpacity3 = useSharedValue(0);
  const buttonTranslateY1 = useSharedValue(50);
  const buttonTranslateY2 = useSharedValue(50);
  const buttonTranslateY3 = useSharedValue(50);
  const decorationScale = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      titleOpacity.value = 0;
      titleScale.value = 0.8;
      decorationScale.value = 0;
      buttonOpacity1.value = 0;
      buttonOpacity2.value = 0;
      buttonOpacity3.value = 0;
      buttonTranslateY1.value = 50;
      buttonTranslateY2.value = 50;
      buttonTranslateY3.value = 50;

      const frame = requestAnimationFrame(() => {
        titleOpacity.value = withDelay(
          50,
          withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) })
        );
        titleScale.value = withDelay(
          50,
          withSpring(1, { duration: 300, dampingRatio: 0.85 })
        );
        decorationScale.value = withDelay(
          80,
          withSpring(1, { duration: 300, dampingRatio: 0.85 })
        );
        buttonOpacity1.value = withDelay(
          100,
          withTiming(1, { duration: 220 })
        );
        buttonTranslateY1.value = withDelay(
          100,
          withSpring(0, { duration: 280, dampingRatio: 0.9 })
        );
        buttonOpacity2.value = withDelay(
          150,
          withTiming(1, { duration: 220 })
        );
        buttonTranslateY2.value = withDelay(
          150,
          withSpring(0, { duration: 280, dampingRatio: 0.9 })
        );
        buttonOpacity3.value = withDelay(
          200,
          withTiming(1, { duration: 220 })
        );
        buttonTranslateY3.value = withDelay(
          200,
          withSpring(0, { duration: 280, dampingRatio: 0.9 })
        );
      });

      return () => cancelAnimationFrame(frame);
    }, [
      buttonOpacity1,
      buttonOpacity2,
      buttonOpacity3,
      buttonTranslateY1,
      buttonTranslateY2,
      buttonTranslateY3,
      decorationScale,
      titleOpacity,
      titleScale,
    ])
  );

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
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
    <View className="flex-1 bg-[#076324]">
      <LinearGradient
        colors={["#076324", "#076345"]}
        style={[extendedStyles.decorationContainer, { flex: 1 }]}
      >
        {/* Decorative pattern */}
        <Animated.View style={[animatedDecorationStyle]}>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <View
                key={i}
                style={[
                  {
                    top: 180 + i * 90,
                    left: i % 2 === 0 ? 20 : width - 70,
                    transform: [{ rotate: `${i * 50}deg` }],
                  },
                ]}
                className="absolute w-[50px] h-[70px] rounded-lg 
                border-[#fff3] border bg-[#fff1] opacity-50"
              />
            ))}
        </Animated.View>
      </LinearGradient>

      <View className="items-center justify-center flex-1 px-5">
        {/* Title */}
        <Animated.View
          style={[extendedStyles.titleContainer, animatedTitleStyle]}
        >
          <Text className="text-[38px] font-bold text-white shadow-xl">
            Card Masters
          </Text>
          <View className="w-[150px] h-1 bg-[#FFD700] mt-2.5 rounded-s-sm" />
        </Animated.View>

        <View className="flex-row flex-wrap items-center w-full gap-5 justify-evenly">
          {/* SinglePlayer Button */}
          <Animated.View
            style={[extendedStyles.buttonContainer, animatedButtonStyle1]}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
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
                <Text numberOfLines={1} style={extendedStyles.buttonText}>
                  SinglePlayer
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Multiplayer Button */}
          <Animated.View
            style={[extendedStyles.buttonContainer, animatedButtonStyle2]}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
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
                <Text numberOfLines={1} style={extendedStyles.buttonText}>
                  Multiplayer
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Profile Button */}
          <Animated.View
            style={[extendedStyles.buttonContainer, animatedButtonStyle3]}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
              onPress={() => navigation.navigate("ProfileScreen" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["plum", "#2d3748"]}
                style={extendedStyles.buttonGradient}
              >
                <Ionicons
                  name="person-circle-sharp"
                  size={24}
                  color="#fff"
                  style={extendedStyles.buttonIcon}
                />
                <Text numberOfLines={1} style={extendedStyles.buttonText}>
                  Profile
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Settings Button */}
          <Animated.View
            style={[extendedStyles.buttonContainer, animatedButtonStyle3]}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
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
                <Text numberOfLines={1} style={extendedStyles.buttonText}>
                  Settings
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const menuTouchableStyles =
  "z-10 w-full overflow-hidden shadow-2xl rounded-xl elevation-xl bottom-3";

const getStyles = () => {
  const styles = StyleSheet.create({
    decorationContainer: {
      ...StyleSheet.absoluteFill,
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: 60,
    },
    buttonContainer: {
      width: "100%",
      maxWidth: 300,
      height: 60,
      marginBottom: 16,
    },
    buttonGradient: {
      width: "100%",
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    buttonIcon: {
      marginRight: 12,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
  return styles;
};

export default MainMenuScreen;
