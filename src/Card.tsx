import { TextStyle, View, Text, StyleSheet } from "react-native";
import { suitSymbols } from "./GameFunctions";
import { Card } from "./Types";
import React from "react";

const RenderCard = ({ card }: { card: Card | null }) => {
  const colorStyle: TextStyle =
    card?.suit === "love" || card?.suit === "diamond"
      ? { color: "red" }
      : { color: "black" };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: card === null ? "gray" : "lightblue",
        },
      ]}
    >
      <Text style={[styles.cardRank, colorStyle]}>{card?.rank || ""}</Text>
      <Text style={[styles.cardSymbol, colorStyle]}>
        {card ? suitSymbols[card.suit] : ""}
      </Text>
    </View>
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
    elevation: 5,
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

export default RenderCard;
