import React from "react";
import { View, Text } from "react-native";
import Animated, { FlipInEasyX, SharedValue } from "react-native-reanimated";
import CardComponent from "./CardComponent";
import AnimatedScoreDisplay from "./AccumulatedScoreDisplay";
import { Card } from "../types/gamePlayTypes";
import { Player } from "../types/serverPayloadTypes";

type PlayerSectionProps = {
  player: Player;
  isDealing: boolean;
  accumulatedPoints: number;
  currentControlId: string;
  controlScale: SharedValue<number>;
  playCard: (
    card: Card,
    index: number
  ) => {
    error: string;
    message: string;
  };
  width: number;
  playersHandsLength?: number;
};

const PlayerSection = ({
  player,
  isDealing,
  accumulatedPoints,
  currentControlId,
  controlScale,
  playCard,
  width,
  playersHandsLength = 0,
}: PlayerSectionProps) => {
  return (
    <View className="items-center w-full">
      <AnimatedScoreDisplay
        points={accumulatedPoints}
        visible={accumulatedPoints > 0 && currentControlId === player.id}
      />
      <Text
        numberOfLines={1}
        className="text-xl font-semibold mb-[5px] text-mainTextColor w-full text-center left-2"
      >
        {player.name}
        <Animated.View
          style={{
            transform: [{ scale: controlScale }],
          }}
        >
          <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
        </Animated.View>
      </Text>
      <View className="flex-row">
        {player.hands.map((card, index) => (
          <Animated.View
            key={`player-card-${card.suit}-${card.rank}`}
            entering={
              isDealing
                ? FlipInEasyX.delay(
                    (index + playersHandsLength) * 200
                  ).duration(300)
                : undefined
            }
          >
            <CardComponent
              card={card}
              playCard={() => playCard(card, index)}
              width={width}
              index={index}
              numberOfCards={player.hands.length}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default PlayerSection;
