"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var socket_io_1 = require("socket.io");
var MultiplayerGameClass_1 = require("../src/gameLogic/MultiplayerGameClass");
var server = http.createServer();
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Allows all origins for simplicity, restrict in production
        methods: ["GET", "POST"],
    },
});
var rooms = {};
var socketRoomMap = {};
var gameInstances = {};
function getLobbyRooms() {
    return Object.values(rooms).map(function (room) { return ({
        id: room.id,
        name: room.name,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
    }); });
}
function broadcastLobbyUpdate() {
    io.emit("lobby_rooms", getLobbyRooms());
}
function handleDisconnect(socket) {
    console.log("User disconnected:", socket.id);
    var roomId = socketRoomMap[socket.id];
    if (roomId && rooms[roomId]) {
        var room = rooms[roomId];
        var playerIndex = room.players.findIndex(function (p) { return p.id === socket.id; });
        if (playerIndex !== -1) {
            var leavingPlayer = room.players.splice(playerIndex, 1)[0];
            console.log("".concat((leavingPlayer === null || leavingPlayer === void 0 ? void 0 : leavingPlayer.name) || "User", " (").concat(socket.id, ") left room ").concat(roomId));
            delete socketRoomMap[socket.id];
            var game = gameInstances[roomId];
            if (game) {
                game.players = room.players;
                console.log("Removed player from game", game.players.length);
            }
            else
                console.log("Could not remove player");
            if (room.players.length === 0) {
                console.log("Room ".concat(roomId, " is empty, deleting."));
                delete rooms[roomId];
                if (gameInstances[roomId]) {
                    delete gameInstances[roomId];
                }
            }
            else {
                // Notify remaining players
                io.to(roomId).emit("player_left", {
                    userId: socket.id,
                    playerName: (leavingPlayer === null || leavingPlayer === void 0 ? void 0 : leavingPlayer.name) || "User",
                    updatedPlayers: room.players,
                });
                console.log("Notified rest of players");
                // Handle ownership transfer if the owner left
                if (room.ownerId === socket.id && room.players.length > 0) {
                    room.ownerId = room.players[0].id;
                    console.log("Ownership of room ".concat(roomId, " transferred to ").concat(room.players[0].name, " (").concat(room.ownerId, ")"));
                    io.to(roomId).emit("owner_changed", {
                        newOwnerId: room.ownerId,
                        updatedPlayers: room.players,
                    });
                }
            }
            // Update the lobby regardless (player count changed or room removed)
            broadcastLobbyUpdate();
        }
    }
    else {
        console.log("Socket ".concat(socket.id, " was not in a tracked room."));
    }
}
// --- Socket Event Listeners ---
io.on("connection", function (socket) {
    console.log("A user connected:", socket.id);
    // Send initial list of rooms to the newly connected client
    socket.emit("lobby_rooms", getLobbyRooms());
    // Listener: Handle request for updated lobby rooms (for refresh)
    socket.on("request_lobby_rooms", function () {
        socket.emit("lobby_rooms", getLobbyRooms());
    });
    // Listener: Create a new room
    socket.on("create_room", function (_a) {
        var playerName = _a.playerName, roomName = _a.roomName, id = _a.id;
        // Prevent user from creating multiple rooms or joining while in another
        if (socketRoomMap[socket.id]) {
            socket.emit("create_error", { message: "You are already in a room." });
            return;
        }
        var roomId = "room_".concat(Date.now(), "_").concat(Math.random()
            .toString(36)
            .substring(2, 7));
        // Create a new player with the correct structure based on the Player interface
        var newPlayer = {
            id: id || socket.id,
            name: playerName || "Player_".concat(socket.id.substring(0, 4)),
            hands: [],
            score: 0,
        };
        var newRoom = {
            id: roomId,
            name: roomName || "".concat(playerName, "'s Game"),
            players: [newPlayer],
            maxPlayers: 4,
            status: "waiting",
            ownerId: socket.id,
        };
        rooms[roomId] = newRoom;
        socket.join(roomId);
        socketRoomMap[socket.id] = roomId;
        console.log("Room ".concat(roomId, " created by ").concat(playerName, " (").concat(socket.id, ")"));
        socket.emit("room_created", { roomId: roomId, room: rooms[roomId] });
        broadcastLobbyUpdate();
    });
    // Listener: Join an existing room
    socket.on("join_room", function (_a) {
        var roomId = _a.roomId, playerName = _a.playerName, id = _a.id;
        if (socketRoomMap[socket.id]) {
            socket.emit("join_error", { message: "You are already in a room." });
            return;
        }
        var room = rooms[roomId];
        if (room &&
            room.status === "waiting" &&
            room.players.length < room.maxPlayers) {
            if (room.players.some(function (p) { return p.id === socket.id; })) {
                socket.emit("join_error", { message: "Already in this room" });
                return;
            }
            // Create a new joining player with the correct structure
            var joiningPlayer = {
                id: id || socket.id,
                name: playerName || "Player_".concat(socket.id.substring(0, 4)),
                hands: [],
                score: 0,
            };
            room.players.push(joiningPlayer);
            socket.join(roomId);
            socketRoomMap[socket.id] = roomId;
            console.log("".concat(joiningPlayer.name, " (").concat(socket.id, ") joined room ").concat(roomId));
            socket.emit("room_created", { roomId: roomId, room: room });
            socket.to(roomId).emit("player_joined", {
                userId: socket.id,
                playerName: joiningPlayer.name,
                updatedPlayers: room.players,
            });
            broadcastLobbyUpdate();
        }
        else {
            socket.emit("join_error", {
                message: room ? "Room not available or full" : "Room not found",
            });
        }
    });
    // Listener: Leave a room
    socket.on("leave_room", function (_a) {
        var roomId = _a.roomId;
        if (socketRoomMap[socket.id] === roomId && rooms[roomId]) {
            handleDisconnect(socket);
        }
        else {
            socket.emit("leave_error", { message: "Not in the specified room." });
        }
    });
    // Listener: Start the game (only owner can start)
    socket.on("start_game", function (_a) {
        var roomId = _a.roomId;
        var room = rooms[roomId];
        if (room && room.ownerId === socket.id && room.status === "waiting") {
            if (room.players.length >= 2 && room.players.length <= 4) {
                room.status = "playing";
                console.log("Game starting in room ".concat(roomId));
                // Players are already in the correct format with hands and score
                var gamePlayers = room.players;
                // Create a new game instance for this room
                var game = new MultiplayerGameClass_1.default(gamePlayers);
                // Set up callbacks with proper typing
                var callbacks = {
                    onStateChange: function (newState) {
                        io.to(roomId).emit("game_state_update", newState);
                    },
                    onRoundFinished: function () {
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
                io.to(roomId).emit("game_started", { roomId: roomId, roomData: room });
                broadcastLobbyUpdate();
            }
            else {
                socket.emit("start_error", {
                    message: "Incorrect number of players (".concat(room.players.length, "). Must be 2-4."),
                });
            }
        }
        else if (!room) {
            socket.emit("start_error", { message: "Room does not exist." });
        }
        else if (room.ownerId !== socket.id) {
            socket.emit("start_error", {
                message: "Only the room owner can start the game.",
            });
        }
        else if (room.status !== "waiting") {
            socket.emit("start_error", {
                message: "Game cannot be started (already playing or finished).",
            });
        }
    });
    socket.on("game_ended", function (_a) {
        var roomId = _a.roomId;
        var room = rooms[roomId];
        if (room.status !== "waiting") {
            room.status = "waiting";
            console.log("Room Has Been Set To Waiting");
        }
    });
    // Listener: Player plays a card
    socket.on("play_card", function (_a) {
        var roomId = _a.roomId, playerId = _a.playerId, card = _a.card, cardIndex = _a.cardIndex;
        console.log("Player ".concat(playerId, " played card ").concat(card, " in room ").concat(roomId));
        var game = gameInstances[roomId];
        if (game) {
            // Ensure the player ID matches what's expected in the game (playerId can be string or number)
            var valid = game.playerPlayCard(playerId, card, cardIndex);
            if (valid.error !== "" && valid.message !== "") {
                socket.emit("play_error", { valid: valid });
            }
        }
        else {
            socket.emit("play_error", {
                valid: {
                    error: "Error",
                    message: "Game not found.",
                },
            });
        }
    });
    // Listener: Request to reset game
    socket.on("reset_game", function (_a) {
        var roomId = _a.roomId;
        var room = rooms[roomId];
        var game = gameInstances[roomId];
        if (room && game && room.ownerId === socket.id) {
            game.resetGame();
            // Update room status
            room.status = "waiting";
            // Notify all players
            io.to(roomId).emit("game_reset", { roomId: roomId, roomData: room });
            broadcastLobbyUpdate();
        }
        else if (!room || !game) {
            socket.emit("reset_error", { message: "Room or game not found." });
        }
        else if (room.ownerId !== socket.id) {
            socket.emit("reset_error", {
                message: "Only the room owner can reset the game.",
            });
        }
    });
    // Listener: Client disconnected
    socket.on("disconnect", function () {
        handleDisconnect(socket);
    });
});
// Start the server
var PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    return console.log("WebSocket server listening on port ".concat(PORT));
});
