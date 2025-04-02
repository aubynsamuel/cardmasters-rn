import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "../AuthContext";
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

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userEmail, userData, logout } = useAuth();
  const { width } = useWindowDimensions();

  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);
  const decorationScale = useSharedValue(0);

  useEffect(() => {
    // Animate background
    backgroundOpacity.value = withTiming(1, { duration: 800 });

    // Animate header
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 14, stiffness: 100 })
    );

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

    // Animate button
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    buttonTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 14, stiffness: 100 })
    );

    // Animate decorations
    decorationScale.value = withDelay(
      400,
      withSpring(1, { damping: 10, stiffness: 80 })
    );
  }, []);

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const animatedDecorationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: decorationScale.value }],
    opacity: decorationScale.value,
  }));

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate("Auth" as never);
    } catch {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const userInitial = userData?.displayName
    ? userData.displayName[0].toUpperCase()
    : "U";

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View
        style={[styles.backgroundContainer, animatedBackgroundStyle]}
      >
        <LinearGradient
          colors={["#076324", "#076345"]}
          style={styles.gradientBackground}
        >
          {/* Decorative elements */}
          <Animated.View
            style={[styles.decorationContainer, animatedDecorationStyle]}
          >
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
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Header with back button */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholderRight} />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Profile Card */}
        <Animated.View style={[styles.profileCardContainer, animatedCardStyle]}>
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(245,245,245,0.9)"]}
            style={styles.profileCard}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#0a8132", "#076324"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{userInitial}</Text>
              </LinearGradient>
              <View style={styles.underline} />
            </View>

            {/* User Info */}
            <Animated.View style={[styles.infoSection, animatedContentStyle]}>
              {userData?.displayName && (
                <Text style={styles.displayName}>{userData.displayName}</Text>
              )}

              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color="#076324" />
                <Text style={styles.infoText}>{userEmail}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color="#076324" />
                <Text style={styles.infoText}>
                  Joined:{" "}
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString()
                    : "Unknown"}
                </Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Games</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
              </View>
            </Animated.View>

            {/* Logout Button */}
            <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#ff7e47", "#ff5722"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Logout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placeholderRight: {
    width: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileCardContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
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
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    marginTop: 12,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#444",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#076324",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  buttonWrapper: {
    width: "100%",
    marginTop: 8,
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
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 10,
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
