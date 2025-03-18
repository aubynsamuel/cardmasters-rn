import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface GameControlsInterface {
  styles: any;
  width: number;
  showStartButton: boolean;
  startPlaying: () => void;
  startNewGame: () => void;
  gameOver: boolean;
}
const GameControls: React.FC<GameControlsInterface> = ({
  styles,
  width,
  showStartButton,
  startPlaying,
  startNewGame,
  gameOver,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "center",
        gap: 10,
        flex: width > 400 ? 0.22 : 0.12,
      }}
    >
      {showStartButton && (
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={startPlaying}
          activeOpacity={0.8}
        >
          <Text style={styles.newGameText}>{"Start Game"}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.newGameButton}
        onPress={() => {
          startNewGame();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.newGameText}>
          {gameOver || showStartButton ? "New Game" : "Restart Game"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GameControls;
