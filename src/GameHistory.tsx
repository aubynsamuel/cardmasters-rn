import { View, ScrollView, Text } from "react-native";
import { gameHistoryType } from "./Types";
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
    <View style={{ margin: 7 }}>
      <Text style={{ fontWeight: "bold", marginLeft: 15 }}>Game History</Text>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 10,
          paddingBottom: width > 400 ? 40 : 0,
        }}
        style={{
          height: 120,
          borderRadius: 10,
          backgroundColor: "green",
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
                ? { color: "yellow", fontWeight: "bold", marginBottom: 5 }
                : { color: "white" },
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
