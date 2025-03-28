// // src/hooks/useGameLogic.ts
// import { useState, useEffect, useRef } from "react";
// import CardsGame, { CardsGameUIState, gameOverData } from "./GameClass";
// import { Player, Card } from "../Types";

// interface GameActions {
//   startNewGame: () => void;
//   startPlaying: () => void;
//   humanPlayCard: (card: Card, index: number) => void;
//   setGameOverCallback: (callback: (gameOverData: gameOverData) => void) => void;
// }

// export default function useGameLogic(initialPlayers: Player[]): [CardsGameUIState | null, GameActions] {
//   const gameRef = useRef<CardsGame | null>(null);
//   const [gameState, setGameState] = useState<CardsGameUIState | null>(null);

//   useEffect(() => {
//     // Initialize the game class
//     if (!gameRef.current) {
//       gameRef.current = new CardsGame(initialPlayers);

//       // Set up callbacks
//       gameRef.current.setCallbacks({
//         onStateChange: (newState: CardsGameUIState) => {
//           setGameState({ ...newState });
//         },
//         onGameOver: (gameOverData) => {
//           // If gameState has an onGameOver callback, call it.
//           if (gameState?.gameOver) {
//             gameState.onGameOver(gameOverData);
//           }
//         },
//       });

//       // Initialize state and start the game
//       setGameState(gameRef.current.getState());
//       gameRef.current.startGame();
//     }

//     return () => {
//       // Cleanup: reset the game reference
//       gameRef.current = null;
//     };
//   }, []);

//   // Expose game methods to the UI
//   const gameActions: GameActions = {
//     startNewGame: () => gameRef.current?.startGame(),
//     startPlaying: () => gameRef.current?.startPlaying(),
//     humanPlayCard: (card, index) => gameRef.current?.humanPlayCard(card, index),
//     setGameOverCallback: (callback) => {
//       setGameState((prev) => (prev ? { ...prev, onGameOver: callback } : prev));
//     },
//   };

//   return [gameState, gameActions];
// }
