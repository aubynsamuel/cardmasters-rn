import { Card } from "./GamePlayTypes";

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

export {
  Room,
  LobbyRoom,
  Player,
  PlayerStatus,
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
  Message,
  JoinRequestResponsePayload,
};
