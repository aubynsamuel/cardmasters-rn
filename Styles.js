import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#076324", // Green felt background
    padding: 10,
    paddingTop: 25,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  roundIndicator: {
    flexDirection: "row",
    marginTop: 5,
  },
  roundCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#666",
    borderWidth: 2,
    borderColor: "#999",
    marginHorizontal: 5,
  },
  activeRound: {
    backgroundColor: "#FFD700",
    borderColor: "white",
  },
  gameArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  playerArea: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  opponentArea: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
  },
  humanArea: {
    backgroundColor: "rgba(0, 0, 255, 0.2)",
  },
  highlighted: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  cards: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    margin: 2,
  },
  cardBack: {
    backgroundColor: "#B22222",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardValue: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSuit: {
    fontSize: 36,
  },
  centerArea: {
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  status: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  winnerText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 20,
  },
  playedCards: {
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 120,
    width: "100%",
  },
  playedCardContainer: {
    alignItems: "center",
    margin: 5,
  },
  playedCardLabel: {
    color: "#FFD700",
    marginBottom: 5,
  },
  logContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
    padding: 10,
    maxHeight: 120,
    marginVertical: 10,
  },
  logTitle: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 5,
  },
  logScrollView: {
    maxHeight: 100,
  },
  logContent: {
    paddingRight: 5,
  },
  logText: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 3,
  },
  importantLog: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
