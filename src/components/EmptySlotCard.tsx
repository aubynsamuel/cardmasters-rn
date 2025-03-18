import { StyleSheet, View } from "react-native";
import React from "react";

const EmptyCard = () => {
  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: "gray",
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
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
});

export default EmptyCard;
