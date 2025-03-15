import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import {
  chooseCardAI,
  createDeck,
  dealCards,
  shuffleDeck,
  suitSymbols,
} from "./src/GameFunctions";
import {
  Card,
  RoundState,
  gameHistoryType,
  Player,
  GameState,
} from "./src/Types";
import getStyles from "./src/Styles";
import { StatusBar } from "expo-status-bar";
import RenderCard from "./src/Card";
import GameHistory from "./src/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";

const Game: React.FC = () => {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const [humanHand, setHumanHand] = useState<Card[]>([]);
  const [computerHand, setComputerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    computer: [],
    deck: [],
    human: [],
  });

  const [currentRound, setCurrentRound] = useState<RoundState>({
    leadCard: null,
    plays: [],
  });
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [currentControl, setCurrentControl] = useState<Player>("computer");
  const [message, setMessage] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameHistory, setGameHistory] = useState<gameHistoryType[]>([]);
  const [showStartButton, setShowStartButton] = useState<boolean>(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const handleGameState = () => {
    if (!gameState || gameState.deck.length < 5 * 2) {
      let newDeck = createDeck();
      newDeck = shuffleDeck(newDeck);
      const updatedGameState = dealCards(newDeck);
      setGameState(updatedGameState);
      console.log("newly created deck ", updatedGameState.deck.length);
      return updatedGameState;
    } else {
      const updatedGameState = dealCards(gameState.deck);
      setGameState(updatedGameState);
      console.log("deck from previous game ", updatedGameState.deck.length);
      return updatedGameState;
    }
  };

  const startNewGame = (): void => {
    // First, reset everything
    setRoundsPlayed(0);
    setCurrentRound({ leadCard: null, plays: [] });
    setMessage("Game started. Computer will play first.");
    setGameOver(false);
    setShowStartButton(true);
    setGameHistory([]);
    setWinner(null);
    setCurrentControl("computer");

    const gameState = handleGameState();

    setHumanHand(gameState.human);
    setComputerHand(gameState.computer);
  };

  const startPlaying = () => {
    setShowStartButton(false);
    setTimeout(() => {
      computerTurn();
    }, 1500);
  };

  // Reset current round
  const resetRound = (): void => {
    setCurrentRound({ leadCard: null, plays: [] });
  };

  const playCard = (player: Player, card: Card): void => {
    setCurrentRound((prev) => {
      let newRound = { ...prev };
      if (!newRound.leadCard) {
        newRound.leadCard = card;
      }
      newRound.plays = [...newRound.plays, { player, card }];
      return newRound;
    });
    setGameHistory((prev) => [
      ...prev,
      {
        message: `${player} played ${card.rank} of ${suitSymbols[card.suit]}`,
        importance: false,
      },
    ]);
  };

  // When both players have played in a round, finish the round
  useEffect(() => {
    if (currentRound.plays.length === 2) {
      finishRound();
    }
  }, [currentRound]);

  const finishRound = (): void => {
    const [firstPlay, secondPlay] = currentRound.plays;
    let newControl: Player, resultMessage: string;

    if (!currentRound.leadCard) {
      return;
    }

    const leadSuit = currentRound.leadCard.suit;
    const followerCard = secondPlay.card;

    // If follower followed suit and has higher card value, they win control
    if (
      followerCard.suit === leadSuit &&
      followerCard.value > currentRound.leadCard.value
    ) {
      newControl = secondPlay.player;
      resultMessage =
        secondPlay.player === "computer"
          ? "Computer wins the round."
          : "You win the round.";
    } else {
      // Otherwise leader retains control
      newControl = firstPlay.player;
      resultMessage =
        firstPlay.player === "you"
          ? "You win the round."
          : "Computer wins the round.";
    }

    setCurrentControl(newControl);
    setMessage(resultMessage);
    setGameHistory((prev) => [
      ...prev,
      {
        message: `${newControl} Won Round ${roundsPlayed + 1}`,
        importance: true,
      },
    ]);
    const newRoundsPlayed = roundsPlayed + 1;
    setRoundsPlayed(newRoundsPlayed);

    setTimeout(() => {
      resetRound();

      // Check if game is over
      if (newRoundsPlayed >= 5) {
        setGameOver(true);
        // setWinner(newControl);
        // Alert.alert(
        setMessage(
          `Game Over \n ${
            newControl === "you"
              ? "You win the game!"
              : "Computer wins the game!"
          }`
        );
      } else {
        // Continue to next round
        if (newControl === "computer") {
          setMessage("Computer is playing.");
          setTimeout(() => {
            computerTurn();
          }, 1000);
        } else {
          setMessage("It's your turn to play.");
        }
      }
    }, 1500);
  };

  const computerTurn = (): void => {
    if (computerHand.length === 0) {
      console.log("Computer has no cards to play");
      return;
    }

    const remainingRounds = 5 - roundsPlayed;
    let cardToPlay: Card;

    if (!currentRound.leadCard) {
      // Computer is leading
      cardToPlay = chooseCardAI(computerHand, null, remainingRounds);
    } else {
      // Computer is following
      cardToPlay = chooseCardAI(
        computerHand,
        currentRound.leadCard,
        remainingRounds
      );
    }

    setComputerHand((prev) => {
      let newHand = [...prev];
      newHand.splice(newHand.indexOf(cardToPlay), 1);
      return newHand;
    });

    playCard("computer", cardToPlay);
  };

  const humanPlayCard = (card: Card, index: number): void => {
    if (gameOver) return;

    // If it's not human's turn
    if (currentControl === "computer" && !currentRound.leadCard) {
      Alert.alert("Wait", "It's not your turn to play!");
      return;
    }

    // If responding, enforce following suit if you have it
    if (currentRound.leadCard) {
      const requiredSuit = currentRound.leadCard.suit;
      const hasRequired = humanHand.some((c) => c.suit === requiredSuit);

      if (hasRequired && card.suit !== requiredSuit) {
        Alert.alert(
          "Invalid Move",
          `You must play a ${requiredSuit} card if you have one.`
        );
        return;
      }
    }

    setHumanHand((prev) => {
      let newHand = [...prev];
      newHand.splice(index, 1);
      return newHand;
    });

    playCard("you", card);

    const isLeading = !currentRound.leadCard;
    if (isLeading) {
      setTimeout(() => computerTurn(), 1000);
    }
  };

  const renderCardBack = (index: number) => {
    return (
      <View key={index} style={styles.cardBack}>
        <Text style={styles.cardBackText}>🂠</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" style="dark" />
      <View
        style={{
          flexDirection: width > 400 ? "row" : "column",
          flex: width > 400 ? null : (1 as any),
          alignItems: "center",
          // backgroundColor: "red",
        }}
      >
        {/* Computer's Hand at the Top */}
        <View style={styles.computerSection}>
          <View></View>
          <Text style={styles.sectionHeader}>
            Computer's Hand {currentControl === "computer" && <Text> 🔥 </Text>}
          </Text>
          <View style={styles.hand}>
            {computerHand.map((_, index) => renderCardBack(index))}
          </View>
        </View>

        {/* Game Results in the Middle */}
        <View style={styles.gameResultSection}>
          <Text style={styles.roundText}>
            round: {gameOver == false ? roundsPlayed + 1 : roundsPlayed} / 5
          </Text>

          <Text numberOfLines={2} style={[styles.message, { height: 50 }]}>
            {message}
          </Text>

          <View style={styles.currentRound}>
            <View style={{ alignItems: "center" }}>
              {currentRound.plays.find((play) => play.player === "computer")
                ? RenderCard(
                    currentRound.plays.find(
                      (play) => play.player === "computer"
                    )!.card
                  )
                : RenderCard(null)}
            </View>

            <View style={{ alignItems: "center" }}>
              {currentRound.plays.find((play) => play.player === "you")
                ? RenderCard(
                    currentRound.plays.find((play) => play.player === "you")!
                      .card
                  )
                : RenderCard(null)}
            </View>
          </View>
        </View>

        {/* Human's Hand at the Bottom */}
        <View style={styles.humanSection}>
          <Text style={styles.sectionHeader}>
            Your Hand {currentControl === "you" && <Text> 🔥 </Text>}
          </Text>
          <View style={styles.hand}>
            {humanHand.map((card, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => humanPlayCard(card, index)}
                activeOpacity={0.8}
              >
                {RenderCard(card)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Start, New and Restart Game Buttons */}
      <View style={{ flexDirection: "row", alignSelf: "center", gap: 10 }}>
        {showStartButton && (
          <TouchableOpacity style={styles.newGameButton} onPress={startPlaying}>
            <Text style={styles.newGameText}>{"Start Game"}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
          <Text style={styles.newGameText}>
            {gameOver
              ? "New Game"
              : showStartButton
              ? "New Game"
              : "Restart Game"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Game Logs */}
      <GameHistory gameHistory={gameHistory} width={width} />
    </SafeAreaView>
  );
};

export default Game;
