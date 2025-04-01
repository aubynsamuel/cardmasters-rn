import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

interface GameControlsInterface {
  showStartButton: boolean;
  startNewGame?: () => void;
  gameOver: boolean;
  onClose?: () => void;
  onQuitGame: () => void;
  isMultiPlayer: boolean;
}

const GameControls: React.FC<GameControlsInterface> = ({
  showStartButton,
  startNewGame,
  gameOver,
  onClose,
  onQuitGame,
  isMultiPlayer = false,
}) => {
  return (
    <View style={styles.overlayButtonsContainer}>
      {/* {showStartButton && (
        <TouchableOpacity
          style={[styles.overlayButton, styles.startButton]}
          onPress={() => {
            startPlaying();
            onClose && onClose();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.overlayButtonText}>{"Start Game"}</Text>
        </TouchableOpacity>
      )} */}
      {!isMultiPlayer && (
        <TouchableOpacity
          style={[styles.overlayButton, styles.newGameButton]}
          onPress={() => {
            startNewGame?.();
            onClose?.();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.overlayButtonText}>
            {gameOver || showStartButton ? "New Game" : "Restart Game"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.overlayButton, styles.QuitGameButton]}
        onPress={onQuitGame}
        activeOpacity={0.7}
      >
        <Text style={styles.overlayButtonText}>Quit Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayButtonsContainer: {
    alignItems: "center",
    gap: 20,
  },
  overlayButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#FF9800",
  },
  newGameButton: {
    backgroundColor: "#076345",
  },
  QuitGameButton: {
    backgroundColor: "red",
    opacity: 0.8,
  },
  overlayButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GameControls;
