import http from "http";
import { Server, Socket } from "socket.io";
import { CardsGameState, Callbacks, Card, Player } from "../src/Types";

// Import the game class (adjust the path as needed)
import MultiplayerCardsGame from "./MultiplayerGameClass";

interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  ownerId: string;
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
}

interface JoinRoomPayload {
  roomId: string;
  playerName: string;
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

// Basic server setup - you might integrate this with Express etc. if needed
const server = http.createServer();

// Initialize Socket.IO Server with CORS configuration
// Adjust origin for production!
const io = new Server(server, {
  cors: {
    origin: "*", // Allows all origins for simplicity, restrict in production
    methods: ["GET", "POST"],
  },
});

// In-memory storage for rooms. Consider a database for persistence.
const rooms: Record<string, Room> = {};
// Keep track of which room each socket is in for easier cleanup on disconnect
const socketRoomMap: Record<string, string> = {}; // { socketId: roomId }

// Store game instances keyed by roomId
const gameInstances: Record<string, CardsGameState> = {};

// --- Helper Functions ---

// Get rooms suitable for the lobby (waiting and not full)
function getLobbyRooms(): LobbyRoom[] {
  return Object.values(rooms)
    .filter((room) => room.status === "waiting") // Only show waiting rooms
    .map((room) => ({
      id: room.id,
      name: room.name,
      players: room.players.length, // Send player count
      maxPlayers: room.maxPlayers,
      status: room.status,
      // Add any other info needed for the lobby list item
    }));
}

// Broadcast updated lobby room list to all connected clients
function broadcastLobbyUpdate(): void {
  io.emit("lobby_rooms", getLobbyRooms());
  // console.log('Lobby updated:', getLobbyRooms()); // For debugging
}

// Handle player disconnection
function handleDisconnect(socket: Socket): void {
  console.log("User disconnected:", socket.id);
  const roomId = socketRoomMap[socket.id]; // Find which room the socket was in

  if (roomId && rooms[roomId]) {
    const room = rooms[roomId];
    const playerIndex = room.players.findIndex((p) => p.id === socket.id);

    if (playerIndex !== -1) {
      const leavingPlayer = room.players.splice(playerIndex, 1)[0];
      console.log(
        `${leavingPlayer?.name || "User"} (${socket.id}) left room ${roomId}`
      );

      // Remove the socket mapping
      delete socketRoomMap[socket.id];

      // If the room is now empty, delete it and its game instance if any.
      if (room.players.length === 0 && room.status !== "playing") {
        console.log(`Room ${roomId} is empty, deleting.`);
        delete rooms[roomId];
        if (gameInstances[roomId]) {
          delete gameInstances[roomId];
        }
      } else {
        // Notify remaining players
        io.to(roomId).emit("player_left", {
          userId: socket.id,
          playerName: leavingPlayer?.name || "User", // Send name if available
          updatedPlayers: room.players, // Send updated list
        });

        // Handle ownership transfer if the owner left
        if (room.ownerId === socket.id && room.players.length > 0) {
          room.ownerId = room.players[0].id; // Assign to the next player
          console.log(
            `Ownership of room ${roomId} transferred to ${room.players[0].name} (${room.ownerId})`
          );
          io.to(roomId).emit("owner_changed", {
            newOwnerId: room.ownerId,
            updatedPlayers: room.players,
          });
        }
      }
      // Update the lobby regardless (player count changed or room removed)
      broadcastLobbyUpdate();
    }
  } else {
    console.log(`Socket ${socket.id} was not in a tracked room.`);
  }
}

// --- Socket Event Listeners ---

io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  // Send initial list of rooms to the newly connected client
  socket.emit("lobby_rooms", getLobbyRooms());

  // Listener: Handle request for updated lobby rooms (for refresh)
  socket.on("request_lobby_rooms", () => {
    socket.emit("lobby_rooms", getLobbyRooms());
  });

