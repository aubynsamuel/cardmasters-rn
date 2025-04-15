import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useSettingsStore } from "../store/settingsStore";
import { Slider } from "@miblanchard/react-native-slider";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const {
    musicVolume,
    sfxVolume,
    muted,
    targetScore,
    showTutorials,
    friendNotifications,
    setMusicVolume,
    setSfxVolume,
    setMuted,
    setTargetScore,
    // setShowTutorials,
    setFriendNotifications,
    loadSettings,
    saveSettings,
  } = useSettingsStore();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const targetScoreOptions = [1, 5, 10, 20, 30];

  useEffect(() => {
    loadSettings();

    // Animate elements
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    translateY.value = withDelay(
      300,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  useEffect(() => {
    saveSettings();
  }, [
    musicVolume,
    sfxVolume,
    muted,
    targetScore,
    showTutorials,
    friendNotifications,
  ]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleGameLengthChange = (length: number) => {
    setTargetScore(length);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#076324", "#076345"]}
        style={styles.background}
      />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </Animated.View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {/* Audio Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="volume-high" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Audio</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Music Volume</Text>
              <View style={styles.sliderContainer}>
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
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <View style={styles.sliderContainer}>
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
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Mute All</Text>
              <Switch
                value={muted}
                onValueChange={setMuted}
                trackColor={{ false: "#767577", true: "#FFD700" }}
                thumbColor={muted ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Gameplay Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="game-controller" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Gameplay</Text>
            </View>

            <View
              style={[styles.settingRow, { flexDirection: "column", gap: 10 }]}
            >
              <Text style={styles.settingLabel}>
                {`Target Score (${targetScore}) - Single Player`}
              </Text>
              <View style={styles.optionsContainer}>
                {targetScoreOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      targetScore === option && styles.selectedOption,
                    ]}
                    onPress={() => handleGameLengthChange(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        targetScore === option && styles.selectedOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Show Tutorials</Text>
              <Switch
                value={showTutorials}
                onValueChange={setShowTutorials}
                trackColor={{ false: "#767577", true: "#FFD700" }}
                thumbColor={showTutorials ? "#f4f3f4" : "#f4f3f4"}
              />
            </View> */}

            <View style={styles.settingRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate("GameRulesScreen" as never)}
                style={{ alignItems: "center", width: "100%" }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.settingLabel,
                    { fontWeight: "bold", color: "#FFD700" },
                  ]}
                >
                  Game Rules
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Friend Activity</Text>
              <Switch
                value={friendNotifications}
                onValueChange={setFriendNotifications}
                trackColor={{ false: "#767577", true: "#FFD700" }}
                thumbColor={friendNotifications ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#076324",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 215, 0, 0.3)",
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginLeft: 10,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  sliderContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    // flexWrap: "wrap",
    width: "100%",
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#FFD700",
  },
  optionText: {
    color: "#fff",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#000",
  },
});

export default SettingsScreen;
