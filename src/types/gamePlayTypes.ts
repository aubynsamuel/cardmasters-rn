import { Player } from "./ServerPayloadTypes";

type Suit = "diamond" | "spade" | "love" | "club";
type Rank = "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

type Deck = Card[];

interface GameScore {
  playerName: string;
  score: number;
}

interface Play {
  player: Player;
  card: Card;
}

interface gameHistoryType {
  message: string;
  importance: boolean;
}

interface CardsGameState {
  players: Player[];
  currentPlays: Play[];
  currentLeadCard: Card | null;
  cardsPlayed: number;
  message: string;
  gameOver: boolean;
  gameHistory: gameHistoryType[];
  showStartButton: boolean;
  isShuffling: boolean;
  isDealing: boolean;
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  currentControl: Player;
  deck: Deck;
  gameOverData: GameOverData;
  gameTo: number;
}

interface GameOverData {
  winner: Player;
  score: GameScore[];
  isCurrentPlayer: boolean;
  isMultiPlayer: boolean;
}

type Callbacks = {
  onStateChange: (state: CardsGameState) => void;
  onRoundFinished: () => void;
};

interface GameRecord {
  gameId: string;
  dateString: string;
  targetScore: number;
  playerCount: number;
  mode: "multiplayer" | "single-player";
  players: GameRecordPlayer[];
  winnerId: string;
  winnerName: string;
}

interface GameRecordPlayer {
  id: string;
  name: string;
  finalScore: number;
  position: number;
}

export {
  Suit,
  Rank,
  Card,
  Deck,
  gameHistoryType,
  Play,
  GameScore,
  CardsGameState,
  GameOverData,
  Callbacks,
  GameRecord,
  GameRecordPlayer,
};
