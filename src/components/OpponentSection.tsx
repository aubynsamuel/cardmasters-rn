import React from "react";
import { View, Text } from "react-native";
import Animated, { FlipInEasyX, SharedValue } from "react-native-reanimated";
import OpponentCard from "./OpponentCard";
import AnimatedScoreDisplay from "./AccumulatedScoreDisplay";
import { Player } from "../types/types";

type OpponentSectionProps = {
  opponent: Player;
  isDealing: boolean;
  accumulatedPoints: number;
  currentControlId: string;
  controlScale: SharedValue<number>;
};

const OpponentSection = ({
  opponent,
  isDealing,
  accumulatedPoints,
  currentControlId,
  controlScale,
}: OpponentSectionProps) => {
  return (
    <View className="items-center w-full">
      <AnimatedScoreDisplay
        points={accumulatedPoints}
        visible={accumulatedPoints > 0 && currentControlId === opponent.id}
      />
      <Text
        numberOfLines={1}
        className="text-xl font-semibold mb-[5px] text-mainTextColor w-full text-center left-2"
      >
        {opponent.name}
        <Animated.View
          style={{
            transform: [{ scale: controlScale }],
          }}
        >
          <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
        </Animated.View>
      </Text>
      <View className="flex-row">
        {opponent.hands.map((card, index) => (
          <Animated.View
            key={`opponent-card-${card.suit}-${card.rank}`}
            entering={
              isDealing
                ? FlipInEasyX.delay(
                    (index + opponent.hands.length) * 200
                  ).duration(300)
                : undefined
            }
          >
            <OpponentCard />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default OpponentSection;
