"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var socket_io_1 = require("socket.io");
var types_1 = require("./types");
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
var pendingJoinRequests = {};
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
        var room_1 = rooms[roomId];
        var playerIndex = room_1.players.findIndex(function (p) { return p.id === socket.id; });
        if (playerIndex !== -1) {
            var leavingPlayer = room_1.players.splice(playerIndex, 1)[0];
            console.log("".concat((leavingPlayer === null || leavingPlayer === void 0 ? void 0 : leavingPlayer.name) || "User", " (").concat(socket.id, ") left room ").concat(roomId));
            delete socketRoomMap[socket.id];
            var game = gameInstances[roomId];
            if (game) {
                game.players = room_1.players;
                console.log("Removed player from game", game.players.length);
            }
            else
                console.log("Could not remove player");
            if (room_1.players.length === 0) {
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
                    updatedPlayers: room_1.players,
                });
                console.log("Notified rest of players");
                // Handle ownership transfer if the owner left
                if (room_1.ownerId === socket.id && room_1.players.length > 0) {
                    room_1.ownerId = room_1.players[0].id;
                    var roomOwnerIndex = room_1.players.findIndex(function (p) { return p.id === room_1.ownerId; });
                    room_1.players[roomOwnerIndex].status = types_1.PlayerStatus.READY;
                    console.log("Ownership of room ".concat(roomId, " transferred to ").concat(room_1.players[0].name, " (").concat(room_1.ownerId, ")"));
                    io.to(roomId).emit("owner_changed", {
                        newOwnerId: room_1.ownerId,
                        updatedPlayers: room_1.players,
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
    // Clean up any pending join requests from this socket
    Object.keys(pendingJoinRequests).forEach(function (requestId) {
        if (pendingJoinRequests[requestId].userId === socket.id) {
            clearTimeout(pendingJoinRequests[requestId].timeoutId);
            delete pendingJoinRequests[requestId];
        }
    });
}
function updatePlayerStatus(socket, roomId, playerId, newStatus, forceUpdate) {
    if (forceUpdate === void 0) { forceUpdate = false; }
    var room = rooms[roomId];
    if (!room) {
        socket.emit("status_error", { message: "Room not found." });
        return false;
    }
    var playerIndex = room.players.findIndex(function (p) { return p.id === playerId; });
    if (playerIndex === -1) {
        socket.emit("status_error", { message: "Player not found in room." });
        return false;
    }
    // Check if room owner is trying to change status away from READY
    if (playerId === room.ownerId &&
        newStatus !== types_1.PlayerStatus.READY &&
        newStatus !== types_1.PlayerStatus.IN_GAME &&
        !forceUpdate) {
        socket.emit("status_error", { message: "Room owner is always ready." });
        return false;
    }
    // Update player status
    var previousStatus = room.players[playerIndex].status;
    room.players[playerIndex].status = newStatus;
    console.log("Player ".concat(room.players[playerIndex].name, " status changed from ").concat(previousStatus, " to ").concat(newStatus));
    // Notify all players in the room about status change
    io.to(roomId).emit("player_status_changed", {
        userId: playerId,
        playerName: room.players[playerIndex].name,
        newStatus: newStatus,
        updatedPlayers: room.players,
    });
    return true;
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
    socket.on("get_room", function (_a) {
        var roomId = _a.roomId;
        var room = rooms[roomId];
        io.to(roomId).emit("get_room_response", { room: room });
    });
    socket.on("update_player_status", function (_a) {
        var roomId = _a.roomId, status = _a.status;
        if (socketRoomMap[socket.id] !== roomId) {
            socket.emit("status_error", { message: "Not in the specified room." });
            return;
        }
        updatePlayerStatus(socket, roomId, socket.id, status);
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
            status: types_1.PlayerStatus.READY, // Owner is automatically ready
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
    // Listener: Request to join a room
    socket.on("request_join_room", function (_a) {
        var roomId = _a.roomId, playerName = _a.playerName, id = _a.id;
        if (socketRoomMap[socket.id]) {
            socket.emit("join_error", { message: "You are already in a room." });
            return;
        }
        var room = rooms[roomId];
        if (!room) {
            socket.emit("join_error", { message: "Room not found" });
            return;
        }
        if (room.status !== "waiting" || room.players.length >= room.maxPlayers) {
            socket.emit("join_error", { message: "Room not available or full" });
            return;
        }
        // Create a unique request ID
        var requestId = "req_".concat(Date.now(), "_").concat(Math.random()
            .toString(36)
            .substring(2, 7));
        // Send join request to room owner
        io.to(room.ownerId).emit("join_request", {
            requestId: requestId,
            userId: socket.id,
            playerName: playerName || "Player_".concat(socket.id.substring(0, 4)),
        });
        // Set a timeout for auto-rejection after 5 seconds
        var timeoutId = setTimeout(function () {
            if (pendingJoinRequests[requestId]) {
                // Auto-reject if owner hasn't responded
                socket.emit("join_request_response", {
                    accepted: false,
                    requestId: requestId,
                    message: "Request to join ".concat(room.name, " timed out"),
                });
                delete pendingJoinRequests[requestId];
            }
        }, 5000);
        // Store the request
        pendingJoinRequests[requestId] = {
            requestId: requestId,
            playerName: playerName || "Player_".concat(socket.id.substring(0, 4)),
            roomId: roomId,
            userId: id || socket.id,
            timeoutId: timeoutId,
        };
        console.log("Join request ".concat(requestId, " sent to room owner for ").concat(roomId));
    });
    // Listener: Owner responds to join request
    socket.on("respond_to_join_request", function (_a) {
        var requestId = _a.requestId, accepted = _a.accepted;
        var request = pendingJoinRequests[requestId];
        if (!request) {
            socket.emit("response_error", {
                message: "Join request not found or expired",
            });
            return;
        }
        var room = rooms[request.roomId];
        // Verify that the responder is the room owner
        if (room && room.ownerId === socket.id) {
            clearTimeout(request.timeoutId);
            var userSocket = io.sockets.sockets.get(request.userId);
            if (!userSocket) {
                socket.emit("response_error", {
                    message: "Requesting user disconnected",
                });
                delete pendingJoinRequests[requestId];
                return;
            }
            if (accepted) {
                // Create a new joining player with the correct structure
                var joiningPlayer = {
                    id: request.userId,
                    name: request.playerName,
                    hands: [],
                    score: 0,
                    status: types_1.PlayerStatus.NOT_READY, // New players start not ready
                };
                room.players.push(joiningPlayer);
                userSocket.join(request.roomId);
                socketRoomMap[request.userId] = request.roomId;
                console.log("".concat(joiningPlayer.name, " (").concat(request.userId, ") joined room ").concat(request.roomId));
                userSocket.emit("room_created", {
                    roomId: request.roomId,
                    room: room,
                });
                io.to(request.roomId).emit("player_joined", {
                    userId: request.userId,
                    playerName: joiningPlayer.name,
                    updatedPlayers: room.players,
                });
                // Notify the requesting user of acceptance
                userSocket.emit("join_request_response", {
                    accepted: true,
                    requestId: requestId,
                    message: "Request accepted",
                    roomId: request.roomId,
                    roomData: room,
                });
                broadcastLobbyUpdate();
            }
            else {
                // Notify the requesting user of rejection
                userSocket.emit("join_request_response", {
                    accepted: false,
                    requestId: requestId,
                    message: "Request to join ".concat(room.name, " declined"),
                });
            }
            delete pendingJoinRequests[requestId];
        }
        else {
            socket.emit("response_error", {
                message: "Only the room owner can accept or reject join requests",
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
        var roomId = _a.roomId, gameTo = _a.gameTo;
        var room = rooms[roomId];
        if (room && room.ownerId === socket.id && room.status === "waiting") {
            if (room.players.length >= 2 && room.players.length <= 4) {
                // Check if all players are ready
                var allPlayersReady = room.players.every(function (player) {
                    return player.status === types_1.PlayerStatus.READY || player.id === room.ownerId;
                });
                if (!allPlayersReady) {
                    socket.emit("start_error", {
                        message: "Cannot start game until all players are ready",
                    });
                    return;
                }
                room.status = "playing";
                console.log("Game starting in room ".concat(roomId));
                // Update player statuses to IN_GAME
                room.players.forEach(function (player) {
                    updatePlayerStatus(socket, roomId, player.id, types_1.PlayerStatus.IN_GAME, true);
                });
                // Players are already in the correct format with hands and score
                var gamePlayers = room.players;
                // Create a new game instance for this room
                var game = new MultiplayerGameClass_1.default(gamePlayers, gameTo);
                // Set up callbacks with proper typing
                var callbacks = {
                    onStateChange: function (newState) {
                        io.to(roomId).emit("game_state_update", newState);
                    },
                    onRoundFinished: function () { },
                };
                game.setCallbacks(callbacks);
                gameInstances[roomId] = game;
                game.startGame();
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
        if (room && room.status !== "waiting") {
            room.status = "waiting";
            // Reset all player statuses to NOT_READY except owner
            room.players.forEach(function (player) {
                var newStatus = player.id === room.ownerId
                    ? types_1.PlayerStatus.READY
                    : types_1.PlayerStatus.NOT_READY;
                updatePlayerStatus(socket, roomId, player.id, newStatus, true);
            });
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
