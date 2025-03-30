import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import MainMenuScreen from "./src/screens/MainMenuScreen";
import GameScreen from "./src/screens/GameScreen";
import LobbyScreen from "./src/screens/LobbyScreen";
import OnlineGameScreen from "./src/screens/RoomScreen";
import GameOverScreen from "./src/screens/GameOverScreen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import MultiPlayerGameScreen from "./src/screens/MultiplayerGameScreen";
import { AuthProvider } from "./src/AuthContext";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <View style={{ backgroundColor: "#076324", flex: 1 }}>
      <AuthProvider>
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
              name="OnlineGameScreen"
              component={OnlineGameScreen as React.FC}
            />
            <Stack.Screen
              name="MultiplayerGameScreen"
              component={MultiPlayerGameScreen}
            />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen
              name="GameOver"
              component={GameOverScreen as React.FC}
              options={{ navigationBarColor: "#2E7D32" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </View>
  );
};

export default App;
