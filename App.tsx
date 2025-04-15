import React from "react";
import { LogBox, View } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { SocketProvider } from "./src/context/SocketContext";
import { CustomAlertsProvider } from "./src/context/CustomAlertsContext";
import "./global.css";
import StackNavigation from "./src/navigation/stackNavigation";

const App: React.FC = () => {
  LogBox.ignoreAllLogs();
  return (
    <View className="flex-1 bg-[#076324]">
      <AuthProvider>
        <SocketProvider>
          <CustomAlertsProvider>
            <StackNavigation />
          </CustomAlertsProvider>
        </SocketProvider>
      </AuthProvider>
    </View>
  );
};

export default App;
