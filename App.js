import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

const suits = ["diamond", "spade", "love", "club"];
const ranks = ["6", "7", "8", "9", "10", "J", "Q", "K"];
const rankValues = { 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 };
const suitSymbols = {
  diamond: "♦",
  spade: "♠",
  love: "♥",
  club: "♣",
};

// Create a deck of cards.
const createDeck = () => {
  let deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ suit, rank, value: rankValues[rank] });
    });
  });
  return deck;
};

// Fisher–Yates shuffle.
const shuffleDeck = (deck) => {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal 5 cards each (first 3 then 2 cards) for 2 players.
const dealCards = (deck) => {
  let human = [];
  let computer = [];
  let deckCopy = [...deck];
  // First round: 3 cards each.
  for (let i = 0; i < 3; i++) {
    human.push(deckCopy.shift());
    computer.push(deckCopy.shift());
  }
  // Second round: 2 cards each.
  for (let i = 0; i < 2; i++) {
    human.push(deckCopy.shift());
    computer.push(deckCopy.shift());
  }
  return { human, computer, deck: deckCopy };
};

/**
 * AI helper that chooses a card based on the lead.
 * If no lead card exists (i.e. leading), play the lowest card.
 * If following suit, choose the smallest card that wins if possible,
 * otherwise the lowest card in the required suit.
 * If unable to follow suit, play the lowest card overall.
 */
const chooseCardAI = (hand, leadCard) => {
  let playableCards = [];
  if (!leadCard) {
    playableCards = [...hand];
    return playableCards.sort((a, b) => a.value - b.value)[0];
  } else {
    const requiredSuit = leadCard.suit;
    const cardsOfSuit = hand.filter((card) => card.suit === requiredSuit);
    if (cardsOfSuit.length > 0) {
      playableCards = cardsOfSuit;
      // Look for a winning card.
      const winningCards = playableCards.filter(
        (card) => card.value > leadCard.value
      );
      if (winningCards.length > 0) {
        return winningCards.sort((a, b) => a.value - b.value)[0];
      } else {
        return playableCards.sort((a, b) => a.value - b.value)[0];
      }
    } else {
      playableCards = [...hand];
      return playableCards.sort((a, b) => a.value - b.value)[0];
    }
  }
};

const Game = () => {
  const [humanHand, setHumanHand] = useState([]);
  const [computerHand, setComputerHand] = useState([]);
  const [deck, setDeck] = useState([]);
  const [currentRound, setCurrentRound] = useState({
    baseCard: null,
    plays: [], // Each element: { player: 'human' | 'computer', card }
  });
  const [round, setRound] = useState(0); // Total rounds (tricks) played (max 5)
  const [currentControl, setCurrentControl] = useState("human"); // Who leads the trick
  const [message, setMessage] = useState("");

  // On mount, start a new game.
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    let newDeck = createDeck();
    newDeck = shuffleDeck(newDeck);
    const dealt = dealCards(newDeck);
    setHumanHand(dealt.human);
    setComputerHand(dealt.computer);
    setDeck(dealt.deck);
    setCurrentControl("human"); // Human starts.
    setRound(0);
    setCurrentRound({ baseCard: null, plays: [] });
    setMessage("Game started. It's your turn to play a card.");
  };

  // Reset current trick.
  const resetRound = () => {
    setCurrentRound({ baseCard: null, plays: [] });
  };

  // Function to add a play (card) to the current trick.
  const playCard = (player, card) => {
    setCurrentRound((prev) => {
      let newRound = { ...prev };
      if (!newRound.baseCard) {
        newRound.baseCard = card;
      }
      newRound.plays = [...newRound.plays, { player, card }];
      return newRound;
    });
  };

  // When both players have played in a trick, finish the trick.
  useEffect(() => {
    if (currentRound.plays.length === 2) {
      finishTrick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  const finishTrick = () => {
    const [firstPlay, secondPlay] = currentRound.plays;
    let newControl, resultMessage;
    // Check if the responder’s card follows suit and beats the lead.
    if (
      secondPlay.card.suit === currentRound.baseCard.suit &&
      secondPlay.card.value > currentRound.baseCard.value
    ) {
      newControl = secondPlay.player;
      resultMessage =
        secondPlay.player === "computer"
          ? "Computer's card beats yours. Computer gains control."
          : "Your card beats computer's card. You retain control.";
    } else {
      newControl = firstPlay.player;
      resultMessage =
        firstPlay.player === "human"
          ? "Your card wins the trick. You retain control."
          : "Computer wins the trick. Computer retains control.";
    }
    setCurrentControl(newControl);
    setMessage(resultMessage);
    const newRound = round + 1;
    setRound(newRound);
    setTimeout(() => {
      resetRound();
      if (newRound >= 5) {
        Alert.alert(
          "Game Over",
          newControl === "human"
            ? "You win the game!"
            : "Computer wins the game!",
          [{ text: "New Game", onPress: startNewGame }]
        );
      } else {
        if (newControl === "computer") {
          setMessage("Computer is leading the next trick.");
          setTimeout(() => {
            computerTurn();
          }, 1000);
        } else {
          setMessage("It's your turn to lead the next trick.");
        }
      }
    }, 1000);
  };

  // Computer's turn using the improved AI.
  const computerTurn = () => {
    let cardToPlay;
    if (!currentRound.baseCard) {
      cardToPlay = chooseCardAI(computerHand, null);
    } else {
      cardToPlay = chooseCardAI(computerHand, currentRound.baseCard);
    }
    setComputerHand((prev) => prev.filter((c) => c !== cardToPlay));
    playCard("computer", cardToPlay);
  };

  // Handler when you tap a card.
  const humanPlayCard = (card, index) => {
    // If there's no lead (i.e. starting the trick) then enforce turn order.
    if (!currentRound.baseCard && currentControl !== "human") {
      Alert.alert("Wait", "It's not your turn to lead!");
      return;
    }
    // If responding, enforce following suit if you have it.
    if (currentRound.baseCard) {
      const requiredSuit = currentRound.baseCard.suit;
      const hasRequired = humanHand.some((c) => c.suit === requiredSuit);
      if (hasRequired && card.suit !== requiredSuit) {
        Alert.alert("Invalid Move", `You must play a ${requiredSuit} card.`);
        return;
      }
    }
    setHumanHand((prev) => {
      let newHand = [...prev];
      newHand.splice(index, 1);
      return newHand;
    });
    playCard("human", card);
    // If you led, let the computer respond.
    if (!currentRound.baseCard) {
      setTimeout(() => computerTurn(), 1000);
    }
  };

  // Render a face-up card (your card).
  const renderCard = (card) => {
    const colorStyle =
      card.suit === "love" || card.suit === "diamond"
        ? { color: "red" }
        : { color: "black" };
    return (
      <Text style={[styles.cardText, colorStyle]}>
        {card.rank}
        {suitSymbols[card.suit]}
      </Text>
    );
  };

  // Render a card back for the computer's hand.
  const renderCardBack = (index) => {
    return (
      <View key={index} style={styles.cardBack}>
        <Text style={styles.cardBackText}>🂠</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Computer's Hand at the Top */}
      <View style={styles.computerSection}>
        <Text style={styles.sectionHeader}>Computer's Hand</Text>
        <View style={styles.hand}>
          {computerHand.map((card, index) => renderCardBack(index))}
        </View>
      </View>

      {/* Game Results in the Middle */}
      <View style={styles.gameResultSection}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.currentTrick}>
          {currentRound.plays.map((play, idx) => (
            <Text key={idx} style={styles.playText}>
              {play.player === "human" ? "You" : "Computer"} played{" "}
              {renderCard(play.card)}
            </Text>
          ))}
        </View>
        <Text style={styles.roundText}>Trick: {round + 1} / 5</Text>
      </View>

      {/* Your Hand at the Bottom */}
      <View style={styles.humanSection}>
        <Text style={styles.sectionHeader}>Your Hand</Text>
        <View style={styles.hand}>
          {humanHand.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => humanPlayCard(card, index)}
            >
              {renderCard(card)}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
        <Text style={styles.newGameText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
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
  card: {
    padding: 12,
    margin: 5,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "500",
  },
  cardBack: {
    padding: 12,
    margin: 5,
    backgroundColor: "#1e3d59",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBackText: {
    fontSize: 18,
    color: "#fff",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
  },
  playText: {
    fontSize: 18,
    marginVertical: 2,
  },
  roundText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 5,
  },
  newGameButton: {
    marginTop: 10,
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
});

export default Game;
