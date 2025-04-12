import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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

const MainMenuScreen = () => {
  const navigation = useNavigation();
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

  useEffect(() => {
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
      500,
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
          style={[animatedTitleStyle]}
          className={"items-center mb-[60px]"}
        >
          <Text className="text-[38px] font-bold text-white shadow-xl">
            Card Masters
          </Text>
          <View className="w-[150px] h-1 bg-[#FFD700] mt-2.5 rounded-s-sm" />
        </Animated.View>

        <View className="flex-row flex-wrap items-center w-full gap-5 justify-evenly">
          {/* SinglePlayer Button */}
          <Animated.View
            style={[animatedButtonStyle1]}
            className={buttonStyles + "elevation-2xl"}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
              onPress={() => navigation.navigate("Game" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#0a8132", "#076324"]}
                className={linearGradientStyles}
              >
                <Ionicons
                  name="game-controller"
                  size={24}
                  color="#fff"
                  className="mr-3"
                />
                <Text
                  numberOfLines={1}
                  className="text-white text-[18px] font-bold shadow-sm"
                >
                  SinglePlayer
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Multiplayer Button */}
          <Animated.View
            style={[animatedButtonStyle2]}
            className={buttonStyles}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
              onPress={() => navigation.navigate("MultiplayerLobby" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#ff7e47", "#ff5722"]}
                className={linearGradientStyles}
              >
                <Ionicons
                  name="people"
                  size={24}
                  color="#fff"
                  className="mr-3"
                />
                <Text
                  numberOfLines={1}
                  className="text-white text-[18px] font-bold shadow-sm"
                >
                  Multiplayer
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Profile Button */}
          <Animated.View
            style={[animatedButtonStyle3]}
            className={buttonStyles}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
              onPress={() => navigation.navigate("ProfileScreen" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["plum", "#2d3748"]}
                className={linearGradientStyles}
              >
                <Ionicons
                  name="person-circle-sharp"
                  size={24}
                  color="#fff"
                  className="mr-3"
                />
                <Text
                  numberOfLines={1}
                  className="text-white text-[18px] font-bold shadow-sm"
                >
                  Profile
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Settings Button */}
          <Animated.View
            style={[animatedButtonStyle3]}
            className={buttonStyles}
          >
            <TouchableOpacity
              className={menuTouchableStyles}
              onPress={() => navigation.navigate("Settings" as never)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#4a5568", "#2d3748"]}
                className={linearGradientStyles}
              >
                <Ionicons
                  name="settings"
                  size={24}
                  color="#fff"
                  className="mr-3"
                />
                <Text
                  numberOfLines={1}
                  className="text-white text-[18px] font-bold shadow-sm"
                >
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

const buttonStyles = "w-[280px] md:w-[300px] h-[60px] md:h-[90px] mb-4";
const linearGradientStyles =
  "w-full flex-row md:flex-col h-full rounded-[12px] items-center py-4 px-6";
const menuTouchableStyles =
  "z-10 w-full overflow-hidden shadow-2xl rounded-xl elevation-xl bottom-3";

const getStyles = () => {
  const styles = StyleSheet.create({
    decorationContainer: {
      ...StyleSheet.absoluteFillObject,
    },
  });
  return styles;
};

export default MainMenuScreen;
