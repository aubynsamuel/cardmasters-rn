import React from "react";
import DiagonalStripes from "./DiagonalStripes";
import { StyleSheet, View } from "react-native";
import Colors from "../theme/Colors";

interface DecKCardInterface {
  index: number;
}

const DeckCard: React.FC<DecKCardInterface> = ({ index }) => {
  return (
    <View
      key={index}
      style={[styles.deckCardBack, { transform: [{ translateX: index * 3 }] }]}
    >
      <DiagonalStripes />
    </View>
  );
};

const styles = StyleSheet.create({
  deckCardBack: {
    margin: 5,
    backgroundColor: Colors.cardBackBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBackBorder,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: 40,
    position: "absolute",
    elevation: 5,
  },
});

export default DeckCard;
