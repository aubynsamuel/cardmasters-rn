import { Card, Deck, Player } from "./Classes";

// Enums and Types
export enum Suit {
  Diamond = "diamond",
  Spade = "spade",
  Heart = "love",
  Club = "club",
}

export enum CardValue {
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
}

export type LogEntry = {
  message: string;
  important: boolean;
  id: number;
};

export type PlayedCard = {
  playerIdx: number;
  card: Card;
};

export interface GameState {
  deck: Deck | null;
  players: Player[];
  startingPlayer: number;
  controlPlayer: number;
  currentPlayer: number;
  roundNum: number;
  cardsPlayed: PlayedCard[];
  leadSuit: Suit | null;
  highestCard: Card | null;
  roundWinner: number | null;
  gameStarted: boolean;
  gameOver: boolean;
  gameWinner: number | null;
}

// Props for Card Component
export interface CardComponentProps {
  card?: Card;
  index?: number;
  playable?: boolean;
  onPress?: (index: number) => void;
  isBackface: boolean;
}

export interface PlayedCardComponentProps {
  card: Card;
  playerName: string;
  isHighlight: boolean;
}

export interface RoundIndicatorProps {
  currentRound: number;
}

export interface GameStateTypes {
  deck: Deck;
  players: Player[];
  startingPlayer: number;
  controlPlayer: number;
  currentPlayer: number;
  roundNum: number;
  cardsPlayed: never[];
  leadSuit: null;
  highestCard: null;
  roundWinner: null;
  gameOver: boolean;
  gameWinner: null;
}
