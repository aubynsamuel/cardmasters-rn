type Suit = "diamond" | "spade" | "love" | "club";
type Rank = "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

interface GameState {
  human: Card[];
  computer: Card[];
  deck: Card[];
}

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

export {
  Suit,
  Rank,
  Card,
  GameState,
  gameHistoryType,
  Player,
  Play,
  GameScore,
};
