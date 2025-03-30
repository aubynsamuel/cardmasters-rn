import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface OnlineGameScreenRouteProp {
  route: { params: { roomId: string } };
}

const RoomScreen: React.FC<OnlineGameScreenRouteProp> = ({ route }) => {
  const { roomId } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Game Room: {roomId}</Text>
      <Text>
        {/* Real-time game synchronization and logic go here */}
        Game logic for online play.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});

export default RoomScreen;
