import { TextStyle, Text, StyleSheet, View } from "react-native";
import { suitSymbols } from "../functions/GameFunctions";
import { Card } from "../Types";
import React, { useEffect } from "react";
import Animated, {
  FlipInEasyX,
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

interface CardComponentInterface {
  card: Card;
  playCard: () => boolean | undefined;
  isDealt?: boolean;
  dealDelay?: number;
  width: number;
}

const CardComponent = ({
  card,
  playCard,
  isDealt = false,
  dealDelay = 0,
  width,
}: CardComponentInterface) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isDealt ? 0.5 : 1);
  const rotate = useSharedValue(isDealt ? "45deg" : "0deg");
  const ctx = useSharedValue({ startX: 0, startY: 0 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDealt) {
      timer = setTimeout(() => {
        scale.value = withSpring(1);
        rotate.value = withTiming("0deg", { duration: 300 });
        // Play card slide sound here if you have sound effects
      }, dealDelay);
    }
    return () => clearTimeout(timer);
  }, []);

  function visualEffectForUnsuccessfulPlays() {
    const afterEffect = playCard();
    if (afterEffect === false) {
      translateX.value = withSpring(0, { duration: 500 });
      translateY.value = withSpring(0, { duration: 500 });
    }
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      ctx.value = { startX: translateX.value, startY: translateY.value };
      // eslint-disable-next-line react-compiler/react-compiler
      scale.value = withTiming(1.1, { duration: 150 });
    })
    .onUpdate((event) => {
      translateX.value = ctx.value.startX + event.translationX;
      translateY.value = ctx.value.startY + event.translationY;
    })
    .onEnd((event) => {
      scale.value = withTiming(1, { duration: 150 });
      if (
        event.absoluteY > (width < 400 ? 378 : 85) &&
        event.absoluteY < (width < 400 ? 470 : 230) &&
        event.absoluteX < (width < 400 ? 230 : 525) &&
        event.absoluteX > (width < 400 ? 150 : 430)
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
      { rotate: rotate.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[cardAnimation]}>
        <TouchableWithoutFeedback onPress={playCard}>
          <Animated.View
            entering={
              isDealt ? FlipInEasyX.delay(dealDelay).duration(400) : undefined
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

export default CardComponent;
