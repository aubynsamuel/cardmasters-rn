import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert,
  useWindowDimensions,
  TouchableOpacity,
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
import CardComponent from "../components/CardComponent";
import GameHistory from "../components/GameHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FlipInEasyX,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import ShufflingAnimation from "../components/ShufflingAnimations";
import EmptyCard from "../components/EmptySlotCard";
import SlotCard from "../components/SlotCard";
import OpponentCard from "../components/OpponentCard";
import TopRow, { GameScore } from "../components/TopRow";
import GameControls from "../components/GameControls";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const GAME_TO: number = 1;

const GameScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const [humanHand, setHumanHand] = useState<Card[]>([]);
  const [computerHand, setComputerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    computer: [],
    deck: [],
    human: [],
  });
  const [gameScore, setGameScore] = useState<GameScore>({
    computer: 0,
    human: 0,
  });
  const [currentPlays, setCurrentPlays] = useState<Play[]>([]);
  const [currentLeadCard, setCurrentLeadCard] = useState<Card | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<gameHistoryType[]>([]);
  const [showStartButton, setShowStartButton] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [canPlayCard, setCanPlayCard] = useState(false);
  const computerControlScale = useSharedValue(0);
  const humanControlScale = useSharedValue(0);
  const currentCard = useRef<Card | null>();
  const currentControl = useRef<Player>("Computer");
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);

  // const ref = useRef<number>(0);
  // console.log("Re rendered ", ref.current++, " times");

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (currentControl.current === "Computer")
      computerControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      computerControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });

    if (currentControl.current === "You")
      humanControlScale.value = withSpring(1.2, {
        duration: 500,
        stiffness: 300,
      });
    else
      humanControlScale.value = withSpring(0, {
        duration: 500,
        stiffness: 300,
      });
  }, [currentControl.current]);

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
    setCurrentLeadCard(null);
    currentCard.current = null;
    setCurrentPlays([]);
    setMessage(
      !gameState || gameState.deck.length < 5 * 2 ? `Shuffling cards...` : ""
    );
    setGameOver(false);
    setShowStartButton(currentControl.current === "Computer");
    setGameHistory([]);

    // Start shuffling animation
    setIsShuffling(!gameState || gameState.deck.length < 5 * 2);

    // Show the shuffling animation for 2 seconds
    setTimeout(
      () => {
        setIsShuffling(false);
        setMessage(`Dealing cards...`);

        const gameState = handleGameState();

        setIsDealing(true);

        // Deal cards with animation
        setTimeout(() => {
          setComputerHand(gameState.computer);
          setHumanHand(gameState.human);

          // End dealing animation after cards are shown
          setTimeout(() => {
            setCanPlayCard(currentControl.current === "You");
            setIsDealing(false);
            setMessage(
              `${
                currentControl.current === "Computer"
                  ? "Press 'Start Game' to play"
                  : "Play a card to start"
              } `
            );
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
    setCanPlayCard(false);
    setCurrentLeadCard(null);
    currentCard.current = null;
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
        secondPlay.player === "Computer"
          ? "Computer wins the round."
          : "You win the round.";
    } else {
      // Otherwise leader retains control
      newControl = firstPlay.player;
      resultMessage =
        firstPlay.player === "You"
          ? "You win the round."
          : "Computer wins the round.";
    }

    currentControl.current = newControl;
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
      // Check if game is over
      if (newRoundsPlayed >= 5) {
        setCanPlayCard(false);
        setGameOver(true);
        setShowStartButton(false);
        const currentGameScore: GameScore =
          newControl === "Computer"
            ? {
                computer: gameScore.computer + 1,
                human: gameScore.human,
              }
            : {
                computer: gameScore.computer,
                human: gameScore.human + 1,
              };
        setGameScore((prev) => {
          if (newControl === "Computer") {
            prev.computer++;
          } else {
            prev.human++;
          }
          return prev;
        });
        console.log(gameScore.computer, gameScore.human);
        setMessage(
          `${
            newControl === "You"
              ? "🏆 You won this game 🏆"
              : "🏆 Computer won this game! 🏆"
          }`
        );
        if (
          currentGameScore.computer < GAME_TO &&
          currentGameScore.human < GAME_TO
        ) {
          setTimeout(() => {
            startNewGame();
          }, 1000);
        } else {
          setMessage(`Game Over ${currentControl.current} won`);
          setTimeout(() => {
            navigation.navigate("GameOver", {
              winner: currentControl.current,
              score: currentGameScore,
            });
          }, 1000);
        }
      } else {
        // Continue to next round
        if (newControl === "Computer") {
          setCanPlayCard(false);
          setMessage("Computer is playing.");
          setTimeout(() => {
            computerTurn();
          }, 1000);
        } else {
          setCanPlayCard(true);
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
    if (currentControl.current === "Computer") {
      // console.log("Computer is playing as a leader");
      // console.log("");
      cardToPlay = chooseCardAI(computerHand, null, remainingRounds);
    } else {
      // console.log("Computer is playing as a follower");
      // console.log("Current lead card ", currentCard.current);
      // console.log("");
      if (!currentCard.current) {
        console.log("Current control card is null");
        return;
      }
      cardToPlay = chooseCardAI(
        computerHand,
        currentCard.current,
        remainingRounds
      );
    }

    setComputerHand((prev) => {
      let newHand = [...prev];
      newHand.splice(newHand.indexOf(cardToPlay), 1);
      return newHand;
    });

    playCard("Computer", cardToPlay);
    setCanPlayCard(true);
    setMessage("It's your turn to play.");
  };

  const humanPlayCard = (card: Card, index: number): void | 1 => {
    if (gameOver) {
      return 1;
    }

    // If it's not human's turn
    if (currentControl.current === "Computer" && !currentLeadCard) {
      Alert.alert("Wait", "It's not your turn to play!");
      return 1;
    }

    if (!canPlayCard) {
      Alert.alert("Wait", "It's not your turn to play!");
      return 1;
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
        return 1;
      } else {
        setCanPlayCard(false);
      }
    } else {
      setCanPlayCard(false);
    }

    setHumanHand((prev) => {
      let newHand = [...prev];
      newHand.splice(index, 1);
      return newHand;
    });

    setTimeout(() => {
      playCard("You", card);

      const isLeading = !currentLeadCard;
      if (isLeading) {
        currentCard.current = card;
        setMessage("Computer is thinking...");
        setTimeout(() => computerTurn(), 1000);
      }
    }, 300);
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="transparent" style="light" hidden={true} />

        {isShuffling && (
          <View style={styles.animationOverlay}>
            <ShufflingAnimation />
          </View>
        )}

        {isDealing && (
          <View style={styles.animationOverlay}>
            <Text style={styles.dealingText}>Dealing Cards...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControlsOverlay && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.overlayContainer}
            onPress={() => setShowControlsOverlay(false)}
          >
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Game Controls</Text>
                <TouchableOpacity onPress={() => setShowControlsOverlay(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <GameControls
                showStartButton={showStartButton}
                startPlaying={startPlaying}
                startNewGame={startNewGame}
                gameOver={gameOver}
                onClose={() => setShowControlsOverlay(false)}
              />
            </View>
          </TouchableOpacity>
        )}

        <TopRow
          gameState={gameState}
          styles={styles}
          setShowControlsOverlay={setShowControlsOverlay}
          gameScore={gameScore}
        />

        {/* MAIN GAME AREA */}
        <View style={styles.mainGameArea}>
          {/* Computer's Hand at the Top */}
          <View style={[styles.computerSection]}>
            <Text style={styles.sectionHeader}>
              Computer
              <Animated.View
                style={{
                  transform: [{ scale: computerControlScale }],
                }}
              >
                <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
              </Animated.View>
            </Text>
            <View style={styles.hand}>
              {computerHand.map((card, index) => (
                <OpponentCard
                  index={index}
                  styles={styles}
                  isDealing={isDealing}
                  key={`computer-card-${index}`}
                />
              ))}
            </View>
          </View>

          {/* Game Results in the Middle */}
          <View style={[styles.gameResultSection]}>
            <View style={styles.messageContainer}>
              <Text numberOfLines={2} style={[styles.message]}>
                {message}
              </Text>
            </View>

            {/* Current Play Cards */}
            <View style={styles.currentRound}>
              {/* Computer Play Spot */}
              {currentPlays.find((play) => play.player === "Computer") ? (
                <SlotCard
                  card={
                    currentPlays.find((play) => play.player === "Computer")!
                      .card
                  }
                />
              ) : (
                <EmptyCard />
              )}

              {/* Human Play Spot */}
              {currentPlays.find((play) => play.player === "You") ? (
                <SlotCard
                  card={
                    currentPlays.find((play) => play.player === "You")!.card
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
              You
              <Animated.View
                style={{
                  transform: [{ scale: humanControlScale }],
                }}
              >
                <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
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
                  <CardComponent
                    card={card}
                    playCard={() => humanPlayCard(card, index)}
                    isDealt={isDealing}
                    dealDelay={index * 200}
                    width={width}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        </View>

        {showStartButton && (
          <View style={{ width: "100%", alignItems: "center" }}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                startPlaying();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.overlayButtonText}>{"Start Game"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <GameHistory gameHistory={gameHistory} width={width} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default GameScreen;
