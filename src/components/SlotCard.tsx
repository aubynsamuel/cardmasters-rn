import { TextStyle, Text, StyleSheet, View } from "react-native";
import { suitSymbols } from "../functions/GameFunctions";
import { Card } from "../Types";
import React from "react";
import Animated, { ZoomIn } from "react-native-reanimated";

const SlotCard = ({ card }: { card: Card }) => {
  const colorStyle: TextStyle =
    card?.suit === "love" || card?.suit === "diamond"
      ? { color: "red" }
      : { color: "black" };

  return (
    <Animated.View entering={ZoomIn.duration(300).springify(200)}>
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: "white",
          },
        ]}
      >
        <Text style={[styles.cardRank, colorStyle]}>{card.rank}</Text>
        <Text style={[styles.cardSymbol, colorStyle]}>
          {suitSymbols[card.suit]}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardSymbol: {
    fontSize: 25,
    fontWeight: "500",
    alignSelf: "center",
  },
  cardContainer: {
    height: 70,
    width: 45,
    justifyContent: "center",
    borderColor: "lightgray",
    borderWidth: 1,
    margin: 5,
    borderRadius: 8,
    elevation: 10,
    padding: 5,
  },
  cardRank: {
    top: 2,
    left: 3,
    position: "absolute",
    fontSize: 15,
    fontWeight: 700,
  },
});

export default SlotCard;
