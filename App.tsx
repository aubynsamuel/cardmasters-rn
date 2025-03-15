import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import {
  chooseCardAI,
  createDeck,
  dealCards,
  shuffleDeck,
  suitSymbols,
} from "./src/GameFunctions";
import { Card, gameHistoryType, Player, GameState, Play } from "./src/Types";
import getStyles from "./src/Styles";
import { StatusBar } from "expo-status-bar";
import RenderCard from "./src/Card";
import GameHistory from "./src/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";

let currentCard: Card | null;
let currentControl: Player = "computer";

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

  const [currentPlays, setCurrentPlays] = useState<Play[]>([]);
  const [currentLeadCard, setCurrentLeadCard] = useState<Card | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<gameHistoryType[]>([]);
  const [showStartButton, setShowStartButton] = useState<boolean>(false);

  useEffect(() => {
    startNewGame();
  }, []);

  // When both players have played in a round, finish the round
  useEffect(() => {
    if (currentPlays.length === 2) {
      finishRound();
    }
  }, [currentPlays, currentLeadCard]);

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
    setCurrentLeadCard(null);
    setCurrentPlays([]);
    setMessage("Game started. Computer will play first.");
    setGameOver(false);
    setShowStartButton(true);
    setGameHistory([]);
    currentControl = "computer";
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
    setCurrentLeadCard(null);
    setCurrentPlays([]);
  };

  const playCard = (player: Player, card: Card): void => {
    setCurrentPlays((prev) => {
      let newPlay = [...prev];
      newPlay = [...newPlay, { player, card }];
      return newPlay;
    });
    setCurrentLeadCard((prev) => {
      if (prev == null) {
        prev = card;
      }
      return prev;
    });
    setGameHistory((prev) => [
      ...prev,
      {
        message: `${player} played ${card.rank} of ${suitSymbols[card.suit]}`,
        importance: false,
      },
    ]);
  };

  const finishRound = (): void => {
    const [firstPlay, secondPlay] = currentPlays;
    let newControl: Player, resultMessage: string;

    if (!currentLeadCard) {
      return;
    }

    const leadSuit = currentLeadCard.suit;
    const followerCard = secondPlay.card;

    // If follower followed suit and has higher card value, they win control
    if (
      followerCard.suit === leadSuit &&
      followerCard.value > currentLeadCard.value
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

    currentControl = newControl;
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
    if (currentControl === "computer") {
      console.log("Computer is playing as a leader");
      console.log("");
      cardToPlay = chooseCardAI(computerHand, null, remainingRounds);
    } else {
      console.log("Computer is playing as a follower");
      console.log("Current lead card ", currentCard);
      console.log("");
      cardToPlay = chooseCardAI(computerHand, currentCard, remainingRounds);
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
    if (currentControl === "computer" && !currentLeadCard) {
      Alert.alert("Wait", "It's not your turn to play!");
      return;
    }

    // If responding, enforce following suit if you have it
    if (currentLeadCard) {
      const requiredSuit = currentLeadCard.suit;
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

    const isLeading = !currentLeadCard;
    if (isLeading) {
      currentCard = card;
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
        }}
      >
        {/* Computer's Hand at the Top */}
        <View style={styles.computerSection}>
          <View></View>
          <Text style={styles.sectionHeader}>
            Computer's Hand {currentControl === "computer" && <Text> 🔥 </Text>}
          </Text>
          <View style={styles.hand}>
            {computerHand.map((card, index) => renderCardBack(index))}
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
              {currentPlays.find((play) => play.player === "computer") ? (
                <RenderCard
                  card={
                    currentPlays.find((play) => play.player === "computer")!
                      .card
                  }
                />
              ) : (
                <RenderCard card={null} />
              )}
            </View>

            <View style={{ alignItems: "center" }}>
              {currentPlays.find((play) => play.player === "you") ? (
                <RenderCard
                  card={
                    currentPlays.find((play) => play.player === "you")!.card
                  }
                />
              ) : (
                <RenderCard card={null} />
              )}
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
                {<RenderCard card={card} />}
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
