import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  targetScore: number;
  showTutorials: boolean;
  friendNotifications: boolean;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setTargetScore: (length: number) => void;
  setShowTutorials: (show: boolean) => void;
  setFriendNotifications: (notify: boolean) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  targetScore: 5,
  showTutorials: true,
  friendNotifications: true,

  setMusicVolume: (volume) => {
    set({ musicVolume: volume });
    get().saveSettings();
  },

  setSfxVolume: (volume) => {
    set({ sfxVolume: volume });
    get().saveSettings();
  },

  setMuted: (muted) => {
    set({ muted });
    get().saveSettings();
  },

  setTargetScore: (length) => {
    set({ targetScore: length });
    get().saveSettings();
  },

  setShowTutorials: (show) => {
    set({ showTutorials: show });
    get().saveSettings();
  },

  setFriendNotifications: (notify) => {
    set({ friendNotifications: notify });
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem("cardMastersSettings");
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set(settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const settingsToSave = {
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        muted: state.muted,
        targetScore: state.targetScore,
        showTutorials: state.showTutorials,
        friendNotifications: state.friendNotifications,
      };
      await AsyncStorage.setItem(
        "cardMastersSettings",
        JSON.stringify(settingsToSave)
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },
}));
