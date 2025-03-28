// // GameScreen.tsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   Alert,
//   useWindowDimensions,
//   TouchableOpacity,
// } from "react-native";
// import { suitSymbols } from "../functions/GameFunctions";
// import { Card, gameHistoryType, GameState, Play, GameScore } from "../Types";
// import getStyles from "../Styles";
// import { StatusBar } from "expo-status-bar";
// import CardComponent from "../components/CardComponent";
// import GameHistory from "../components/GameHistory";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import Animated, {
//   FlipInEasyX,
//   useSharedValue,
//   withSpring,
// } from "react-native-reanimated";
// import ShufflingAnimation from "../components/ShufflingAnimations";
// import EmptyCard from "../components/EmptySlotCard";
// import SlotCard from "../components/SlotCard";
// import OpponentCard from "../components/OpponentCard";
// import TopRow from "../components/TopRow";
// import GameControls from "../components/GameControls";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import AnimatedScoreDisplay from "../components/AnimatedScoreDisplay";
// import { useAuth } from "../AuthContext"; // Import the auth context

// type GameScreenStackParamList = {
//   GameOver: { winner: string; score: GameScore };
// };

// type GameScreenProps = NativeStackNavigationProp<
//   GameScreenStackParamList,
//   "GameOver"
// >;

// const GAME_TO: number = 5;
// const SERVER_URL = "http://192.168.99.88:3001"; // Change this to your server URL

// const GameScreen: React.FC = () => {
//   const navigation = useNavigation<GameScreenProps>();
//   const { width, height } = useWindowDimensions();
//   const styles = getStyles(width, height);
//   const { userData, userId } = useAuth(); // Get user data from auth context

//   // WebSocket reference
//   const wsRef = useRef<WebSocket | null>(null);
//   const [opponentName, setOpponentName] = useState<string>("Opponent");
//   const [opponentId, setOpponentId] = useState<string>("");
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
//   const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);

//   // UseState variables and functions
//   const [myHand, setMyHand] = useState<Card[]>([]);
//   const [opponentHand, setOpponentHand] = useState<Card[]>([]);
//   const [gameState, setGameState] = useState<GameState>({
//     computer: [],
//     deck: [],
//     human: [],
//   });
//   const [gameScore, setGameScore] = useState<GameScore>({
//     computer: 0,
//     human: 0,
//   });
//   const [currentPlays, setCurrentPlays] = useState<Play[]>([]);
//   const [currentLeadCard, setCurrentLeadCard] = useState<Card | null>(null);
//   const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
//   const [message, setMessage] = useState<string>("");
//   const [gameOver, setGameOver] = useState<boolean>(false);
//   const [gameHistory, setGameHistory] = useState<gameHistoryType[]>([]);
//   const [isShuffling, setIsShuffling] = useState<boolean>(false);
//   const [isDealing, setIsDealing] = useState<boolean>(false);
//   const [canPlayCard, setCanPlayCard] = useState(false);
//   const [showControlsOverlay, setShowControlsOverlay] = useState(false);
//   const [accumulatedPoints, setAccumulatedPoints] = useState<number>(0);

//   // Animation variables
//   const opponentControlScale = useSharedValue(0);
//   const myControlScale = useSharedValue(0);

//   // Function to send messages to the server
//   const sendMessage = (type: string, data: any) => {
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({ type, data }));
//     } else {
//       console.error("WebSocket is not connected");
//     }
//   };

//   // Initialize WebSocket connection
//   useEffect(() => {
//     // Connect to the server
//     wsRef.current = new WebSocket(SERVER_URL);

//     wsRef.current.onopen = () => {
//       console.log("Connected to server");
//       setIsConnected(true);

//       // Join a game when connected
//       sendMessage("joinGame", {
//         userId,
//         displayName: userData?.displayName || "Player",
//       });
//     };

//     wsRef.current.onclose = () => {
//       console.log("Disconnected from server");
//       setIsConnected(false);
//     };

