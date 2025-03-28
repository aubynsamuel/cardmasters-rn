/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const {
  createDeck,
  shuffleDeck,
  dealCardsMultiPlayer,
} = require("./serverFunctions");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Game rooms storage
const gameRooms = new Map();
// Mapping of WebSocket connections to room IDs
const clientRooms = new Map();

// Helper function to send messages to clients
function sendToClient(ws, type, data) {
  ws.send(JSON.stringify({ type, data }));
}

// Helper function to broadcast to all clients in a room except the sender
function broadcastToRoom(roomId, type, data, except = null) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  room.clients.forEach((client) => {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      sendToClient(client, type, data);
    }
  });
}

// Helper function to find an available room or create a new one
function findOrCreateRoom() {
  // Look for a room with only one player
  for (const [roomId, room] of gameRooms.entries()) {
    if (room.clients.length === 1) {
      return roomId;
    }
  }

  // Create a new room if none found
  const roomId = generateRoomId();
  gameRooms.set(roomId, {
    clients: [],
    players: [],
    playerHands: {},
    currentPlays: [],
    currentLeadCard: null,
    currentTurn: null,
    roundsPlayed: 0,
    gameScore: {},
    accumulatedPoints: 0,
    lastPlayedSuit: null,
    gameState: null,
  });

  return roomId;
}

// Generate a random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

// Calculate points for a card
function calculateCardPoints(card) {
  if (card.rank === "6") return 3;
  if (card.rank === "7") return 2;
  return 1; // 8-K
}

// Start a new game in a room
function startGame(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.clients.length !== 2) return;

  // Create and shuffle deck
  let deck = createDeck();
  deck = shuffleDeck(deck);

  // Deal cards
  const gameState = dealCardsMultiPlayer(deck);
  room.gameState = gameState;

  // Assign hands to players
  room.playerHands = {
    [room.players[0].id]: gameState.you,
    [room.players[1].id]: gameState.opponent1,
  };

  // Initialize scores if not already set
  if (!room.gameScore[room.players[0].id]) {
    room.gameScore[room.players[0].id] = 0;
  }
  if (!room.gameScore[room.players[1].id]) {
    room.gameScore[room.players[1].id] = 0;
  }

  // Randomly choose who goes first
  const firstPlayerIndex = Math.floor(Math.random() * 2);
  room.currentTurn = room.players[firstPlayerIndex].id;

  // Reset game state
  room.currentPlays = [];
  room.currentLeadCard = null;
  room.roundsPlayed = 0;
  room.accumulatedPoints = 0;
  room.lastPlayedSuit = null;

  // Notify players that game is starting
  room.clients.forEach((client, index) => {
    const playerId = room.players[index].id;
    const opponentId = room.players[1 - index].id;

    sendToClient(client, "gameStarted", {
      players: room.players,
      yourId: playerId,
      currentTurn: room.currentTurn,
      hand: room.playerHands[playerId],
      opponentCardCount: room.playerHands[opponentId].length,
      score: room.gameScore,
    });
  });
}

