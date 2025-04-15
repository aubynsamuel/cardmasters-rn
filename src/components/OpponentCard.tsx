import { StyleSheet, View } from "react-native";
import React from "react";
import DiagonalStripes from "./DiagonalStripes";
import Colors from "../theme/colors";

const OpponentCard = () => {
  return (
    <View style={[styles.cardBack]}>
      <DiagonalStripes />
    </View>
  );
};

const styles = StyleSheet.create({
  cardBack: {
    margin: 5,
    backgroundColor: Colors.cardBackBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBackBorder,
    alignSelf: "center",
    height: 70,
    width: 45,
    elevation: 10,
  },
});

export default OpponentCard;
