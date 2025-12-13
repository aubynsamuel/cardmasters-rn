import { StyleSheet } from "react-native";
import Colors from "../theme/colors";

const getStyles = (width: number, height: number) => {
  const styles = StyleSheet.create({
    message: {
      fontSize: 16,
      textAlign: "center",
      color: Colors.mainTextColor,
    },
    currentRound: {
      fontSize: 18,
      textAlign: "center",
      flexDirection: width > 500 || height < 640 ? "row" : "column",
      flexWrap: "wrap",
      gap: 30,
      justifyContent: "space-around",
      alignItems: "center",
    },
    animationOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    dealingText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
      backgroundColor: "rgba(255,255,255,0.9)",
      padding: 15,
      borderRadius: 10,
    },

    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    overlayContent: {
      width: "80%",
      backgroundColor: "#0a8132",
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: "#e0f2e9",
    },
    overlayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    overlayTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#FFFFFF",
      textAlign: "center",
      width: "100%",
    },
    overlayButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    startButton: {
      backgroundColor: "#FF9800",
      borderRadius: 25,
      paddingVertical: 5,
      paddingHorizontal: 10,
      elevation: 2,
    },
    decorationContainer: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      opacity: 0.3,
    },
    cardDecoration: {
      position: "absolute",
      width: 80,
      height: 110,
      borderRadius: 10,
      backgroundColor: "red",
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
  });
  return styles;
};

export default getStyles;
