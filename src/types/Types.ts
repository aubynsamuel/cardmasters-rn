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

interface Message {
  text: string;
  senderName: string;
  senderId: string;
  timestamp: Date;
}

interface Player {
  name: string;
  id: string;
  hands: Card[];
  score: number;
  status?: PlayerStatus;
}

enum PlayerStatus {
  NOT_READY = "NOT_READY",
  READY = "READY",
  IN_GAME = "IN_GAME",
  VIEWING_RESULTS = "VIEWING_RESULTS",
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
  isIntentional: boolean;
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
interface JoinRequestResponsePayload {
  accepted: boolean;
  requestId: string;
  message: string;
  roomId?: string;
  roomData?: Room;
}

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
  PlayerStatus,
  Message,
  JoinRequestResponsePayload,
  GameRecord,
  GameRecordPlayer,
};
