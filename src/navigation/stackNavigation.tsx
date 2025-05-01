import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from "../screens/SplashScreen";
import MainMenuScreen from "../screens/MainMenuScreen";
import SinglePlayerGameScreen from "../screens/SinglePlayerGameScreen";
import LobbyScreen from "../screens/LobbyScreen";
import RoomScreen from "../screens/RoomScreen";
import GameOverScreen from "../screens/GameOverScreen";
import { StatusBar } from "expo-status-bar";
import MultiPlayerGameScreen from "../screens/MultiplayerGameScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AuthScreen from "../screens/AuthScreen";
import SettingsScreen from "../screens/Settings";
import RulesScreen from "../screens/RulesScreen";
import StatsScreen from "../screens/StatsScreen";
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
          component={SinglePlayerGameScreen}
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
          name="RulesScreen"
          component={RulesScreen}
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
