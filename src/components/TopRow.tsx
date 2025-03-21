import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import DeckCard from "./DeckCard";
import Colors from "../Colors";
import { GameState } from "../Types";
import { Ionicons } from "@expo/vector-icons";

export interface GameScore {
  human: number;
  computer: number;
}
interface TopRowInterface {
  gameState: GameState;
  gameScore: GameScore;
  setShowControlsOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}
const TopRow: React.FC<TopRowInterface> = ({
  gameState,
  gameScore,
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
          {gameState.deck.map((deck, index) => (
            <DeckCard index={index} key={index + deck.rank} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Score */}
        <Text style={{ color: Colors.mainTextColor, fontWeight: "bold" }}>
          {`AI ${gameScore.computer} : ${gameScore.human} You`}
        </Text>

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
