import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import React from "react";
import DeckCard from "./DeckCard";
import Colors from "../Colors";
import { Deck, GameScore } from "../Types";
import { Ionicons } from "@expo/vector-icons";
import { gameScoreToString } from "../gameLogic/GameUtils";
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
  const { width } = useWindowDimensions();
  return (
    <>
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
                lineHeight: 20,
              }}
            >
              {gameScoreToString(gameScoreList)}
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
      <View
        style={{
          width: "100%",
          alignItems: "center",
          top: width > 400 ? -10 : 8,
        }}
      >
        <Text
          style={{
            backgroundColor: "#FFD700",
            borderRadius: 10,
            padding: 4,
            fontWeight: "bold",
            // color: "#0009",
          }}
        >
          Game-To : {gameTo}
        </Text>
      </View>
    </>
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