//     wsRef.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     wsRef.current.onmessage = (event) => {
//       try {
//         const { type, data } = JSON.parse(event.data);

//         switch (type) {
//           case "joinedRoom":
//             console.log(`Joined room: ${data.roomId}`);
//             break;

//           case "waitingForOpponent":
//             setWaitingForOpponent(true);
//             setMessage("Waiting for an opponent to join...");
//             break;

//           case "gameStarted": {
//             setWaitingForOpponent(false);

//             // Find opponent info
//             const opponent = data.players.find((p: any) => p.id !== userId);
//             if (opponent) {
//               setOpponentName(opponent.name);
//               setOpponentId(opponent.id);
//             }

//             // Set turn
//             const isMyTurn = data.currentTurn === userId;
//             setIsMyTurn(isMyTurn);
//             setCanPlayCard(isMyTurn);

//             // Update control indicators
//             if (isMyTurn) {
//               myControlScale.value = withSpring(1.2, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//               opponentControlScale.value = withSpring(0, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//             } else {
//               myControlScale.value = withSpring(0, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//               opponentControlScale.value = withSpring(1.2, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//             }

//             // Show shuffling animation
//             setIsShuffling(true);
//             setMessage("Shuffling cards...");

//             // Set hands
//             setMyHand(data.hand);
//             setOpponentHand(Array(data.opponentCardCount).fill(null));

//             // Update score
//             setGameScore(data.score);

//             setTimeout(() => {
//               setIsShuffling(false);
//               setMessage("Dealing cards...");
//               setIsDealing(true);

//               setTimeout(() => {
//                 setIsDealing(false);
//                 setMessage(
//                   isMyTurn
//                     ? "Your turn to play"
//                     : `Waiting for ${opponentName} to play`
//                 );
//               }, 1500);
//             }, 2000);
//             break;
//           }

//           case "cardPlayed":
//             // Update game history
//             setGameHistory((prev) => [
//               ...prev,
//               {
//                 message: `${data.playerName} played ${data.card.rank}${
//                   suitSymbols[data.card.suit]
//                 }`,
//                 importance: false,
//               },
//             ]);

//             // Update current plays
//             setCurrentPlays((prev) => {
//               let newPlay = [...prev];
//               newPlay = [
//                 ...newPlay,
//                 { player: data.playerId, card: data.card },
//               ];
//               return newPlay;
//             });

//             // Set lead card if not set
//             setCurrentLeadCard((prev) => {
//               if (prev == null) {
//                 prev = data.card;
//               }
//               return prev;
//             });

//             // Update opponent's hand if it's the opponent who played
//             if (data.playerId !== userId) {
//               setOpponentHand(Array(data.remainingCards).fill(null));
//             }
//             break;

//           case "turnChanged": {
//             const myTurn = data.currentTurn === userId;
//             setIsMyTurn(myTurn);
//             setCanPlayCard(myTurn);

//             // Update control indicators
//             if (myTurn) {
//               myControlScale.value = withSpring(1.2, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//               opponentControlScale.value = withSpring(0, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//             } else {
//               myControlScale.value = withSpring(0, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//               opponentControlScale.value = withSpring(1.2, {
//                 duration: 500,
//                 stiffness: 300,
//               });
//             }

//             setMessage(
//               myTurn
//                 ? "Your turn to play"
//                 : `Waiting for ${opponentName} to play`
//             );
//             break;
//           }

//           case "roundFinished":
//             // Update game history
//             setGameHistory((prev) => [
//               ...prev,
//               {
//                 message: `${data.winner.name} won the round`,
//                 importance: true,
//               },
//             ]);

//             // Update accumulated points
//             setAccumulatedPoints(data.accumulatedPoints);

//             // Show message
//             setMessage(
//               `${data.winner.name} won the round (${data.pointsEarned} points)`
//             );

//             // Reset current plays after a delay
//             setTimeout(() => {
//               setCurrentPlays([]);
//               setCurrentLeadCard(null);
//               setRoundsPlayed((prev) => prev + 1);
//             }, 1500);
//             break;

