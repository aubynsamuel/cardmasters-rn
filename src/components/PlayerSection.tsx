import React, { useState } from "react";
import { View, Text } from "react-native";
import Animated, { FlipInEasyX, SharedValue } from "react-native-reanimated";
import CardComponent from "./CardComponent";
import AnimatedScoreDisplay from "./AccumulatedScoreDisplay";
import { Card, Player } from "../Types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  opponentHandsLength?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
};

const PlayerSection = ({
  player,
  isDealing,
  accumulatedPoints,
  currentControlId,
  controlScale,
  playCard,
  width,
  opponentHandsLength = 0,
  styles,
}: PlayerSectionProps) => {
  const [expand, setExpand] = useState(false);
  return (
    <>
      <View
        style={[
          styles.humanSection,
          { width: expand ? "auto" : "60%", minWidth: "60%" },
        ]}
      >
        <AnimatedScoreDisplay
          points={accumulatedPoints}
          visible={accumulatedPoints > 0 && currentControlId === player.id}
        />
        <Text style={styles.sectionHeader}>
          {player.name}
          <Animated.View
            style={{
              transform: [{ scale: controlScale }],
            }}
          >
            <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
          </Animated.View>
        </Text>
        <View style={styles.hand}>
          {player.hands.map((card, index) => (
            <Animated.View
              key={`player-card-${card.suit}-${card.rank}`}
              entering={
                isDealing
                  ? FlipInEasyX.delay(
                      (index + opponentHandsLength) * 200
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
                expand={expand}
              />
            </Animated.View>
          ))}
        </View>
      </View>
      <MaterialCommunityIcons
        name={expand ? "arrow-collapse" : "arrow-expand"}
        size={30}
        color={"white"}
        style={{ transform: [{ rotateZ: "45deg" }], alignSelf: "center" }}
        onPress={() => setExpand((prev) => !prev)}
      />
    </>
  );
};

export default PlayerSection;
