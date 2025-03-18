import React from "react";
import DiagonalStripes from "./DiagonalStripes";
import { View } from "react-native";

interface DecKCardInterface {
  index: number;
  styles: any;
}

const DeckCard: React.FC<DecKCardInterface> = ({ index, styles }) => {
  return (
    <View
      key={index}
      style={[styles.deckCardBack, { transform: [{ translateX: index * 5 }] }]}
    >
      <DiagonalStripes />
    </View>
  );
};

export default DeckCard;
