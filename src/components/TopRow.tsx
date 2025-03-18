import { View, Text } from "react-native";
import React from "react";
import DeckCard from "./DeckCard";
import Colors from "../Colors";
import { GameState, roundsType } from "../Types";

interface TopRowInterface {
  gameState: GameState;
  rounds: roundsType[];
  styles: any;
}
const TopRow: React.FC<TopRowInterface> = ({ rounds, gameState, styles }) => {
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
            <DeckCard index={index} styles={styles} key={index + deck.rank} />
          ))}
        </View>
      </View>

      {/* Rounds */}
      <View
        style={{
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: Colors.mainTextColor }}>Rounds</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
          }}
        >
          {rounds.map((round, index) => (
            <View
              key={index + round.roundNUmber}
              style={{
                height: 15,
                width: 15,
                backgroundColor: round.active ? "yellow" : "lightgray",
                borderRadius: 30,
                borderColor: "red",
                borderWidth: 2,
                marginBottom: 5,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default TopRow;
