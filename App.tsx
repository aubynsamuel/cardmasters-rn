import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextStyle,
  ScrollView,
} from "react-native";
import {
  chooseCardAI,
  createDeck,
  dealCards,
  shuffleDeck,
  suitSymbols,
} from "./src/GameFunctions";
import { Card, RoundState, gameHistoryType, Player } from "./src/Types";
import styles from "./src/Styles";
import { StatusBar } from "expo-status-bar";

const Game: React.FC = () => {
  const [humanHand, setHumanHand] = useState<Card[]>([]);
  const [computerHand, setComputerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
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
  const scrollRef = useRef<any>();

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollToEnd({ animated: true });
  }, [gameHistory]);

  const startNewGame = (): void => {
    // First, reset everything
    setRoundsPlayed(0);
    setCurrentRound({ leadCard: null, plays: [] });
    setMessage("Game started. Computer will play first.");
    setGameOver(false);
    setGameHistory([]);
    // setWinner(null);
    setCurrentControl("computer");

    // Create and deal new cards
    let newDeck = createDeck();
    newDeck = shuffleDeck(newDeck);
    const dealt = dealCards(newDeck);

    setHumanHand(dealt.human);
    setComputerHand(dealt.computer);
    setDeck(dealt.deck);
  };

  const startPlaying = () => {
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
          ? "Computer's card beats yours. Computer gains control."
          : "Your card beats the computer's. You gain control.";
    } else {
      // Otherwise leader retains control
      newControl = firstPlay.player;
      resultMessage =
        firstPlay.player === "human"
          ? "Your card wins the round. You retain control."
          : "Computer wins the round. Computer retains control.";
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
            newControl === "human"
              ? "You win the game!"
              : "Computer wins the game!"
          }`
        );
      } else {
        // Continue to next round
        if (newControl === "computer") {
          setMessage("Computer is leading the next round.");
          setTimeout(() => {
            computerTurn();
          }, 1000);
        } else {
          setMessage("It's your turn to lead the next round.");
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

    playCard("human", card);

    const isLeading = !currentRound.leadCard;
    if (isLeading) {
      setTimeout(() => computerTurn(), 1000);
    }
  };

  const renderCard = (card: Card): React.ReactNode => {
    const colorStyle: TextStyle =
      card.suit === "love" || card.suit === "diamond"
        ? { color: "red" }
        : { color: "black" };
    return (
      <View
        style={{
          height: 70,
          width: 45,
          justifyContent: "center",
          borderColor: "lightgrey",
          borderWidth: 1,
          margin: 5,
          borderRadius: 8,
          elevation: 5,
          padding: 5,
          backgroundColor: "lightblue",
        }}
      >
        <Text
          style={[
            {
              top: 2,
              left: 3,
              position: "absolute",
              fontSize: 15,
              fontWeight: 700,
            },
            colorStyle,
          ]}
        >
          {card.rank}
        </Text>
        <Text style={[styles.cardSymbol, colorStyle]}>
          {suitSymbols[card.suit]}
        </Text>
      </View>
    );
  };

  const renderCardBack = (index: number): React.ReactNode => {
    return (
      <View key={index} style={styles.cardBack}>
        <Text style={styles.cardBackText}>🂠</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" style="dark" />
      {/* Computer's Hand at the Top */}
      <View style={styles.computerSection}>
        <Text style={styles.sectionHeader}>Computer's Hand</Text>
        <View style={styles.hand}>
          {computerHand.map((_, index) => renderCardBack(index))}
        </View>
      </View>

      {/* Game Results in the Middle */}
      <View style={styles.gameResultSection}>
        <Text style={styles.roundText}>
          round: {gameOver == false ? roundsPlayed + 1 : roundsPlayed} / 5
        </Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.currentRound}>
          {currentRound.plays.map((play, idx) => (
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text key={idx} style={styles.playText}>
                {play.player === "human" ? "You" : "Computer"}
              </Text>
              <Text>{renderCard(play.card)}</Text>
            </View>
          ))}
        </View>
        {currentControl && (
          <Text style={styles.controlText}>
            Control: {currentControl === "human" ? "You" : "Computer"}
          </Text>
        )}
      </View>

      {/* Human's Hand at the Bottom */}
      <View style={styles.humanSection}>
        <Text style={styles.sectionHeader}>Your Hand</Text>
        <View style={styles.hand}>
          {humanHand.map((card, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => humanPlayCard(card, index)}
              activeOpacity={0.8}
            >
              {renderCard(card)}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Start Game Button */}
      <TouchableOpacity
        style={styles.newGameButton}
        onPress={gameOver ? startNewGame : startPlaying}
      >
        <Text style={styles.newGameText}>
          {gameOver ? "New Game" : "Start Game"}
        </Text>
      </TouchableOpacity>

      {/* Game Logs */}
      {gameHistory.length > 0 && (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            backgroundColor: "green",
            borderRadius: 10,
            padding: 10,
          }}
          style={{
            position: "absolute",
            bottom: 10,
            left: 5,
            right: 5,
            maxHeight: 120,
          }}
        >
          {gameHistory?.map((item, index) => (
            <Text
              key={index + Math.random() * 10}
              style={[
                {
                  width: "90%",
                  fontWeight: "semibold",
                },
                item.importance
                  ? { color: "yellow", fontWeight: "bold", marginBottom: 5 }
                  : { color: "white" },
              ]}
            >
              {item.message}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Game;
