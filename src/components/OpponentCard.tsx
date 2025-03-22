import { StyleSheet, View } from "react-native";
import React from "react";
import Animated, { FlipInEasyX } from "react-native-reanimated";
import DiagonalStripes from "./DiagonalStripes";
import Colors from "../Colors";

interface opponentCardInterface {
  index: number;
  isDealing: boolean;
}
const OpponentCard: React.FC<opponentCardInterface> = ({
  index,
  isDealing,
}) => {
  return (
    <Animated.View
      key={`opponent-card-${index}`}
      entering={
        isDealing ? FlipInEasyX.delay(index * 200).duration(300) : undefined
      }
    >
      <View style={styles.cardBack}>
        <DiagonalStripes />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardBack: {
    margin: 5,
    backgroundColor: Colors.cardBackBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBackBorder,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    width: 45,
    elevation: 10,
  },
});

export default OpponentCard;
