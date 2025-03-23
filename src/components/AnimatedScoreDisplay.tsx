import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  withTiming,
} from "react-native-reanimated";

interface AnimatedScoreDisplayProps {
  points: number;
  visible: boolean;
}

const AnimatedScoreDisplay: React.FC<AnimatedScoreDisplayProps> = ({
  points,
  visible,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
        mass: 0.5,
      });
      opacity.value = withTiming(1, { duration: 300 });
      rotation.value = withSpring(0, { damping: 5 });
      colorProgress.value = withTiming(1, { duration: 500 });
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, { duration: 200 });
      colorProgress.value = withTiming(0, { duration: 300 });
    }
  }, [visible, points]);

  // When points change, add a little bounce effect
  useEffect(() => {
    if (visible && points > 0) {
      // eslint-disable-next-line react-compiler/react-compiler
      scale.value = withSpring(1.2, {
        damping: 4,
        stiffness: 200,
      });
      rotation.value = withSpring(-0.05, { damping: 3 });

      // Return to normal size after the bounce
      setTimeout(() => {
        scale.value = withSpring(1);
        rotation.value = withSpring(0);
      }, 300);
    }
  }, [points]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}rad` }],
      opacity: opacity.value,
    };
  });

  const textColorStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ["#FFFFFF", "#FFFFFF"]
    );

    return {
      color: textColor,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.mainText, textColorStyle]}>
          + {points}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 5,
    right: 15,
  },
  textContainer: {
    position: "relative",
  },
  mainText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default AnimatedScoreDisplay;
