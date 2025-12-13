import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useSettingsStore } from "../store/settingsStore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
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
  const {
    muted,
    setMusicVolume,
    musicVolume,
    setSfxVolume,
    sfxVolume,
    setMuted,
    setTargetScore,
    targetScore,
  } = useSettingsStore();

  return (
    <View className="gap-2.5 w-full z-[100] flex-col md:items-center md:justify-around md:flex-row">
      <View className="w-full md:w-1/2">
        {/* Mute Toggle */}
        <TouchableOpacity
          style={[styles.toggleButton]}
          onPress={() => setMuted(!muted)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={24}
            color={"#FFF"}
          />
        </TouchableOpacity>

        {/* Music Volume */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.sectionTitle}>Music Volume</Text>
          <Ionicons name="volume-low" size={20} color="#fff" />
          <Slider
            containerStyle={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={musicVolume}
            onValueChange={(value) =>
              setMusicVolume(Array.isArray(value) ? value[0] : value)
            }
            minimumTrackTintColor="#FFD700"
            maximumTrackTintColor="#ffffff80"
            thumbTintColor="#FFD700"
            disabled={muted}
          />
          <Ionicons name="volume-high" size={20} color="#fff" />
        </View>

        {/* SFX Volume */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.sectionTitle}>Sound Effects </Text>
          <Ionicons name="volume-low" size={20} color="#fff" />
          <Slider
            containerStyle={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={sfxVolume}
            onValueChange={(value) =>
              setSfxVolume(Array.isArray(value) ? value[0] : value)
            }
            minimumTrackTintColor="#FFD700"
            maximumTrackTintColor="#ffffff80"
            thumbTintColor="#FFD700"
            disabled={muted}
          />
          <Ionicons name="volume-high" size={20} color="#fff" />
        </View>

        {/* Target Score Control Section */}
        {!isMultiPlayer && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Target Score</Text>
            <Slider
              containerStyle={styles.slider}
              minimumValue={5}
              maximumValue={50}
              step={5}
              value={targetScore}
              onValueChange={(value) =>
                setTargetScore(Array.isArray(value) ? value[0] : value)
              }
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#ffffff80"
              thumbTintColor="#FFD700"
            />
            <Text style={styles.sectionTitle}>{targetScore}</Text>
          </View>
        )}
      </View>
      {/* Game Control Buttons */}

      <View style={styles.overlayButtonsContainer}>
        {!isMultiPlayer && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              startNewGame?.();
              onClose?.();
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#FF9800", "#ff5722"]}
              style={styles.buttonGradient}
            >
              <Ionicons
                name="game-controller"
                size={24}
                color="#fff"
                style={styles.gameButtonIcon}
              />
              <Text style={styles.overlayButtonText}>
                {gameOver || showStartButton ? "New Game" : "Restart Game"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onQuitGame}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#e53e3e", "#c53030"]}
            style={styles.buttonGradient}
          >
            <Ionicons
              name="exit-outline"
              size={24}
              color="#fff"
              style={styles.gameButtonIcon}
            />
            <Text style={styles.overlayButtonText}>Quit Game</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10,
    zIndex: 100,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    top: -2,
    color: "white",
    marginRight: 5,
  },
  toggleButton: {
    backgroundColor: "#ff5722",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
  },
  overlayButtonsContainer: {
    alignItems: "center",
    gap: 20,
    marginTop: 10,
  },
  overlayButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  gameButtonIcon: {
    marginRight: 12,
  },
  slider: {
    flex: 1,
    marginHorizontal: 5,
    alignSelf: "center",
  },
});

export default GameControls;
