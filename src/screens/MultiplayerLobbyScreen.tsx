import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

interface LobbyRoom {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "playing" | "full";
}

export type RootStackParamList = {
  OnlineGame: {
    roomId: string;
  };
};

type OnlineGameProps = NativeStackNavigationProp<
  RootStackParamList,
  "OnlineGame"
>;

// Enhanced dummy data with more details
const dummyRooms: LobbyRoom[] = [
  {
    id: "1",
    name: "Card Masters",
    players: 2,
    maxPlayers: 4,
    status: "waiting",
  },
  { id: "2", name: "Quick Game", players: 3, maxPlayers: 4, status: "playing" },
  {
    id: "3",
    name: "Beginners Only",
    players: 1,
    maxPlayers: 2,
    status: "waiting",
  },
  { id: "4", name: "High Stakes", players: 4, maxPlayers: 4, status: "full" },
  {
    id: "5",
    name: "Tournament Room",
    players: 2,
    maxPlayers: 8,
    status: "waiting",
  },
];

const AnimatedStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getStatusColor = () => {
    switch (status) {
      case "waiting":
        return ["#4CAF50", "#2E7D32"];
      case "playing":
        return ["#FF9800", "#F57C00"];
      case "full":
        return ["#9E9E9E", "#616161"];
      default:
        return ["#4CAF50", "#2E7D32"];
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "playing":
        return "In Game";
      case "full":
        return "Full";
      default:
        return "Waiting";
    }
  };

  return (
    <Animated.View style={[styles.badgeContainer, animatedStyle]}>
      <LinearGradient
        colors={getStatusColor() as any}
        style={styles.badgeGradient}
      >
        <Text style={styles.badgeText}>{getStatusText()}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const RoomItem: React.FC<{ item: LobbyRoom; onPress: () => void }> = ({
  item,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 50 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const isJoinable = item.status !== "full";

  return (
    <Animated.View style={[styles.roomItemContainer, animatedStyle]}>
      <TouchableOpacity
        style={[styles.roomButton, !isJoinable && styles.disabledRoom]}
        onPress={isJoinable ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={!isJoinable}
      >
        <LinearGradient
          colors={isJoinable ? ["#0a8132", "#076324"] : ["#607D8B", "#455A64"]}
          style={styles.roomGradient}
        >
          <View style={styles.roomContent}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomPlayers}>
                <Ionicons name="people" size={16} color="#e0f2e9" />{" "}
                {item.players}/{item.maxPlayers}
              </Text>
            </View>
            <AnimatedStatusBadge status={item.status} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyRoomsList: React.FC = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="game-controller-outline" size={60} color="#e0f2e9" />
      <Text style={styles.emptyText}>No rooms available</Text>
      <Text style={styles.emptySubText}>
        Create a new room to start playing!
      </Text>
    </View>
  );
};

const MultiplayerLobbyScreen: React.FC = () => {
  const navigation = useNavigation<OnlineGameProps>();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  useEffect(() => {
    // Simulate loading rooms from server
    const timer = setTimeout(() => {
      setRooms(dummyRooms);
      setLoading(false);

      // Start animations
      headerOpacity.value = withTiming(1, { duration: 300 });
      listOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
      buttonOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
      buttonTranslateY.value = withDelay(500, withSpring(0, { damping: 14 }));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const refreshRooms = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRooms([...dummyRooms]);
      setRefreshing(false);
    }, 500);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          headerOpacity.value,
          [0, 1],
          [-20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const listAnimatedStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <LinearGradient colors={["#076324", "#076345"]} style={styles.container}>
      {/* Background decorative elements */}
      <View style={styles.decorationContainer}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              style={[
                styles.cardDecoration,
                {
                  top: 100 + i * 120,
                  left: i % 2 === 0 ? -20 : Dimensions.get("window").width - 40,
                  transform: [{ rotate: `${i * 35}deg` }],
                  opacity: 0.15,
                },
              ]}
            />
          ))}
      </View>

      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Multiplayer Lobby</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshRooms}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, listAnimatedStyle]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e0f2e9" />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RoomItem
                item={item}
                onPress={() =>
                  navigation.navigate("OnlineGame", { roomId: item.id })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refreshRooms}
            refreshing={refreshing}
            ListEmptyComponent={EmptyRoomsList}
          />
        )}
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={styles.createRoomButton}
          onPress={() => navigation.navigate("OnlineGame", { roomId: "new" })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF9800", "#F57C00"]}
            style={styles.createButtonGradient}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.createButtonText}>Create New Room</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#e0f2e9",
    marginTop: 15,
  },
  roomItemContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  roomButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledRoom: {
    opacity: 0.8,
  },
  roomGradient: {
    borderRadius: 12,
  },
  roomContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 5,
  },
  roomPlayers: {
    fontSize: 14,
    color: "#e0f2e9",
  },
  badgeContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  badgeGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  createRoomButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: "#e0f2e9",
    marginTop: 5,
    textAlign: "center",
  },
});

export default MultiplayerLobbyScreen;
