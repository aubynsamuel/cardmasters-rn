import "react-native-reanimated";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import GameRecordSyncCoordinator from "../components/GameRecordSyncCoordinator";
import { AuthProvider } from "../context/AuthContext";
import { CustomAlertsProvider } from "../context/CustomAlertsContext";
import { SocketProvider } from "../context/SocketContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <GameRecordSyncCoordinator />
        <CustomAlertsProvider>
          <StatusBar hidden />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              navigationBarColor: "#076345",
              contentStyle: { backgroundColor: "#076324" },
            }}
          />
        </CustomAlertsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
