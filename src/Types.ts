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
type Player = "You" | "Computer";

interface Play {
  player: Player;
  card: Card;
}

interface RoundState {
  leadCard: Card | null;
  plays: Play[];
}

type AccumulatedPoints = {
  computer: number;
  human: number;
};

// For tracking the sequence of control cards
type ControlSequence = {
  player: Player;
  cards: Card[];
};

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
  AccumulatedPoints,
  ControlSequence,
};
