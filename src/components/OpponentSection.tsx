import React from "react";
import { View, Text } from "react-native";
import Animated, { FlipInEasyX, SharedValue } from "react-native-reanimated";
import OpponentCard from "./OpponentCard";
import AnimatedScoreDisplay from "./AccumulatedScoreDisplay";
import { Player } from "../Types"; // Update the import path as needed

type OpponentSectionProps = {
  opponent: Player;
  isDealing: boolean;
  accumulatedPoints: number;
  currentControlId: string;
  controlScale: SharedValue<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
};

const OpponentSection = ({
  opponent,
  isDealing,
  accumulatedPoints,
  currentControlId,
  controlScale,
  styles,
}: OpponentSectionProps) => {
  return (
    <View style={[styles.computerSection]}>
      <AnimatedScoreDisplay
        points={accumulatedPoints}
        visible={accumulatedPoints > 0 && currentControlId === opponent.id}
      />
      <Text style={styles.sectionHeader}>
        {opponent.name}
        <Animated.View
          style={{
            transform: [{ scale: controlScale }],
          }}
        >
          <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
        </Animated.View>
      </Text>
      <View style={styles.hand}>
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
            <OpponentCard index={index} numberOfCards={opponent.hands.length} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default OpponentSection;
