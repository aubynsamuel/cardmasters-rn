import React, { useEffect } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  withRepeat,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface AnimatedShuffleCardProps {
  index: number;
  totalCards: number;
  delay: number;
}

const AnimatedShuffleCard: React.FC<AnimatedShuffleCardProps> = ({
  index,
  totalCards,
  delay,
}) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const { width } = useWindowDimensions();

  // Adjust card size based on screen width
  const CARD_WIDTH = width > 500 ? width * 0.1 : width * 0.2; // Smaller cards for wider screens
  const CARD_HEIGHT = CARD_WIDTH * 1.5;

  useEffect(() => {
    // Fade in with delay based on card index
    opacity.value = withDelay(delay * index, withTiming(1, { duration: 300 }));

    // Scale up with delay
    scale.value = withDelay(delay * index, withTiming(1, { duration: 300 }));

    // Start the shuffling animation after the card appears
    progress.value = withDelay(
      delay * index + 300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate the vertical position based on card index
    const basePosition = (totalCards / 2 - index) * 5;

    // Create a fan-like effect with cards moving in arcs
    const translateY = interpolate(
      progress.value,
      [0, 0.5, 1],
      [basePosition, basePosition - 20, basePosition],
      Extrapolate.CLAMP
    );

    // Cards move horizontally based on their position in the deck
    const translateX = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, index % 2 === 0 ? 30 : -30, 0],
      Extrapolate.CLAMP
    );

    // Cards rotate with different angles based on position
    const rotateZ = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, index % 2 === 0 ? 15 : -15, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: opacity.value,
      transform: [
        { translateX },
        { translateY },
        { rotateZ: `${rotateZ}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Generate a gradient color pair based on the card's index
  const gradientColors = (() => {
    const baseHue = (index * 25) % 360;
    return [`hsl(${baseHue}, 80%, 60%)`, `hsl(${baseHue + 20}, 80%, 40%)`] as [
      string,
      string
    ];
  })();

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 10,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: totalCards - index,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            height: "85%",
            borderWidth: 2,
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: 6,
          }}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const EnhancedShufflingAnimation: React.FC = () => {
  // Create an array of cards
  const totalCards = 12;
  const cards = Array(totalCards).fill(0);
  const delay = 100; // Delay between each card's animation

  return (
    <View
      style={{
        width: "100%",
        height: 300,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cards.map((_, index) => (
        <AnimatedShuffleCard
          key={index}
          index={index}
          totalCards={totalCards}
          delay={delay}
        />
      ))}
    </View>
  );
};

export default EnhancedShufflingAnimation;
