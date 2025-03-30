import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import DeckCard from "./DeckCard";
import Colors from "../Colors";
import { Deck, GameScore } from "../Types";
import { Ionicons } from "@expo/vector-icons";
import { gameScoreToString } from "../gameLogic/GameUtils";

interface TopRowInterface {
  deck: Deck;
  gameScoreList: GameScore[];
  setShowControlsOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

const TopRow: React.FC<TopRowInterface> = ({
  deck,
  gameScoreList,
  setShowControlsOverlay,
}) => {
  return (
    <View
      key={"TopRow"}
      style={[
        {
          flex: 0.1,
          justifyContent: "space-between",
          flexDirection: "row",
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

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Score */}
        <View
          style={{
            padding: 5,
            height: 80,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: Colors.mainTextColor,
              fontWeight: "bold",
            }}
          >
            {gameScoreToString(gameScoreList)}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          style={styles.controlsButton}
          onPress={() => setShowControlsOverlay(true)}
        >
          <Ionicons name="settings-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsButton: {
    // position: "absolute",
    // bottom: 20,
    // right: 20,
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: Colors.buttonBackground,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default TopRow;
