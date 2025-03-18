import { View, ScrollView, Text } from "react-native";
import { gameHistoryType } from "../Types";
import React, { useEffect, useRef } from "react";

interface gameHistoryInterface {
  gameHistory: gameHistoryType[];
  width: number;
}
const GameHistory: React.FC<gameHistoryInterface> = ({
  gameHistory,
  width,
}) => {
  const scrollRef = useRef<any>();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollToEnd({ animated: true });
  }, [gameHistory]);

  return (
    <View>
      <Text style={{ fontWeight: "bold", marginLeft: 15 }}>Game History</Text>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 10,
          paddingBottom: width > 400 ? 45 : 0,
        }}
        style={{
          height: 110,
          borderRadius: 10,
          backgroundColor: "lightgrey",
        }}
      >
        {gameHistory?.map((item, index) => (
          <Text
            key={index + Math.random() * 10}
            style={[
              {
                width: "90%",
                fontWeight: "semibold",
              },
              item.importance
                ? { color: "green", fontWeight: "bold", marginBottom: 5 }
                : { color: "black", fontWeight: "semibold" },
            ]}
          >
            {item.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default GameHistory;
