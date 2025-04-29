import { TextStyle, Text, StyleSheet, View } from "react-native";
import { suitSymbols } from "../gameLogic/utils";
import { Card } from "../types/GamePlayTypes";
import React from "react";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { useCustomAlerts } from "../context/CustomAlertsContext";

interface CardComponentInterface {
  card: Card;
  playCard: () => { error: string; message: string } | undefined;
  width: number;
  index: number;
  numberOfCards: number;
}

const CardComponent = ({ card, playCard, width }: CardComponentInterface) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const ctx = useSharedValue({ startX: 0, startY: 0 });
  const { showToast } = useCustomAlerts();

  function visualEffectForUnsuccessfulPlays() {
    const afterEffect = playCard();
    if (!afterEffect) return;
    if (afterEffect?.error !== "" && afterEffect?.message !== "") {
      // eslint-disable-next-line react-compiler/react-compiler
      translateX.value = withSpring(0, { duration: 500 });
      translateY.value = withSpring(0, { duration: 500 });
      showToast({
        message: afterEffect.message,
        duration: 2000,
        type: "error",
      });
    }
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      ctx.value = { startX: translateX.value, startY: translateY.value };
      scale.value = withTiming(1.1, { duration: 150 });
    })
    .onUpdate((event) => {
      translateX.value = ctx.value.startX + event.translationX;
      translateY.value = ctx.value.startY + event.translationY;
    })
    .onEnd((event) => {
      scale.value = withTiming(1, { duration: 150 });
      if (
        event.absoluteY > (width < 500 ? 378 : 85) &&
        event.absoluteY < (width < 500 ? 470 : 230) &&
        event.absoluteX < (width < 500 ? 230 : 525) &&
        event.absoluteX > (width < 500 ? 150 : 430)
      ) {
        runOnJS(visualEffectForUnsuccessfulPlays)();
      } else {
        translateX.value = withSpring(0, { duration: 500 });
        translateY.value = withSpring(0, { duration: 500 });
      }
    });

  const colorStyle: TextStyle =
    card?.suit === "love" || card?.suit === "diamond"
      ? { color: "red" }
      : { color: "black" };

  const cardAnimation = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[cardAnimation]}>
        <TouchableWithoutFeedback onPress={visualEffectForUnsuccessfulPlays}>
          <View
            style={[
              styles.cardContainer,
              { marginHorizontal: 5 },
              { backgroundColor: "white" },
            ]}
          >
            <Text style={[styles.cardRank, colorStyle]}>{card.rank}</Text>
            <Text style={[styles.cardSymbol, colorStyle]}>
              {suitSymbols[card.suit]}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </GestureDetector>
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
    borderRadius: 8,
    elevation: 10,
    padding: 5,
    alignSelf: "center",
    margin: 5,
  },
  cardRank: {
    top: 2,
    left: 3,
    position: "absolute",
    fontSize: 15,
    fontWeight: 700,
  },
});

export default CardComponent;
