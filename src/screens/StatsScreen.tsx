import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GameRecord } from "@/src/types/gamePlayTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const StatsScreen = () => {
  const [filterMode, setFilterMode] = useState<
    "all" | "multiplayer" | "single-player"
  >("all");
  const [records, setRecords] = useState<GameRecord[]>();
  const navigation = useNavigation();

  const getStoredRecords = async () => {
    const records = await AsyncStorage.getItem("gameRecord");
    if (!records) return;
    const parsedRecords = JSON.parse(records) as GameRecord[];
    if (Array.isArray(parsedRecords)) {
      setRecords(parsedRecords);
    }
  };

  useEffect(() => {
    getStoredRecords();
  }, []);

  const filteredRecords =
    filterMode === "all"
      ? records || []
      : records?.filter((record) => record.mode === filterMode) || [];

  const renderGameRecord = ({ item }: { item: GameRecord }) => {
    const sortedPlayers = [...item.players].sort(
      (a, b) => b.finalScore - a.finalScore
    );

    return (
      <LinearGradient
        colors={
          item.winnerName === "You"
            ? ["#0a8132", "#076324"]
            : ["#4a5568", "#2d3748"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-4 mb-4 overflow-hidden shadow-md rounded-2xl"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="px-2 py-1 rounded-lg bg-white/20">
            <Text className="text-xs font-semibold text-white">
              {item.mode === "multiplayer" ? "Multi" : "Solo"}
            </Text>
          </View>
          <Text className="text-xs text-white/80">{item.dateString}</Text>
        </View>

        <View className="flex-row justify-between mb-3">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="trophy" size={18} color="#FFD700" />
            <Text className="ml-1 mr-1 text-white/70">Winner:</Text>
            <Text className="font-bold text-white">
              {item.winnerName}
              {item.winnerName === "You" && " 🎉"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="target" size={18} color="#ff7e47" />
            <Text className="ml-1 mr-1 text-white/70">Target:</Text>
            <Text className="text-white">{item.targetScore} pts</Text>
          </View>
        </View>

        <View className="bg-black/10 rounded-lg p-2.5">
          <Text className="mb-2 text-xs text-white/80">Players & Scores:</Text>
          <View className="flex-row flex-wrap justify-between">
            {sortedPlayers.map((player, index) => (
              <View
                key={player.id}
                className={`flex-row items-center bg-white/10 rounded-md p-1.5 mb-1.5 w-full ${
                  player.id === item.winnerId ? "bg-[#FFD700]/20" : ""
                }`}
              >
                <Text className="w-6 text-xs text-white/60">#{index + 1}</Text>
                <Text className="flex-1 font-medium text-white">
                  {player.name}
                </Text>
                <Text className="font-bold text-white">
                  {player.finalScore} pts
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient
      colors={["#076324", "#076345"]}
      className="flex-1 pt-8 md:pt-5"
    >
      <TouchableOpacity
        className="absolute left-3 top-5"
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <View className="px-5 mb-4">
        <Text className="text-[28px] font-bold text-white text-center">
          Game History
        </Text>
      </View>

      <View className="flex-row justify-between px-4 mb-4 md:px-10">
        <TouchableOpacity
          onPress={() => setFilterMode("all")}
          className={`py-2 px-4 rounded-full items-center flex-1 mx-1 ${
            filterMode === "all" ? "bg-white" : "bg-white/20"
          }`}
        >
          <Text
            className={`font-semibold ${
              filterMode === "all" ? "text-[#076324]" : "text-white/90"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterMode("multiplayer")}
          className={`py-2 px-4 rounded-full items-center flex-1 mx-1 ${
            filterMode === "multiplayer" ? "bg-white" : "bg-white/20"
          }`}
        >
          <Text
            className={`font-semibold ${
              filterMode === "multiplayer" ? "text-[#076324]" : "text-white/90"
            }`}
          >
            Multiplayer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterMode("single-player")}
          className={`py-2 px-4 rounded-full items-center flex-1 mx-1 ${
            filterMode === "single-player" ? "bg-white" : "bg-white/20"
          }`}
        >
          <Text
            className={`font-semibold ${
              filterMode === "single-player"
                ? "text-[#076324]"
                : "text-white/90"
            }`}
          >
            Solo
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-around px-4 mb-5 md:px-10">
        <View className="items-center flex-1 p-3 mx-1 bg-white/15 rounded-2xl">
          <Text className="text-2xl font-bold text-white">
            {records?.length}
          </Text>
          <Text className="mt-1 text-xs text-white/80">Games</Text>
        </View>
        <View className="items-center flex-1 p-3 mx-1 bg-white/15 rounded-2xl">
          <Text className="text-2xl font-bold text-white">
            {records?.filter((game) => game.winnerName === "You").length}
          </Text>
          <Text className="mt-1 text-xs text-white/80">Wins</Text>
        </View>
        <View className="items-center flex-1 p-3 mx-1 bg-white/15 rounded-2xl">
          <Text className="text-2xl font-bold text-white">
            {records?.filter((game) => game.mode === "multiplayer").length}
          </Text>
          <Text className="mt-1 text-xs text-white/80">Multi</Text>
        </View>
      </View>

      <FlatList
        data={filteredRecords.reverse()}
        renderItem={renderGameRecord}
        keyExtractor={(item, index) =>
          item.gameId ? item.gameId.toString() : index.toString()
        }
        contentContainerStyle={{
          padding: 14,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        className="md:px-7"
      />
    </LinearGradient>
  );
};

export default StatsScreen;
