import * as http from "http";
import { Server, Socket } from "socket.io";
import { CardsGameState, Callbacks, Player } from "../src/Types";
import {
  CreateRoomPayload,
  JoinRoomPayload,
  LeaveRoomPayload,
  LobbyRoom,
  PlayCardPayload,
  Room,
  StartGamePayload,
} from "./types";

import MultiplayerCardsGame from "../src/gameLogic/MultiplayerGameClass";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*", // Allows all origins for simplicity, restrict in production
    methods: ["GET", "POST"],
  },
});

const rooms: Record<string, Room> = {};
const socketRoomMap: Record<string, string> = {};
const gameInstances: Record<string, MultiplayerCardsGame> = {};

function getLobbyRooms(): LobbyRoom[] {
  return Object.values(rooms).map((room) => ({
    id: room.id,
    name: room.name,
    players: room.players.length,
    maxPlayers: room.maxPlayers,
    status: room.status,
  }));
}

function broadcastLobbyUpdate(): void {
  io.emit("lobby_rooms", getLobbyRooms());
}

function handleDisconnect(socket: Socket): void {
  console.log("User disconnected:", socket.id);
  const roomId = socketRoomMap[socket.id];
  if (roomId && rooms[roomId]) {
    const room = rooms[roomId];
    const playerIndex = room.players.findIndex((p) => p.id === socket.id);

    if (playerIndex !== -1) {
      const leavingPlayer = room.players.splice(playerIndex, 1)[0];
      console.log(
        `${leavingPlayer?.name || "User"} (${socket.id}) left room ${roomId}`
      );

      delete socketRoomMap[socket.id];

      const game = gameInstances[roomId];
      if (game) {
        game.players = room.players;
        console.log("Removed player from game", game.players.length);
      } else console.log("Could not remove player");

      if (room.players.length === 0) {
        console.log(`Room ${roomId} is empty, deleting.`);
        delete rooms[roomId];
        if (gameInstances[roomId]) {
          delete gameInstances[roomId];
        }
      } else {
        // Notify remaining players
        io.to(roomId).emit("player_left", {
          userId: socket.id,
          playerName: leavingPlayer?.name || "User",
          updatedPlayers: room.players,
        });
        console.log("Notified rest of players");

        // Handle ownership transfer if the owner left
        if (room.ownerId === socket.id && room.players.length > 0) {
          room.ownerId = room.players[0].id;
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
  socket.on(
    "create_room",
    ({ playerName, roomName, id }: CreateRoomPayload) => {
      // Prevent user from creating multiple rooms or joining while in another
      if (socketRoomMap[socket.id]) {
        socket.emit("create_error", { message: "You are already in a room." });
        return;
      }

      const roomId = `room_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;

      // Create a new player with the correct structure based on the Player interface
      const newPlayer: Player = {
        id: id || socket.id,
        name: playerName || `Player_${socket.id.substring(0, 4)}`,
        hands: [],
        score: 0,
      };

      const newRoom: Room = {
        id: roomId,
        name: roomName || `${playerName}'s Game`,
        players: [newPlayer],
        maxPlayers: 4,
        status: "waiting",
        ownerId: socket.id,
      };

      rooms[roomId] = newRoom;
      socket.join(roomId);
      socketRoomMap[socket.id] = roomId;

      console.log(`Room ${roomId} created by ${playerName} (${socket.id})`);
      socket.emit("room_created", { roomId: roomId, room: rooms[roomId] });
      broadcastLobbyUpdate();
    }
  );

  // Listener: Join an existing room
  socket.on("join_room", ({ roomId, playerName, id }: JoinRoomPayload) => {
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

      // Create a new joining player with the correct structure
      const joiningPlayer: Player = {
        id: id || socket.id,
        name: playerName || `Player_${socket.id.substring(0, 4)}`,
        hands: [],
        score: 0,
      };

      room.players.push(joiningPlayer);
      socket.join(roomId);
      socketRoomMap[socket.id] = roomId;

      console.log(`${joiningPlayer.name} (${socket.id}) joined room ${roomId}`);

      socket.emit("room_created", { roomId: roomId, room: room });
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

        // Players are already in the correct format with hands and score
        const gamePlayers = room.players;

        // Create a new game instance for this room
        const game = new MultiplayerCardsGame(gamePlayers);

        // Set up callbacks with proper typing
        const callbacks: Callbacks = {
          onStateChange: (newState: CardsGameState) => {
            io.to(roomId).emit("game_state_update", newState);
          },
          onRoundFinished: () => {
            // Optionally, send a round-finished notification
            io.to(roomId).emit("round_finished", {});
          },
        };

        game.setCallbacks(callbacks);

        // Save the game instance for later use
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

  socket.on("game_ended", ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (room.status !== "waiting") {
      room.status = "waiting";
      console.log("Room Has Been Set To Waiting");
    }
  });

  // Listener: Player plays a card
  socket.on(
    "play_card",
    ({ roomId, playerId, card, cardIndex }: PlayCardPayload) => {
      console.log(`Player ${playerId} played card ${card} in room ${roomId}`);
      const game = gameInstances[roomId];
      if (game) {
        // Ensure the player ID matches what's expected in the game (playerId can be string or number)
        const valid = game.playerPlayCard(playerId, card, cardIndex);
        if (valid.error !== "" && valid.message !== "") {
          socket.emit("play_error", { valid });
        }
      } else {
        socket.emit("play_error", {
          valid: {
            error: "Error",
            message: "Game not found.",
          },
        });
      }
    }
  );

  // Listener: Request to reset game
  socket.on("reset_game", ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    const game = gameInstances[roomId];

    if (room && game && room.ownerId === socket.id) {
      game.resetGame();

      // Update room status
      room.status = "waiting";

      // Notify all players
      io.to(roomId).emit("game_reset", { roomId, roomData: room });
      broadcastLobbyUpdate();
    } else if (!room || !game) {
      socket.emit("reset_error", { message: "Room or game not found." });
    } else if (room.ownerId !== socket.id) {
      socket.emit("reset_error", {
        message: "Only the room owner can reset the game.",
      });
    }
  });

  // Listener: Client disconnected
  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`WebSocket server listening on port ${PORT}`)
);
