import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 30,
  },
  computerSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  humanSection: {
    alignItems: "center",
    marginTop: 10,
  },
  gameResultSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  cardSymbol: {
    fontSize: 25,
    fontWeight: "500",
    alignSelf: "center",
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
    marginVertical: 10,
  },
  playText: {
    fontSize: 15,
    marginVertical: 2,
  },
  roundText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 5,
  },
  newGameButton: {
    marginTop: 15,
    marginBottom: 125,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
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
    flexDirection: "row",
    gap: 15,
  },
  controlText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 5,
  },
});

export default styles;
