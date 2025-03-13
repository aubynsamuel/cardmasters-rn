import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CardComponent } from "./CardComponent";
import { PlayedCardComponent } from "./PlayedCardsComponent";
import { RoundIndicator } from "./RoundIndicator";
import { styles } from "./Styles";
import { Card, Deck, Player } from "./Classes";
import { Suit } from "./Types";

let deck;
let players = [new Player("You", true), new Player("Computer")];
let startingPlayer = 1; // Computer starts

const App = () => {
  // Game state with useState hooks
  const [controlPlayer, setControlPlayer] = useState<number>(1);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [roundNum, setRoundNum] = useState<number>(0);
  const [cardsPlayed, setCardsPlayed] = useState<Card[] | any>([]);
  const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
  const [highestCard, setHighestCard] = useState<{
    numericValue: number;
  } | null>(null);
  const [roundWinner, setRoundWinner] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWinner, setGameWinner] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<string>(
    'Welcome to the Card Game! Click "Start Game" to begin.'
  );
  const [logMessages, setLogMessages] = useState<any[]>([]);
  const [showNewGameButton, setShowNewGameButton] = useState(false);
  const logScrollViewRef = useRef<any>();

  function startGame() {
    log("Game started!");
    setShowNewGameButton(false);

    // Setup the game
    setup();

    // Start first round after setup
    setTimeout(() => startRound(), 100);
  }

  function resetGame() {
    // Reset game state
    deck = new Deck();
    // setDeck(newDeck);
    setRoundNum(0);
    setCardsPlayed([]);
    setLeadSuit(null);
    setHighestCard(null);
    setRoundWinner(0);
    setGameOver(false);
    setGameWinner(0);
    setGameStatus("New game started!");
    setLogMessages([]);

    // Reset players
    players[0].hand = [];
    players[1].hand = [];
    setShowNewGameButton(false);
  }

  function setup() {
    // Create and shuffle the deck
    deck = new Deck();
    // setDeck(newDeck);
    deck.shuffle();

    // Deal 3 cards to each player, starting with player to right of dealer
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < players.length; j++) {
        const playerIdx = (startingPlayer + j) % players.length;
        players[playerIdx].addCards(deck.deal(1));
      }
    }

    // Deal 2 more cards to each player
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < players.length; j++) {
        const playerIdx = (startingPlayer + j) % players.length;
        players[playerIdx].addCards(deck.deal(1));
      }
    }

    // Update players state
    players = [...players];
  }

  function startRound() {
    setRoundNum((prevRound) => prevRound + 1);
    setCardsPlayed([]);
    setLeadSuit(null);
    setHighestCard(null);
    setCurrentPlayer(controlPlayer);

    log(`Round ${roundNum + 1} started.`, true);
    log(
      `${players[controlPlayer].name} ${
        players[controlPlayer].name === "You" ? "have" : "has"
      } control.`,
      true
    );

    updateStatus(
      `Round ${roundNum + 1}: ${players[controlPlayer].name} ${
        players[controlPlayer].name === "You" ? "have" : "has"
      } control.`
    );

    // If computer has control, make it play
    if (controlPlayer === 1) {
      setTimeout(() => computerPlay(), 500);
    }
  }

  function updateStatus(message: React.SetStateAction<string>) {
    setGameStatus(message);
  }

  function log(message: string, important = false) {
    setLogMessages((prevLogs) => [...prevLogs, { text: message, important }]);
  }

  function playerPlay(cardIndex: number) {
    const player = players[0];
    const card = player.playCard(cardIndex);

    log(`You played: ${card}`);

    // Update lead suit if first card
    if (!leadSuit) {
      setLeadSuit(card?.suit || null);
      setHighestCard(card);
      setRoundWinner(0);
    }
    // Check if this card wins
    else if (
      card?.suit === leadSuit &&
      (!highestCard || card.numericValue > highestCard.numericValue)
    ) {
      setHighestCard(card);
      setRoundWinner(0);
    }

    // Update played cards
    setCardsPlayed((prevCards: any) => [...prevCards, { playerIdx: 0, card }]);

    // Update player's hand (create new array to force update)
    players = [...players]; // Force update to trigger reactivity

    // Move to next player
    setCurrentPlayer(1);

    // If computer's turn, make it play
    if (cardsPlayed.length + 1 < players.length) {
      setTimeout(() => computerPlay(), 500);
    } else {
      // Round is complete
      finishRound();
    }
  }

  function computerPlay() {
    const computer = players[1];
    const cardIndex = computer.chooseCardAI(leadSuit, highestCard);
    const card = computer.playCard(cardIndex);

    log(`Computer played: ${card}`);

    // Handle first card played in the round
    if (!leadSuit) {
      setLeadSuit(card?.suit || null);
      setHighestCard(card);
      setRoundWinner(1);
    }
    // Check if this card wins
    else if (
      card?.suit === leadSuit &&
      (!highestCard || card?.numericValue > highestCard.numericValue)
    ) {
      setHighestCard(card);
      setRoundWinner(1);
    }

    // Update played cards
    setCardsPlayed((prevCards: any) => [...prevCards, { playerIdx: 1, card }]);

    // Update player's hand (create new array to force update)
    players = [...players]; // Force update to trigger reactivity

    // Move to next player
    setCurrentPlayer(0);

    // If all players have played, end the round
    if (cardsPlayed.length >= players.length) {
      finishRound();
    }
  }

  function finishRound() {
    setTimeout(() => {
      log(
        `${players[roundWinner].name} ${
          players[roundWinner].name === "You" ? "win" : "wins"
        } round ${roundNum}!`,
        true
      );
      updateStatus(
        `${players[roundWinner].name} ${
          players[roundWinner].name === "You" ? "win" : "wins"
        } round ${roundNum}!`
      );

      // Update control player
      setControlPlayer(roundWinner);

      // Start next round or end game
      if (roundNum < 5) {
        setTimeout(() => startRound(), 1000);
      } else {
        endGame();
      }
    }, 500);
  }

  function endGame() {
    setGameOver(true);
    setGameWinner(controlPlayer);
    const winner = players[gameWinner];

    log(`Game Over! ${winner.name} won the game!`, true);
    updateStatus(`🏆 ${winner.name} won the game! 🏆`);

    setShowNewGameButton(true);
  }

  function handleCardClick(index: number) {
    const player = players[0];
    const playableIndices = player.getPlayableCards(leadSuit);

    if (currentPlayer === 0 && playableIndices.includes(index) && !gameOver) {
      playerPlay(index);
    }
  }

  // Scroll to bottom of logs
  useEffect(() => {
    setTimeout(() => {
      logScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [logMessages]);

  // Render the game
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Card Game</Text>
        <RoundIndicator currentRound={roundNum} />
      </View>

      <View style={styles.gameArea}>
        {/* Computer Area */}
        <View
          style={[
            styles.playerArea,
            styles.opponentArea,
            controlPlayer === 1 ? styles.highlighted : {},
          ]}
        >
          <Text style={styles.playerName}>Computer</Text>
          <View style={styles.cards}>
            {players[1].hand.map((_, index) => (
              <CardComponent key={`opponent-${index}`} isBackface={true} />
            ))}
          </View>
        </View>

        {/* Center Area */}
        <View style={styles.centerArea}>
          <View style={styles.status}>
            <Text style={styles.statusText}>{gameStatus}</Text>
          </View>

          <View style={styles.playedCards}>
            {cardsPlayed.map(
              (
                { playerIdx, card }: { playerIdx: number; card: Card },
                index: number
              ) => (
                <PlayedCardComponent
                  key={`played-card-${index}`}
                  card={card}
                  playerName={players[playerIdx].name}
                  isHighlight={highestCard === card}
                />
              )
            )}
          </View>
        </View>

        {/* Player Area */}
        <View
          style={[
            styles.playerArea,
            styles.humanArea,
            controlPlayer === 0 ? styles.highlighted : {},
          ]}
        >
          <Text style={styles.playerName}>You</Text>
          <View style={styles.cards}>
            {players[0].hand.map((card, index) => (
              <CardComponent
                key={`player-${index}`}
                card={card}
                index={index}
                playable={
                  currentPlayer === 0 &&
                  players[0].getPlayableCards(leadSuit).includes(index) &&
                  !gameOver
                }
                onPress={() => handleCardClick(index)}
                isBackface={false}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Game Log */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Game Log</Text>
        <ScrollView
          ref={logScrollViewRef}
          style={styles.logScrollView}
          contentContainerStyle={styles.logContent}
        >
          {logMessages.map((log, idx) => (
            <Text
              key={`log-${idx}`}
              style={[styles.logText, log.important ? styles.importantLog : {}]}
            >
              {log.text}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!roundNum ? (
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        ) : gameOver && showNewGameButton ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              resetGame();
              setTimeout(() => startGame(), 100);
            }}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default App;
