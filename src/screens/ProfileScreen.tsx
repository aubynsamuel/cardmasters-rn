import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useCustomAlerts } from "../context/CustomAlertsContext";
import { GameRecord } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userEmail, userData, logout } = useAuth();
  const { width } = useWindowDimensions();
  const { showAlert } = useCustomAlerts();

  // Animation values
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const [records, setRecords] = useState<GameRecord[]>();

  const getStoredRecords = async () => {
    const records = await AsyncStorage.getItem("gameRecord");
    if (!records) return;
    const parsedRecords = JSON.parse(records) as GameRecord[];
    if (Array.isArray(parsedRecords)) {
      setRecords(parsedRecords);
    }
  };

  const gameWon =
    records?.filter((game) => game.winnerName === "You").length || 0;

  useEffect(() => {
    getStoredRecords();
  }, []);

  useEffect(() => {
    // Animate header
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Animate card
    cardOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    cardScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 90 })
    );

    // Animate content
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
  }, []);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Auth" as never }] });
    } catch {
      showAlert({
        title: "Error",
        message: "Failed to log out. Please try again.",
        type: "error",
      });
    }
  };

  const userInitial = userData?.displayName
    ? userData.displayName[0].toUpperCase()
    : "U";

  return (
    <View className="flex-1 bg-[#076324]">
      <LinearGradient
        colors={["#076324", "#076345"]}
        className="flex-1"
        style={[styles.backgroundContainer]}
      >
        {/* Decorative elements */}
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              style={[
                styles.cardDecoration,
                {
                  top: 80 + i * 120,
                  left: i % 2 === 0 ? 20 : width - 70,
                  transform: [{ rotate: `${i * 35}deg` }],
                },
              ]}
            />
          ))}
      </LinearGradient>

      {/* Header with back button */}
      <TouchableOpacity
        className="absolute left-3 top-5"
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Main Content */}
      <View className="items-center justify-center flex-1 px-5">
        {/* Profile Card */}
        <View className="w-full md:w-11/12 md:mb-5 md:mt-5">
          <Animated.ScrollView
            style={[styles.profileCardContainer, animatedCardStyle]}
            contentContainerStyle={{
              overflow: "hidden",
              backgroundColor: "rgba(245,245,245,0.9)",
              padding: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View className="items-center mb-6">
              <LinearGradient
                colors={["#0a8132", "#076324"]}
                style={styles.avatar}
              >
                <Text className="text-4xl font-bold text-white">
                  {userInitial}
                </Text>
              </LinearGradient>
              <View className="h-1 w-16 mt-3 bg-[#FFD700] rounded-sm" />
            </View>

            {/* User Info */}
            <Animated.View style={[animatedContentStyle]} className={"mb-6"}>
              <Text className="text-2xl font-bold text-[#333] text-center mb-4">
                {userData?.displayName}
              </Text>

              <View className="flex-row items-center mb-3 pb-3 border-b border-b-[#0002]">
                <Ionicons name="mail-outline" size={20} color="#076324" />
                <Text className="ml-3 text-lg text-[#444]">{userEmail}</Text>
              </View>

              <View className="flex-row items-center mb-3 pb-3 border-b border-b-[#0002]">
                <Ionicons name="calendar-outline" size={20} color="#076324" />
                <Text className="ml-3 text-lg text-[#444]">
                  Joined:{" "}
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString()
                    : "Unknown"}
                </Text>
              </View>

              {/* Game Stats */}
              <View className="flex-row justify-around pt-4 mt-4 border-t border-t-[#0002]">
                <View className="items-center">
                  <Text className="font-bold text-[#076324] text-2xl">
                    {records?.length ?? 0}
                  </Text>
                  <Text className="text-sm text-[#666] mt-1">Games</Text>
                </View>
                <View className="items-center">
                  <Text className="font-bold text-[#076324] text-2xl">
                    {gameWon}
                  </Text>
                  <Text className="text-sm text-[#666] mt-1">Wins</Text>
                </View>
                <View className="items-center">
                  <Text className="font-bold text-[#076324] text-2xl">
                    {((gameWon / (records?.length ?? 0)) * 100).toFixed(2)}%
                  </Text>
                  <Text className="text-sm text-[#666] mt-1">Win Rate</Text>
                </View>
                <TouchableOpacity
                  className="absolute right-0 top-1"
                  onPress={() => navigation.navigate("StatsScreen" as never)}
                >
                  <Ionicons name="stats-chart" size={22} color={"#094319"} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Logout Button */}
            <View className={"w-full mt-2"}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#ff7e47", "#ff5722"]}
                  className="flex-row items-center justify-center px-6 py-4 rounded-xl"
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#fff"
                    className="mr-2.5"
                  />
                  <Text style={styles.buttonText}>Logout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileCardContainer: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default ProfileScreen;