//           case "gameOver": {
//             setGameOver(true);
//             setCanPlayCard(false);

//             // Update final score
//             const finalScore = {
//               computer: data.score[opponentId] || 0,
//               human: data.score[userId] || 0,
//             };
//             setGameScore(finalScore);

//             // Show game over message
//             setMessage(`Game Over! ${data.winner.name} won the match!`);

//             // Navigate to game over screen
//             setTimeout(() => {
//               navigation.navigate("GameOver", {
//                 winner: data.winner.name,
//                 score: finalScore,
//               });
//             }, 3000);
//             break;
//           }

//           case "playerDisconnected":
//             Alert.alert(
//               "Opponent Disconnected",
//               `${data.playerName} has left the game.`,
//               [
//                 {
//                   text: "Return to Menu",
//                   onPress: () => navigation.goBack(),
//                 },
//               ]
//             );
//             break;

//           case "error":
//             Alert.alert("Error", data.message);
//             break;

//           default:
//             console.log(`Unknown message type: ${type}`);
//         }
//       } catch (error) {
//         console.error("Error parsing message:", error);
//       }
//     };

//     // Clean up on unmount
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, []);

//   const playCard = (card: Card, index: number): void | 1 => {
//     if (gameOver) {
//       return 1;
//     }

//     if (!canPlayCard) {
//       Alert.alert("Wait", "It's not your turn to play!");
//       return 1;
//     }

//     // If responding, enforce following suit if you have it
//     if (currentLeadCard) {
//       const requiredSuit = currentLeadCard.suit;
//       const hasRequired = myHand.some((c) => c.suit === requiredSuit);

//       if (hasRequired && card.suit !== requiredSuit) {
//         Alert.alert(
//           "Invalid Move",
//           `You must play a ${requiredSuit} card if you have one.`
//         );
//         return 1;
//       }
//     }

//     // Disable playing until server confirms the move
//     setCanPlayCard(false);

//     // Send the move to the server
//     sendMessage("playCard", { cardIndex: index });

//     // Remove card from hand (server will confirm this)
//     setMyHand((prev) => {
//       const newHand = [...prev];
//       newHand.splice(index, 1);
//       return newHand;
//     });
//   };

//   return (
//     <GestureHandlerRootView>
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor="transparent" style="light" hidden={true} />

//         <View style={styles.decorationContainer}>
//           {Array(5)
//             .fill(0)
//             .map((_, i) => (
//               <View
//                 key={i}
//                 style={[
//                   styles.cardDecoration,
//                   {
//                     top: 100 + i * 120,
//                     left: i % 2 === 0 ? -20 : width - 40,
//                     transform: [{ rotate: `${i * 35}deg` }],
//                     opacity: 0.15,
//                   },
//                 ]}
//               />
//             ))}
//         </View>

//         {isShuffling && (
//           <View style={styles.animationOverlay}>
//             <ShufflingAnimation />
//           </View>
//         )}

//         {isDealing && (
//           <View style={styles.animationOverlay}>
//             <Text style={styles.dealingText}>Dealing Cards...</Text>
//           </View>
//         )}

//         {waitingForOpponent && (
//           <View style={styles.animationOverlay}>
//             <Text style={styles.dealingText}>Waiting for opponent...</Text>
//           </View>
//         )}

//         {/* Controls Overlay */}
//         {showControlsOverlay && (
//           <TouchableOpacity
//             activeOpacity={1}
//             style={styles.overlayContainer}
//             onPress={() => setShowControlsOverlay(false)}
//           >
//             <View style={styles.overlayContent}>
//               <View style={styles.overlayHeader}>
//                 <Text style={styles.overlayTitle}>Game Controls</Text>
//                 <TouchableOpacity onPress={() => setShowControlsOverlay(false)}>
//                   <Ionicons name="close" size={24} color="#FFFFFF" />
//                 </TouchableOpacity>
//               </View>
//               <GameControls
//                 showStartButton={false}
//                 startNewGame={() => {}}
//                 gameOver={gameOver}
//                 onClose={() => setShowControlsOverlay(false)}
//               />
//             </View>
//           </TouchableOpacity>
//         )}

