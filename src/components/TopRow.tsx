import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import DeckCard from "./DeckCard";
import Colors from "../theme/colors";
import { Deck, GameScore } from "../types/types";
import { Ionicons } from "@expo/vector-icons";
import { gameScoreToString } from "../gameLogic/utils";
import { LinearGradient } from "expo-linear-gradient";

interface TopRowInterface {
  deck: Deck;
  gameScoreList: GameScore[];
  setShowControlsOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  gameTo: number;
}

const TopRow: React.FC<TopRowInterface> = ({
  deck,
  gameScoreList,
  setShowControlsOverlay,
  gameTo,
}) => {
  const sortedScores = [...gameScoreList].sort((a, b) => b.score - a.score);

  return (
    <View
      key={"TopRow"}
      style={[
        {
          justifyContent: "space-between",
          flexDirection: "row",
          width: "100%",
          paddingHorizontal: 10,
        },
      ]}
    >
      {/* Remaining Deck */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: Colors.mainTextColor }}>Deck</Text>
        <View
          style={{
            flexDirection: "row",
            top: -35,
            left: 0,
          }}
        >
          {deck.map((deckItem, index) => (
            <DeckCard index={index} key={index + deckItem.rank} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 0 }}>
        {/* Score */}
        <View
          style={{
            padding: 5,
            height: 80,
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Text className="font-bold text-mainTextColor">
            {gameScoreToString(sortedScores)}
          </Text>
          <Text
            style={{
              color: Colors.cardShadow,
              fontWeight: "bold",
              backgroundColor: Colors.gold,
              padding: 5,
              borderRadius: 30,
            }}
          >
            {gameTo}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          style={styles.controlsButton}
          onPress={() => setShowControlsOverlay(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[Colors.buttonBackground, "#054d1c"]}
            style={styles.controlsGradient}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsButton: {
    borderRadius: 22,
    elevation: 4,
  },
  controlsGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});

export default TopRow;
