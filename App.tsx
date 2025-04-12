import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import MainMenuScreen from "./src/screens/MainMenuScreen";
import GameScreen from "./src/screens/GameScreen";
import LobbyScreen from "./src/screens/LobbyScreen";
import RoomScreen from "./src/screens/RoomScreen";
import GameOverScreen from "./src/screens/GameOverScreen";
import { StatusBar } from "expo-status-bar";
import { LogBox, View } from "react-native";
import MultiPlayerGameScreen from "./src/screens/MultiplayerGameScreen";
import { AuthProvider } from "./src/context/AuthContext";
import ProfileScreen from "./src/screens/ProfileScreen";
import { SocketProvider } from "./src/context/SocketContext";
import AuthScreen from "./src/screens/AuthScreen";
import { CustomAlertsProvider } from "./src/context/CustomAlertsContext";
import SettingsScreen from "./src/screens/Settings";
import "./global.css";
import GameRulesScreen from "./src/screens/GameRules";
import StatsScreen from "./src/screens/StatsScreen";

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  LogBox.ignoreAllLogs();
  return (
    <View className="flex-1 bg-[#076324]">
      <AuthProvider>
        <SocketProvider>
          <CustomAlertsProvider>
            <NavigationContainer>
              <StatusBar hidden={true} />
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                  navigationBarColor: "#076345",
                }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="MainMenu" component={MainMenuScreen} />
                <Stack.Screen
                  name="Game"
                  component={GameScreen}
                  options={{ navigationBarColor: "#076324" }}
                />
                <Stack.Screen name="MultiplayerLobby" component={LobbyScreen} />
                <Stack.Screen
                  name="RoomScreen"
                  component={RoomScreen}
                  options={{ navigationBarColor: "#1a2a1f" }}
                />
                <Stack.Screen
                  name="MultiPlayerGameScreen"
                  component={MultiPlayerGameScreen}
                  options={{ navigationBarColor: "#076324" }}
                />
                <Stack.Screen
                  name="GameRulesScreen"
                  component={GameRulesScreen}
                  options={{ navigationBarColor: "#076345" }}
                />
                <Stack.Screen
                  name="StatsScreen"
                  component={StatsScreen}
                  options={{ navigationBarColor: "#076345" }}
                />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen
                  name="GameOver"
                  component={GameOverScreen as React.FC}
                  options={{ navigationBarColor: "#2E7D32" }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </CustomAlertsProvider>
        </SocketProvider>
      </AuthProvider>
    </View>
  );
};

export default App;
