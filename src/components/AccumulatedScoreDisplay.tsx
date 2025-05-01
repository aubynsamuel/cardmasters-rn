import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface AccumulatedScoreDisplay {
  points: number;
  visible: boolean;
}

const AccumulatedScoreDisplay: React.FC<AccumulatedScoreDisplay> = ({
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
  }, [visible, points]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[animatedStyle]}
      className={`absolute top-[5px] right-4`}
    >
      <Text className={`text-xl font-bold text-white`}>+ {points}</Text>
    </Animated.View>
  );
};

export default AccumulatedScoreDisplay;