//         <TopRow
//           gameState={gameState}
//           setShowControlsOverlay={setShowControlsOverlay}
//           gameScoreList={gameScore}
//         />

//         {/* MAIN GAME AREA */}
//         <View style={styles.mainGameArea}>
//           {/* Opponent's Hand at the Top */}
//           <View style={[styles.computerSection]}>
//             <AnimatedScoreDisplay
//               points={accumulatedPoints}
//               visible={accumulatedPoints > 0 && !isMyTurn}
//             />
//             <Text style={styles.sectionHeader}>
//               {opponentName}
//               <Animated.View
//                 style={{
//                   transform: [{ scale: opponentControlScale }],
//                 }}
//               >
//                 <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
//               </Animated.View>
//             </Text>
//             <View style={styles.hand}>
//               {opponentHand.map((_, index) => (
//                 <OpponentCard
//                   index={index}
//                   isDealing={isDealing}
//                   key={`opponent-card-${index}`}
//                 />
//               ))}
//             </View>
//           </View>

//           {/* Game Results in the Middle */}
//           <View style={[styles.gameResultSection]}>
//             <View style={styles.messageContainer}>
//               <Text numberOfLines={2} style={[styles.message]}>
//                 {message}
//               </Text>
//             </View>

//             {/* Current Play Cards */}
//             <View style={styles.currentRound}>
//               {/* Opponent Play Spot */}
//               {currentPlays.find((play) => play.player !== userId) ? (
//                 <SlotCard
//                   card={
//                     currentPlays.find((play) => play.player !== userId)!.card
//                   }
//                 />
//               ) : (
//                 <EmptyCard />
//               )}

//               {/* My Play Spot */}
//               {currentPlays.find((play) => play.player === userId) ? (
//                 <SlotCard
//                   card={
//                     currentPlays.find((play) => play.player === userId)!.card
//                   }
//                 />
//               ) : (
//                 <EmptyCard />
//               )}
//             </View>
//           </View>

//           {/* My Hand at the Bottom */}
//           <View style={[styles.humanSection]}>
//             <AnimatedScoreDisplay
//               points={accumulatedPoints}
//               visible={accumulatedPoints > 0 && isMyTurn}
//             />
//             <Text style={styles.sectionHeader}>
//               {userData?.displayName || "You"}
//               <Animated.View
//                 style={{
//                   transform: [{ scale: myControlScale }],
//                 }}
//               >
//                 <Text style={{ top: 2, left: 4 }}> 🔥 </Text>
//               </Animated.View>
//             </Text>
//             <View style={styles.hand}>
//               {myHand.map((card, index) => (
//                 <Animated.View
//                   key={`my-card-${card.suit}-${card.rank}`}
//                   entering={
//                     isDealing
//                       ? FlipInEasyX.delay(
//                           (index + opponentHand.length) * 200
//                         ).duration(300)
//                       : undefined
//                   }
//                 >
//                   <CardComponent
//                     card={card}
//                     playCard={() => playCard(card, index)}
//                     isDealt={isDealing}
//                     dealDelay={index * 200}
//                     width={width}
//                   />
//                 </Animated.View>
//               ))}
//             </View>
//           </View>
//         </View>

//         <GameHistory gameHistory={gameHistory} width={width} />
//       </SafeAreaView>
//     </GestureHandlerRootView>
//   );
// };

// export default GameScreen;

import { Text, View } from "react-native";
import React from "react";

const MultiplayerGameScreen = () => {
  return (
    <View>
      <Text>MultiplayerGameScreen</Text>
    </View>
  );
};

export default MultiplayerGameScreen;

// const styles = StyleSheet.create({})
