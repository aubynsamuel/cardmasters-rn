import { gameHistoryType } from "@/types/gamePlayTypes";
import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

interface gameHistoryInterface {
  gameHistory: gameHistoryType[];
}
const GameHistory: React.FC<gameHistoryInterface> = ({ gameHistory }) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollToEnd({ animated: true });
  }, [gameHistory]);

  return (
    <View className="md:h-[85px]">
      <Text className="mb-1 ml-4 font-bold text-white">Game History</Text>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 10,
        }}
        className="h-[110px] rounded-xl bg-logContainerBackground"
      >
        {gameHistory?.map((item, index) => (
          <Text
            key={`${index}-${item.message}`}
            className={
              item.importance
                ? "text-yellow-400 font-bold mb-1.5"
                : "text-logText font-semibold"
            }
          >
            {item.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default GameHistory;
