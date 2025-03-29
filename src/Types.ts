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

// type Player = "You" | "Computer" | string;
interface Player {
  name: string;
  id: number;
  hands: Card[];
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
  canPlayCard: boolean;
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  currentControl: Player;
  activePlayerIndex: number;
  deck: Deck;
  gameOverData: GameOverData;
}

interface GameOverData {
  winner: Player;
  score: GameScore[];
  isCurrentPlayer: boolean;
}

type Callbacks = {
  onStateChange: (state: CardsGameState) => void;
  onRoundFinished: () => void;
};


export {
  Suit,
  Rank,
  Card,
  Deck,
  gameHistoryType,
  Player,
  Play,
  GameScore,
  CardsGameState,
  GameOverData,
  Callbacks
};
