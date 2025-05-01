import { StyleProp, Text, View, ViewStyle } from "react-native";
import React from "react";
import EmptyCard from "./EmptySlotCard";
import SlotCard from "./SlotCard";
import { Player } from "../types/ServerPayloadTypes";
import { Play } from "../types/GamePlayTypes";

interface gamePlaySlot {
  width: number;
  gameStateMessage: string;
  currentRoundStyles: StyleProp<ViewStyle>;
  currentPlays: Play[];
  opponent: Player;
  currentUser: Player;
}

const GameResults = ({
  width,
  gameStateMessage,
  currentRoundStyles,
  currentPlays,
  opponent,
  currentUser,
}: gamePlaySlot) => {
  return (
    <View className="items-center w-full gap-8 mx-4 md:w-1/4 justify-evenly">
      {width < 500 && (
        <View
          className="p-1 px-5 bg-logContainerBackground rounded-2xl"
          style={{ minWidth: "50%" }}
        >
          <Text
            numberOfLines={2}
            className="text-lg text-center text-mainTextColor"
          >
            {gameStateMessage}
          </Text>
        </View>
      )}

      {/* Current Play Cards */}
      <View style={currentRoundStyles}>
        {/* Opponent's Play Spot */}
        {currentPlays.find((play) => play.player.id === opponent.id) ? (
          <SlotCard
            card={
              currentPlays.find((play) => play.player.id === opponent.id)!.card
            }
          />
        ) : (
          <EmptyCard />
        )}

        {/* Current Player Play Spot */}
        {currentPlays.find((play) => play.player.id === currentUser.id) ? (
          <SlotCard
            card={
              currentPlays.find((play) => play.player.id === currentUser.id)!
                .card
            }
          />
        ) : (
          <EmptyCard />
        )}
      </View>
    </View>
  );
};

export default GameResults;
