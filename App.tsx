// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import MainMenuScreen from "./src/screens/MainMenuScreen";
import GameScreen from "./src/screens/GameScreen";
import MultiplayerLobbyScreen from "./src/screens/MultiplayerLobbyScreen";
import OnlineGameScreen from "./src/screens/OnlineGameScreen";
import GameOverScreen from "./src/screens/GameOverScreen";
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
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
        <Stack.Screen
          name="MultiplayerLobby"
          component={MultiplayerLobbyScreen}
        />
        <Stack.Screen name="OnlineGame" component={OnlineGameScreen} />
        <Stack.Screen
          name="GameOver"
          component={GameOverScreen as React.FC}
          options={{ navigationBarColor: "#2E7D32" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