// Handle the end of a round
function finishRound(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.currentPlays.length !== 2) return;

  const [firstPlay, secondPlay] = room.currentPlays;
  const leadSuit = room.currentLeadCard.suit;

  let winningPlayerId;
  let pointsEarned = 0;

  // Determine round winner
  if (
    secondPlay.card.suit === leadSuit &&
    secondPlay.card.value > firstPlay.card.value
  ) {
    winningPlayerId = secondPlay.playerId;
  } else {
    winningPlayerId = firstPlay.playerId;
  }

  const winningPlayerName = room.players.find(
    (p) => p.id === winningPlayerId
  ).name;
  const winningCard =
    winningPlayerId === firstPlay.playerId ? firstPlay.card : secondPlay.card;

  // Calculate points
  const isControlTransfer =
    room.currentTurn !== winningPlayerId &&
    (winningCard.rank === "6" || winningCard.rank === "7") &&
    winningCard.suit === leadSuit;

  if (isControlTransfer) {
    pointsEarned = 1;
    room.accumulatedPoints = 0;
  } else if (winningPlayerId === room.currentTurn) {
    const cardPoints = calculateCardPoints(winningCard);

    if (winningCard.rank === "6" || winningCard.rank === "7") {
      if (room.lastPlayedSuit === winningCard.suit) {
        pointsEarned = cardPoints;
        room.accumulatedPoints = pointsEarned;
      } else {
        pointsEarned = cardPoints;
        room.accumulatedPoints += pointsEarned;
      }
    } else {
      pointsEarned = 1;
      room.accumulatedPoints = 0;
    }
  } else {
    pointsEarned = 1;
    room.accumulatedPoints = 0;
  }

  // Update last played suit
  if (winningCard.rank === "6" || winningCard.rank === "7") {
    room.lastPlayedSuit = winningCard.suit;
  }

  // Set next turn
  room.currentTurn = winningPlayerId;

  // Send round result to all players
  broadcastToRoom(roomId, "roundFinished", {
    winner: {
      id: winningPlayerId,
      name: winningPlayerName,
    },
    pointsEarned,
    accumulatedPoints: room.accumulatedPoints,
  });

  // Reset for next round
  room.currentPlays = [];
  room.currentLeadCard = null;
  room.roundsPlayed++;

  // Check if game is over
  if (room.roundsPlayed >= 5) {
    // Add accumulated points to winner's score
    const finalPoints =
      room.accumulatedPoints === 0 ? pointsEarned : room.accumulatedPoints;
    room.gameScore[winningPlayerId] += finalPoints;

    // Check if match is over (first to 5 points)
    const isMatchOver = Object.values(room.gameScore).some(
      (score) => score >= 5
    );

    if (isMatchOver) {
      // Find the winner
      const matchWinnerId = Object.entries(room.gameScore).find(
        ([_, score]) => score >= 5
      )[0];
      const matchWinnerName = room.players.find(
        (p) => p.id === matchWinnerId
      ).name;

      // Send game over notification
      broadcastToRoom(roomId, "gameOver", {
        winner: {
          id: matchWinnerId,
          name: matchWinnerName,
        },
        score: room.gameScore,
      });
    } else {
      // Start a new game
      setTimeout(() => startGame(roomId), 2000);
    }
  } else {
    // Continue to next round
    broadcastToRoom(roomId, "turnChanged", { currentTurn: room.currentTurn });
  }
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const { type, data } = JSON.parse(message);

      switch (type) {
        case "joinGame": {
          const { userId, displayName } = data;
          const roomId = findOrCreateRoom();
          const room = gameRooms.get(roomId);

          // Add client to room
          room.clients.push(ws);
          room.players.push({ id: userId, name: displayName });

          // Store room ID for this client
          clientRooms.set(ws, roomId);

          console.log(`${displayName} (${userId}) joined room ${roomId}`);

          // Notify client they've joined
          sendToClient(ws, "joinedRoom", { roomId });

          // If room is full, start the game
          if (room.clients.length === 2) {
            startGame(roomId);
          } else {
            sendToClient(ws, "waitingForOpponent", {});
          }
          break;
        }

        case "playCard": {
          const { cardIndex } = data;
          const clientRoomId = clientRooms.get(ws);

          if (!clientRoomId) {
            sendToClient(ws, "error", { message: "You're not in a game" });
            return;
          }

          const gameRoom = gameRooms.get(clientRoomId);
          if (!gameRoom) {
            sendToClient(ws, "error", { message: "Game room not found" });
            return;
          }

          // Find player
          const clientIndex = gameRoom.clients.indexOf(ws);
          if (clientIndex === -1) {
            sendToClient(ws, "error", { message: "Player not found in room" });
            return;
          }

          const player = gameRoom.players[clientIndex];

          // Check if it's player's turn
          if (gameRoom.currentTurn !== player.id) {
            sendToClient(ws, "error", { message: "It's not your turn" });
            return;
          }

          // Get the card
          const playerHand = gameRoom.playerHands[player.id];
          if (cardIndex < 0 || cardIndex >= playerHand.length) {
            sendToClient(ws, "error", { message: "Invalid card index" });
            return;
          }

          const card = playerHand[cardIndex];

          // Check if the move is valid (following suit)
          if (
            gameRoom.currentLeadCard &&
            gameRoom.currentLeadCard.suit !== card.suit
          ) {
            // Check if player has the required suit
            const hasSuit = playerHand.some(
              (c) => c.suit === gameRoom.currentLeadCard.suit
            );
            if (hasSuit) {
              sendToClient(ws, "error", {
                message: `You must play a ${gameRoom.currentLeadCard.suit} card if you have one.`,
              });
              return;
            }
          }

          // Remove the card from player's hand
          playerHand.splice(cardIndex, 1);

          // Add to current plays
          gameRoom.currentPlays.push({
            playerId: player.id,
            playerName: player.name,
            card: card,
          });

          // Set lead card if not set
          if (!gameRoom.currentLeadCard) {
            gameRoom.currentLeadCard = card;
          }

          // Broadcast the move to all players
          broadcastToRoom(clientRoomId, "cardPlayed", {
            playerId: player.id,
            playerName: player.name,
            card: card,
            remainingCards: playerHand.length,
          });

          // Check if round is complete
          if (gameRoom.currentPlays.length === 2) {
            setTimeout(() => finishRound(clientRoomId), 1500);
          } else {
            // Switch turns
            const nextPlayerId = gameRoom.players.find(
              (p) => p.id !== player.id
            ).id;
            gameRoom.currentTurn = nextPlayerId;
            broadcastToRoom(clientRoomId, "turnChanged", {
              currentTurn: nextPlayerId,
            });
          }
          break;
        }

        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");

    // Find the room this client was in
    const roomId = clientRooms.get(ws);
    if (roomId && gameRooms.has(roomId)) {
      const room = gameRooms.get(roomId);

      // Find the player
      const clientIndex = room.clients.indexOf(ws);
      if (clientIndex !== -1) {
        const player = room.players[clientIndex];
        console.log(`Player ${player.name} disconnected from room ${roomId}`);

        // Notify other players
        broadcastToRoom(
          roomId,
          "playerDisconnected",
          {
            playerId: player.id,
            playerName: player.name,
          },
          ws
        );

        // Clean up the room
        gameRooms.delete(roomId);
      }

      // Remove client from room mapping
      clientRooms.delete(ws);
    }
  });
});

// Create a simple endpoint to check if server is running
app.get("/", (req, res) => {
  res.send("Game server is running");
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