  // Listener: Create a new room
  socket.on("create_room", ({ playerName, roomName }: CreateRoomPayload) => {
    // Prevent user from creating multiple rooms or joining while in another
    if (socketRoomMap[socket.id]) {
      socket.emit("create_error", { message: "You are already in a room." });
      return;
    }

    const roomId = `room_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    const newRoom: Room = {
      id: roomId,
      name: roomName || `${playerName}'s Game`,
      players: [
        {
          id: socket.id,
          name: playerName || `Player_${socket.id.substring(0, 4)}`,
        },
      ],
      maxPlayers: 4,
      status: "waiting",
      ownerId: socket.id,
    };
    rooms[roomId] = newRoom;
    socket.join(roomId);
    socketRoomMap[socket.id] = roomId;

    console.log(`Room ${roomId} created by ${playerName} (${socket.id})`);
    socket.emit("room_joined", { roomId: roomId, room: rooms[roomId] });
    broadcastLobbyUpdate();
  });

  // Listener: Join an existing room
  socket.on("join_room", ({ roomId, playerName }: JoinRoomPayload) => {
    if (socketRoomMap[socket.id]) {
      socket.emit("join_error", { message: "You are already in a room." });
      return;
    }

    const room = rooms[roomId];
    if (
      room &&
      room.status === "waiting" &&
      room.players.length < room.maxPlayers
    ) {
      if (room.players.some((p) => p.id === socket.id)) {
        socket.emit("join_error", { message: "Already in this room" });
        return;
      }

      const joiningPlayer: RoomPlayer = {
        id: socket.id,
        name: playerName || `Player_${socket.id.substring(0, 4)}`,
      };
      room.players.push(joiningPlayer);
      socket.join(roomId);
      socketRoomMap[socket.id] = roomId;

      console.log(`${joiningPlayer.name} (${socket.id}) joined room ${roomId}`);

      socket.emit("room_joined", { roomId: roomId, room: room });
      socket.to(roomId).emit("player_joined", {
        userId: socket.id,
        playerName: joiningPlayer.name,
        updatedPlayers: room.players,
      });
      broadcastLobbyUpdate();
    } else {
      socket.emit("join_error", {
        message: room ? "Room not available or full" : "Room not found",
      });
    }
  });

  // Listener: Leave a room
  socket.on("leave_room", ({ roomId }: LeaveRoomPayload) => {
    if (socketRoomMap[socket.id] === roomId && rooms[roomId]) {
      handleDisconnect(socket);
    } else {
      socket.emit("leave_error", { message: "Not in the specified room." });
    }
  });

  // Listener: Start the game (only owner can start)
  socket.on("start_game", ({ roomId }: StartGamePayload) => {
    const room = rooms[roomId];
    if (room && room.ownerId === socket.id && room.status === "waiting") {
      if (room.players.length >= 2 && room.players.length <= 4) {
        room.status = "playing";
        console.log(`Game starting in room ${roomId}`);

        // Convert room players to game players
        const gamePlayers = room.players.map((p) => ({
          id: p.id,
          name: p.name,
          hands: [] as Card[],
          score: 0,
        }));

        // Create a new game instance for this room.
        const game = new MultiplayerCardsGame(gamePlayers);

        // Set up callbacks with proper typing
        const callbacks: Callbacks = {
          onStateChange: (newState: CardsGameState) => {
            io.to(roomId).emit("game_state_update", newState);
          },
          onRoundFinished: () => {
            // Optionally, send a round-finished notification.
            io.to(roomId).emit("round_finished", {});
          },
        };

        game.setCallbacks(callbacks);

        // Save the game instance for later use (e.g., handling card plays)
        gameInstances[roomId] = game;

        // Start the game. The game will broadcast its initial state via onStateChange.
        game.startGame();

        // Send a game_started event to all players in the room
        io.to(roomId).emit("game_started", { roomId, roomData: room });

        broadcastLobbyUpdate();
      } else {
        socket.emit("start_error", {
          message: `Incorrect number of players (${room.players.length}). Must be 2-4.`,
        });
      }
    } else if (!room) {
      socket.emit("start_error", { message: "Room does not exist." });
    } else if (room.ownerId !== socket.id) {
      socket.emit("start_error", {
        message: "Only the room owner can start the game.",
      });
    } else if (room.status !== "waiting") {
      socket.emit("start_error", {
        message: "Game cannot be started (already playing or finished).",
      });
    }
  });

  // Listener: Player plays a card
  socket.on(
    "play_card",
    ({ roomId, playerId, card, cardIndex }: PlayCardPayload) => {
      const game = gameInstances[roomId];
      if (game) {
        const valid = game.playerPlayCard(playerId, card, cardIndex);
        if (!valid) {
          socket.emit("play_error", { message: "Invalid card play." });
        }
      } else {
        socket.emit("play_error", { message: "Game not found." });
      }
    }
  );

  // Listener: Client disconnected
  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });

  // --- Additional game actions can be added here later ---
});

// Start the server
const PORT = 3000;
server.listen(PORT, () =>
  console.log(`WebSocket server listening on port ${PORT}`)
);
