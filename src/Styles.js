import { StyleSheet } from "react-native";
const getStyles = (width) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "plum",
      padding: width > 400 ? 20 : 10,
    },
    computerSection: {
      alignItems: "center",
      width: 280,
      height: 130,
    },
    humanSection: {
      alignItems: "center",
      height: 130,
      width: 280,
    },
    gameResultSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      bottom: width > 400 ? 30 : 0,
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 5,
    },
    hand: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    cardBack: {
      margin: 5,
      backgroundColor: "#1e3d59",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      alignItems: "center",
      justifyContent: "center",
      height: 70,
      width: 45,
    },
    cardBackText: {
      fontSize: 50,
      color: "#fff",
    },
    message: {
      fontSize: 18,
      textAlign: "center",
      marginVertical: 5,
    },
    playText: {
      fontSize: 15,
      marginVertical: 2,
    },
    roundText: {
      fontSize: 18,
      textAlign: "center",
    },
    newGameButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 5,
      paddingHorizontal: 25,
      borderRadius: 8,
      alignSelf: "center",
    },
    newGameText: {
      color: "#fff",
      fontSize: 18,
    },
    currentRound: {
      fontSize: 18,
      textAlign: "center",
      marginVertical: 5,
      marginTop: 20,
      flexDirection: width > 400 ? "row" : "column",
      alignItems: "flex-start",
      gap: 45,
    },
    controlText: {
      fontSize: 18,
      textAlign: "center",
      marginVertical: 5,
    },
  });
  return styles;
};

export default getStyles;
