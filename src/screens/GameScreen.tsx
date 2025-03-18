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
} from "../functions/GameFunctions";
import {
  Card,
  gameHistoryType,
  Player,
  GameState,
  Play,
  roundsType,
} from "../Types";
import getStyles from "../Styles";
import { StatusBar } from "expo-status-bar";
import RenderCard from "../components/RenderCard";
import GameHistory from "../components/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FlipInEasyX,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ShufflingAnimation from "../components/ShufflingAnimations";
import EmptyCard from "../components/EmptySlotCard";
import SlotCard from "../components/SlotCard";

let currentCard: Card | null;
let currentControl: Player = "computer";
const roundsList: roundsType[] = [
  { roundNUmber: 1, active: true },
  { roundNUmber: 2, active: false },
  { roundNUmber: 3, active: false },
  { roundNUmber: 4, active: false },
  { roundNUmber: 5, active: false },
];

const GameScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
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
  const [rounds, setRounds] = useState<roundsType[]>(roundsList);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);

  // const messageScale = useSharedValue(1);

  // const ref = useRef<number>(0);
  // console.log("Re rendered ", ref.current++, " times");

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (currentControl === "computer")
      computerControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      computerControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });

    if (currentControl === "you")
      humanControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      humanControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });
  }, [currentControl]);

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
      // console.log("newly created deck ", updatedGameState.deck.length);
      return updatedGameState;
    } else {
      const updatedGameState = dealCards(gameState.deck);
      setGameState(updatedGameState);
      // console.log("deck from previous game ", updatedGameState.deck.length);
      return updatedGameState;
    }
  };

  // Update the startNewGame function to use animations
  const startNewGame = (): void => {
    // First, reset everything
    setRoundsPlayed(0);
    setRounds(roundsList);
    setCurrentLeadCard(null);
    currentCard = null;
    setCurrentPlays([]);
    setMessage(
      !gameState || gameState.deck.length < 5 * 2 ? `Shuffling cards...` : ""
    );
    setGameOver(false);
    setShowStartButton(true);
    setGameHistory([]);

    // Start shuffling animation
    setIsShuffling(!gameState || gameState.deck.length < 5 * 2);

    // Show the shuffling animation for 2 seconds
    setTimeout(
      () => {
        setIsShuffling(false);
        setMessage(`Dealing cards...`);

        // Set up the game state
        const gameState = handleGameState();

        // Start the dealing animation
        setIsDealing(true);

        // Deal cards with animation
        setTimeout(() => {
          setComputerHand(gameState.computer);
          setHumanHand(gameState.human);

          // End dealing animation after cards are shown
          setTimeout(() => {
            setIsDealing(false);
            setMessage(`Game started. ${currentControl} will play first.`);
          }, 1500);
        }, 500);
      },
      !gameState || gameState.deck.length < 5 * 2 ? 2000 : 50
    );
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
    currentCard = null;
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
        message: `${player} played ${card.rank}${suitSymbols[card.suit]}`,
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

    setTimeout(() => {
      resetRound();
      const newRoundsPlayed = roundsPlayed + 1;
      // console.log("Round Number", newRoundsPlayed);
      setRoundsPlayed(newRoundsPlayed > 5 ? 5 : newRoundsPlayed);
      setRounds((prev) =>
        prev.map((rnd) =>
          rnd.roundNUmber === newRoundsPlayed + 1
            ? { ...rnd, active: true }
            : rnd
        )
      );
      // Check if game is over
      if (newRoundsPlayed >= 5) {
        setGameOver(true);
        setMessage(
          `Game Over \n ${newControl === "you" ? "You won" : "Computer won!"}`
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
      // console.log("Computer has no cards to play");
      return;
    }

    const remainingRounds = 5 - roundsPlayed;
    let cardToPlay: Card;
    if (currentControl === "computer") {
      // console.log("Computer is playing as a leader");
      // console.log("");
      cardToPlay = chooseCardAI(computerHand, null, remainingRounds);
    } else {
      // console.log("Computer is playing as a follower");
      // console.log("Current lead card ", currentCard);
      // console.log("");
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

    // Add a slight delay for visual effect
    setTimeout(() => {
      playCard("you", card);

      const isLeading = !currentLeadCard;
      if (isLeading) {
        currentCard = card;
        setMessage("Computer is thinking...");

        // Add delay to simulate computer "thinking"
        setTimeout(() => computerTurn(), 1000);
      }
    }, 300);
  };

  const renderCardBack = (index: number) => {
    return (
      <Animated.View
        key={`computer-card-${index}`}
        entering={
          isDealing ? FlipInEasyX.delay(index * 200).duration(300) : undefined
        }
      >
        <View style={styles.cardBack}>
          <Text style={styles.cardBackText}>🂠</Text>
        </View>
      </Animated.View>
    );
  };

  const renderDeckBack = (index: number) => {
    return (
      <View
        key={index}
        style={[
          styles.deckCardBack,
          { transform: [{ translateX: index * 5 }] },
        ]}
      >
        <Text style={styles.cardBackText}>🂠</Text>
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="transparent" style="dark" />

        {/* Shuffling animation overlay - shows when cards are being shuffled */}
        {isShuffling && (
          <View style={styles.animationOverlay}>
            <ShufflingAnimation />
          </View>
        )}

        {/* Dealing animation overlay - shows when cards are being dealt */}
        {isDealing && (
          <View style={styles.animationOverlay}>
            <Text style={styles.dealingText}>Dealing Cards...</Text>
          </View>
        )}

        {/* TOP ROW */}
        <View
          style={[
            {
              flex: 0.1,
              justifyContent: "space-between",
              flexDirection: "row",
              opacity: isShuffling || isDealing ? 0.5 : 1, // Dim during animations
            },
          ]}
        >
          {/* Remaining Deck */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text>Deck</Text>
            <View
              style={{
                flexDirection: "row",
                top: -35,
                left: 0,
              }}
            >
              {gameState.deck.map((deck, index) => renderDeckBack(index))}
            </View>
          </View>

          {/* Rounds */}
          <View
            style={{
              flexDirection: "column",
              gap: 5,
              alignItems: "center",
            }}
          >
            <Text>Rounds</Text>
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
              }}
            >
              {rounds.map((round, index) => (
                <View
                  key={index + round.roundNUmber}
                  style={{
                    height: 15,
                    width: 15,
                    backgroundColor: round.active ? "yellow" : "lightgray",
                    borderRadius: 30,
                    borderColor: "red",
                    borderWidth: 2,
                    marginBottom: 5,
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* MAIN GAME AREA */}
        <View
          style={{
            flexDirection: width > 400 ? "row" : "column",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 15,
            opacity: isShuffling ? 0.5 : 1, // Dim during shuffling
          }}
        >
          {/* Computer's Hand at the Top */}
          <View style={[styles.computerSection]}>
            <Text style={styles.sectionHeader}>
              Computer's Hand
              <Animated.View
                style={{
                  transform: [{ scale: computerControlScale }],
                }}
              >
                <Text> 🔥 </Text>
              </Animated.View>
            </Text>
            <View style={styles.hand}>
              {computerHand.map((card, index) => renderCardBack(index))}
            </View>
          </View>

          {/* Game Results in the Middle */}
          <View style={[styles.gameResultSection]}>
            <Text numberOfLines={2} style={[styles.message]}>
              {message}
            </Text>

            {/* Current Play Cards */}
            <View style={styles.currentRound}>
              {/* Computer Play Spot */}
              {currentPlays.find((play) => play.player === "computer") ? (
                <SlotCard
                  card={
                    currentPlays.find((play) => play.player === "computer")!
                      .card
                  }
                />
              ) : (
                <EmptyCard />
              )}

              {/* Human Play Spot */}
              {currentPlays.find((play) => play.player === "you") ? (
                <SlotCard
                  card={
                    currentPlays.find((play) => play.player === "you")!.card
                  }
                />
              ) : (
                <EmptyCard />
              )}
            </View>
          </View>

          {/* Human's Hand at the Bottom */}
          <View style={[styles.humanSection]}>
            <Text style={styles.sectionHeader}>
              Your Hand
              <Animated.View
                style={{
                  transform: [{ scale: humanControlScale }],
                }}
              >
                <Text> 🔥 </Text>
              </Animated.View>
            </Text>
            <View style={styles.hand}>
              {humanHand.map((card, index) => (
                <Animated.View
                  key={`human-card-${card.suit}-${card.rank}`}
                  entering={
                    isDealing
                      ? FlipInEasyX.delay(
                          (index + computerHand.length) * 200
                        ).duration(300)
                      : undefined
                  }
                >
                  <RenderCard
                    card={card}
                    playCard={() => humanPlayCard(card, index)}
                    isDealt={isDealing}
                    dealDelay={index * 200}
                    canPlayCard={currentControl == "you"}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        </View>

        {/* Start, New and Restart Game Buttons */}
        <View
          style={{
            flexDirection: "row",
            alignSelf: "center",
            gap: 10,
            flex: width > 400 ? 0.22 : 0.12,
            opacity: isShuffling || isDealing ? 0.5 : 1, // Dim during animations
          }}
        >
          {showStartButton && currentControl == "computer" && (
            <TouchableOpacity
              style={styles.newGameButton}
              onPress={startPlaying}
            >
              <Text style={styles.newGameText}>{"Start Game"}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={() => {
              startNewGame();
            }}
          >
            <Text style={styles.newGameText}>
              {gameOver || showStartButton ? "New Game" : "Restart Game"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Game Logs */}
        <View
          style={{
            flex: width > 400 ? 0.4 : 0.24,
            opacity: isShuffling ? 0.5 : 1, // Dim during shuffling
          }}
        >
          <GameHistory gameHistory={gameHistory} width={width} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default GameScreen;
