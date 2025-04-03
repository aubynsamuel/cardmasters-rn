import { PlayerStatus, Message } from "../server/types";

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
  id: string;
  hands: Card[];
  score: number;
  status?: PlayerStatus; // Added status field
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

type RoomStatus = "waiting" | "playing" | "finished";

interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: RoomStatus;
  ownerId: string;
  messages: Message[];
}

interface LobbyRoom {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: string;
}

// Event payload types
interface CreateRoomPayload {
  playerName: string;
  roomName?: string;
  id: string;
}

interface JoinRoomPayload {
  roomId: string;
  playerName: string;
  id: string;
}

interface LeaveRoomPayload {
  roomId: string;
}

interface StartGamePayload {
  roomId: string;
}

interface PlayCardPayload {
  roomId: string;
  playerId: string;
  card: Card;
  cardIndex: number;
}

interface RoomJoined {
  roomId: string;
  room: Room;
}

interface OwnerChangedPayload {
  newOwnerId: string;
  updatedPlayers: Player[];
}

interface PlayerJoinedPayload {
  userId: string;
  playerName: string;
  updatedPlayers: Player[];
}

interface PlayerLeftPayload {
  userId: string;
  playerName: string;
  updatedPlayers: Player[];
}

interface GameStartedPayload {
  roomId: string;
  roomData: Room;
}

interface ErrorPayload {
  message: string;
}

interface validPlay {
  valid: {
    error: string;
    message: string;
  };
}

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
  Callbacks,
  Room,
  LobbyRoom,
  CreateRoomPayload,
  JoinRoomPayload,
  LeaveRoomPayload,
  StartGamePayload,
  PlayCardPayload,
  RoomJoined,
  RoomStatus,
  OwnerChangedPayload,
  ErrorPayload,
  GameStartedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  validPlay,
};
