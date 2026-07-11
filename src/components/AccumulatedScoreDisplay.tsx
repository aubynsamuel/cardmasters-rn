import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface AccumulatedScoreDisplayProps {
  points: number;
  visible: boolean;
}

const AccumulatedScoreDisplay: React.FC<AccumulatedScoreDisplayProps> = ({
  points,
  visible,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1.2, {
        damping: 4,
        stiffness: 200,
      });
      opacity.value = withTiming(1, { duration: 300 });

      setTimeout(() => {
        scale.value = withSpring(1);
      }, 300);
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, points, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text className={`text-xl font-bold text-white`}>+ {points}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", right: 16, top: 5 },
});

export default AccumulatedScoreDisplay;
