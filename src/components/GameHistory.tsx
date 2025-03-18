import { View, ScrollView, Text } from "react-native";
import { gameHistoryType } from "../Types";
import React, { useEffect, useRef } from "react";
import Colors from "../Colors";

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
    <View
      style={{
        flex: width > 400 ? 0.4 : 0.24,
      }}
    >
      <Text style={{ fontWeight: "bold", marginLeft: 15, color: "white" }}>
        Game History
      </Text>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 10,
          // paddingBottom: width > 400 ? 45 : 0,
        }}
        style={{
          height: 110,
          borderRadius: 10,
          backgroundColor: Colors.logContainerBackground,
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
                : { color: Colors.logText, fontWeight: "semibold" },
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
