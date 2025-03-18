import { TextStyle, Text, StyleSheet, View } from "react-native";
import { suitSymbols } from "../functions/GameFunctions";
import { Card } from "../Types";
import React, { useEffect, useState } from "react";
import Animated, {
  FlipInEasyX,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";

const RenderCard = ({
  card,
  playCard,
  isDealt = false,
  dealDelay = 0,
  canPlayCard = false,
}: {
  card: Card;
  playCard: () => void;
  isDealt?: boolean;
  dealDelay?: number;
  canPlayCard?: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isDealt ? 0.5 : 1);
  const rotate = useSharedValue(isDealt ? "45deg" : "0deg");
  const ctx = useSharedValue({ startX: 0, startY: 0 });
  const [isDragged, setIsDragged] = useState(false);
  // const [showAlert, setShowAlert] = useState(false);

  // useEffect(() => {
  //   if (showAlert) {
  //     Alert.alert("", "It is not your turn to play");
  //     setShowAlert(false);
  //   }
  // }, [showAlert]);

  useEffect(() => {
    if (isDealt) {
      setTimeout(() => {
        scale.value = withSpring(1);
        rotate.value = withTiming("0deg", { duration: 300 });
        // Play card slide sound here if you have sound effects
      }, dealDelay);
    }
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      ctx.value = { startX: translateX.value, startY: translateY.value };
      scale.value = withTiming(1.1, { duration: 150 });
      runOnJS(setIsDragged)(true);
    })
    .onUpdate((event) => {
      translateX.value = ctx.value.startX + event.translationX;
      translateY.value = ctx.value.startY + event.translationY;
    })
    .onEnd((event) => {
      if (
        event.absoluteY > 378 &&
        event.absoluteY < 470 &&
        event.absoluteX < 230 &&
        event.absoluteX > 150
        // && canPlayCard
      ) {
        runOnJS(playCard)();
        // runOnJS(setIsDragged)(false);
      } else {
        translateX.value = withSpring(0, { duration: 500 });
        translateY.value = withSpring(0, { duration: 500 });
        // runOnJS(setShowAlert)(true);
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
      { rotate: rotate.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[cardAnimation]}>
        <TouchableWithoutFeedback onPress={playCard}>
          <Animated.View
            entering={
              isDealt
                ? FlipInEasyX.delay(dealDelay).duration(400)
                : isDragged
                ? undefined
                : ZoomIn.duration(300).springify(200)
            }
          >
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
