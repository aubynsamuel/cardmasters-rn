type Suit = "diamond" | "spade" | "love" | "club";
type Rank = "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

interface roundsType {
  roundNUmber: number;
  active: boolean;
}

interface GameState {
  human: Card[];
  computer: Card[];
  deck: Card[];
}
type Player = "you" | "computer";

interface Play {
  player: Player;
  card: Card;
}

interface RoundState {
  leadCard: Card | null;
  plays: Play[];
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
  RoundState,
  gameHistoryType,
  Player,
  Play,
  roundsType,
};
