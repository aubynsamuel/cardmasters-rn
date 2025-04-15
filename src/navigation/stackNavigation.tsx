import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from "../screens/splashScreen";
import MainMenuScreen from "../screens/mainMenuScreen";
import GameScreen from "../screens/gameScreen";
import LobbyScreen from "../screens/lobbyScreen";
import RoomScreen from "../screens/roomScreen";
import GameOverScreen from "../screens/gameOverScreen";
import { StatusBar } from "expo-status-bar";
import MultiPlayerGameScreen from "../screens/multiplayerGameScreen";
import ProfileScreen from "../screens/profileScreen";
import AuthScreen from "../screens/authScreen";
import SettingsScreen from "../screens/settings";
import GameRulesScreen from "../screens/gameRules";
import StatsScreen from "../screens/statsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  return (
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
  );
};

export default StackNavigation;
