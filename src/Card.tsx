import { TextStyle, Text, StyleSheet, View } from "react-native";
import { suitSymbols } from "./GameFunctions";
import { Card } from "./Types";
import React from "react";
import Animated, {
  BounceInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";

const RenderCard = ({
  card,
  playCard,
}: {
  card: Card | null;
  playCard: () => void;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const ctx = useSharedValue({ startX: 0, startY: 0 });
  // const [zIndex, setZIndex] = useState<any>(1);

  const noPan = Gesture.Pan();
  const panGesture = Gesture.Pan()
    .onStart(() => {
      ctx.value = { startX: translateX.value, startY: translateY.value };
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
        event.absoluteX > 150 &&
        card !== null
      ) {
        runOnJS(playCard)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
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
    ],
  }));

  return (
    <GestureDetector gesture={card !== null ? panGesture : noPan}>
      <TouchableWithoutFeedback onPress={playCard}>
        <Animated.View
          entering={BounceInUp.duration(1000)}
          style={cardAnimation}
        >
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: card === null ? "gray" : "lightblue",
              },
            ]}
          >
            <Text style={[styles.cardRank, colorStyle]}>
              {card?.rank || ""}
            </Text>
            <Text style={[styles.cardSymbol, colorStyle]}>
              {card ? suitSymbols[card.suit] : ""}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
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
