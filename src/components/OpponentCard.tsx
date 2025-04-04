import { StyleSheet, View } from "react-native";
import React from "react";
import DiagonalStripes from "./DiagonalStripes";
import Colors from "../Colors";

const OpponentCard = ({
  index,
  numberOfCards,
}: {
  index: number;
  numberOfCards: number;
}) => {
  const rotateAngleMap: Record<number, Record<number, number>> = {
    5: { 0: -220, 1: -200, 2: 180, 3: 200, 4: 220 },
    4: { 0: -220, 1: -200, 2: 200, 3: 220 },
    3: { 0: -200, 1: -180, 2: 200 },
    2: { 0: -200, 1: 200 },
    1: { 0: -180 },
    0: {},
  };

  const transXMap: Record<number, Record<number, number>> = {
    5: { 0: -40, 1: -20, 2: 0, 3: 20, 4: 40 },
    4: { 0: -30, 1: -10, 2: 10, 3: 30 },
    3: { 0: -20, 1: 0, 2: 20 },
    2: { 0: -10, 1: 10 },
    1: { 0: 0 },
    0: {},
  };

  return (
    <View
      // key={index}
      style={[
        styles.cardBack,
        {
          transform: [
            { rotateZ: `${rotateAngleMap[numberOfCards][index]}deg` },
            { translateX: transXMap[numberOfCards][index] },
          ],
        },
      ]}
    >
      <DiagonalStripes />
    </View>
  );
};

const styles = StyleSheet.create({
  cardBack: {
    // margin: 5,
    backgroundColor: Colors.cardBackBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBackBorder,
    // alignItems: "center",
    // justifyContent: "center",
    alignSelf: "center",
    top: 25,
    height: 70,
    width: 45,
    elevation: 10,
    position: "absolute",
  },
});

export default OpponentCard;
