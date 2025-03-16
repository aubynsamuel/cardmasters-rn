import { StyleSheet } from "react-native";
const getStyles = (width, height) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "lightgreen",
      padding: width > 400 ? 20 : 10,
      // borderStyle: "dotted",
      // borderWidth: 2,
    },
    computerSection: {
      alignItems: "center",
      width: 280,
      // backgroundColor: "yellow",
      flex: width > 400 ? 1.5 : 1,
    },
    humanSection: {
      alignItems: "center",
      width: 280,
      flex: width > 400 ? 1.5 : 1,
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 5,
    },
    hand: {
      flexDirection: "row",
      // backgroundColor: "red",
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
    deckCardBack: {
      margin: 5,
      backgroundColor: "#1e3d59",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      alignItems: "center",
      justifyContent: "center",
      height: 60,
      width: 40,
      position: "absolute",
    },
    cardBackText: {
      fontSize: 50,
      color: "#fff",
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
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
    },
    newGameText: {
      color: "#fff",
      fontSize: 18,
      textAlign: "center",
    },
    gameResultSection: {
      flex: 2,
      justifyContent: "center",
      alignItems: "center",
      bottom: width > 400 ? 30 : 0,
      // backgroundColor: "red",
    },
    message: {
      fontSize: 18,
      textAlign: "center",
      marginVertical: 5,
      bottom: 10,
    },
    currentRound: {
      fontSize: 18,
      textAlign: "center",
      flexDirection: width > 400 || height < 640 ? "row" : "column",
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "blue",
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
