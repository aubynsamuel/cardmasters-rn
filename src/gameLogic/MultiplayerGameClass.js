"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var GameUtils_1 = require("./GameUtils");
var MultiplayerCardsGame = /** @class */ (function () {
    function MultiplayerCardsGame(players, gameTo) {
        if (players.length < 2) {
            throw new Error("Game requires at least 2 players");
        }
        this.players = players;
        this.currentPlays = [];
        this.currentLeadCard = null;
        this.currentCard = null;
        this.cardsPlayed = 0;
        this.message = "";
        this.gameOver = false;
        this.gameHistory = [];
        this.showStartButton = true;
        this.isShuffling = false;
        this.isDealing = false;
        this.accumulatedPoints = 0;
        this.lastPlayedSuit = null;
        this.currentControl = players[0];
        this.deck = [];
        this.callbacks = {
            onStateChange: function () { },
            onRoundFinished: function () { },
        };
        this.gameOverData = {
            winner: this.players[0],
            score: [],
            isCurrentPlayer: false,
            isMultiPlayer: true,
        };
        this.gameTo = gameTo;
    }
    // Register callbacks from the React component/websocket server
    MultiplayerCardsGame.prototype.setCallbacks = function (callbacks) {
        this.callbacks = __assign(__assign({}, this.callbacks), callbacks);
    };
    // Get current UI state for React component/websocket server
    MultiplayerCardsGame.prototype.getState = function () {
        return {
            players: this.players,
            currentPlays: this.currentPlays,
            currentLeadCard: this.currentLeadCard,
            cardsPlayed: this.cardsPlayed,
            message: this.message,
            gameOver: this.gameOver,
            gameHistory: this.gameHistory,
            showStartButton: this.showStartButton,
            isShuffling: this.isShuffling,
            isDealing: this.isDealing,
            accumulatedPoints: this.accumulatedPoints,
            lastPlayedSuit: this.lastPlayedSuit,
            currentControl: this.currentControl,
            deck: this.deck,
            gameOverData: this.gameOverData,
            gameTo: this.gameTo,
        };
    };
    // Update state and notify React component/websocket server
    MultiplayerCardsGame.prototype.updateState = function (newState) {
        Object.assign(this, newState);
        this.callbacks.onStateChange(this.getState());
    };
    MultiplayerCardsGame.prototype.handleGameState = function () {
        // Calculate minimum cards needed for all players
        var minCardsNeeded = this.players.length * 5;
        if (!this.deck || this.deck.length < minCardsNeeded) {
            var newDeck = (0, GameUtils_1.createDeck)();
            newDeck = (0, GameUtils_1.shuffleDeck)(newDeck);
            this.deck = newDeck;
        }
        var _a = (0, GameUtils_1.dealCards)(this.players, this.deck), hands = _a.hands, deck = _a.deck;
        this.deck = deck;
        var updatedPlayers = this.players.map(function (player, idx) { return (__assign(__assign({}, player), { hands: hands[idx] })); });
        this.players = updatedPlayers;
    };
    MultiplayerCardsGame.prototype.startGame = function () {
        var _this = this;
        var needsShuffle = !this.deck || this.deck.length < this.players.length * 5;
        this.updateState({
            cardsPlayed: 0,
            currentLeadCard: null,
            currentPlays: [],
            message: needsShuffle ? "Shuffling cards..." : "",
            gameOver: false,
            showStartButton: false,
            gameHistory: [],
            isShuffling: needsShuffle,
            accumulatedPoints: 0,
            lastPlayedSuit: null,
        });
        // Show the shuffling animation for 2 seconds
        setTimeout(function () {
            _this.updateState({
                isShuffling: false,
                message: "Dealing cards...",
            });
            _this.handleGameState();
            _this.updateState({ isDealing: true });
            // Deal cards with animation
            setTimeout(function () {
                // End dealing animation after cards are shown
                setTimeout(function () {
                    // Inform that it's the currentControl's turn to start the round.
                    _this.updateState({
                        isDealing: false,
                        message: "".concat(_this.currentControl.name, " will play first"),
                    });
                }, 1000);
            }, 1000);
        }, needsShuffle ? 2000 : 50);
    };
    /**
     * - If no card has been played in the round (currentPlays is empty),
     *   only the currentControl is allowed to play.
     * - Once currentControl has played, any player who has not yet played this round is allowed.
     * - A player is prevented from playing more than once in the same round.
     */
    MultiplayerCardsGame.prototype.playerPlayCard = function (playerId, card, index) {
        var _this = this;
        if (this.gameOver) {
            return { error: "Game is over", message: " No more plays allowed." };
        }
        // Determine which player is attempting the play.
        var playerIndex = this.players.findIndex(function (p) { return p.id === playerId; });
        if (playerIndex === -1) {
            return { error: "Error", message: "Player not found." };
        }
        // If no one has played this round, only currentControl can play.
        if (this.currentPlays.length === 0 && this.currentControl.id !== playerId) {
            // Optionally: trigger an alert that only the round leader may start.
            return {
                error: "Error",
                message: "Only the round leader can play first.",
            };
        }
        // If this player has already played this round, disallow double play.
        if (this.currentPlays.some(function (play) { return play.player.id === playerId; })) {
            // Optionally: trigger an alert that they've already played.
            return {
                error: "Error",
                message: "You have already played in this round.",
            };
        }
        // Enforce following suit if necessary.
        if (this.currentLeadCard) {
            var requiredSuit_1 = this.currentLeadCard.suit;
            var hasRequired = this.players[playerIndex].hands.some(function (c) { return c.suit === requiredSuit_1; });
            if (hasRequired && card.suit !== requiredSuit_1) {
                // Optionally: trigger an alert that they must play the required suit.
                return {
                    error: "Invalid Move",
                    message: "You must play a ".concat(requiredSuit_1, " card if you have one."),
                };
            }
        }
        // Remove the card from the player's hand.
        var updatedPlayers = __spreadArray([], this.players, true);
        var newHand = __spreadArray([], updatedPlayers[playerIndex].hands, true);
        newHand.splice(index, 1);
        updatedPlayers[playerIndex] = __assign(__assign({}, updatedPlayers[playerIndex]), { hands: newHand });
        this.updateState({ players: updatedPlayers });
        // Delay slightly to simulate play action.
        setTimeout(function () {
            _this.playCard(_this.players[playerIndex], card);
        }, 300);
        return { error: "", message: "" };
    };
    /**
     * Registers a played card.
     * After currentControl’s card is played (i.e. when currentPlays was empty),
     * any subsequent player can play once until all players have played.
     */
    MultiplayerCardsGame.prototype.playCard = function (player, card) {
        var newPlays = __spreadArray(__spreadArray([], this.currentPlays, true), [{ player: player, card: card }], false);
        var newLeadCard = this.currentPlays.length === 0 ? card : this.currentLeadCard;
        var newHistory = __spreadArray(__spreadArray([], this.gameHistory, true), [
            {
                message: "".concat(player.name, " played ").concat(card.rank).concat(GameUtils_1.suitSymbols[card.suit]),
                importance: false,
            },
        ], false);
        this.updateState({
            currentPlays: newPlays,
            currentLeadCard: newLeadCard,
            gameHistory: newHistory,
        });
        // If all players have played, finish the round.
        if (newPlays.length === this.players.length) {
            this.finishRound();
        }
        else {
            // We no longer enforce a strict next-player turn order.
            // The UI should simply allow any player who hasn't played to make a move.
            this.updateState({
                message: "Waiting for opponents to play...",
            });
        }
    };
    MultiplayerCardsGame.prototype.calculateCardPoints = function (card) {
        if (card.rank === "6")
            return 3;
        if (card.rank === "7")
            return 2;
        return 1; // For ranks 8-K
    };
    MultiplayerCardsGame.prototype.resetRound = function () {
        this.updateState({
            currentLeadCard: null,
            currentPlays: [],
        });
    };
    MultiplayerCardsGame.prototype.finishRound = function () {
        var _this = this;
        if (this.currentPlays.length === 0 || !this.currentLeadCard) {
            return;
        }
        var leadSuit = this.currentLeadCard.suit;
        // Determine the winning play among plays that follow the lead suit.
        var winningPlayIndex = 0;
        var highestValue = this.currentPlays[0].card.value;
        for (var i = 1; i < this.currentPlays.length; i++) {
            var play = this.currentPlays[i];
            // Only compare cards of the lead suit.
            if (play.card.suit === leadSuit && play.card.value > highestValue) {
                winningPlayIndex = i;
                highestValue = play.card.value;
            }
        }
        var winningPlay = this.currentPlays[winningPlayIndex];
        var winningPlayer = winningPlay.player;
        var winningCard = winningPlay.card;
        // Set currentControl for the next round.
        var newControl = winningPlayer;
        var resultMessage = "".concat(winningPlayer.name, " wins the round.");
        var newAccumulatedPoints = this.accumulatedPoints;
        var newLastPlayedSuit = this.lastPlayedSuit;
        var pointsEarned = 0;
        if (this.currentControl.id !== newControl.id) {
            newAccumulatedPoints = 0;
            newLastPlayedSuit = null;
        }
        var isControlTransfer = this.currentControl.id !== newControl.id &&
            (winningCard.rank === "6" || winningCard.rank === "7") &&
            winningCard.suit === leadSuit;
        if (isControlTransfer) {
            pointsEarned = 1;
            newAccumulatedPoints = 0;
        }
        else if (newControl.id === this.currentControl.id) {
            var cardPoints = this.calculateCardPoints(winningCard);
            if (winningCard.rank === "6" || winningCard.rank === "7") {
                if (this.lastPlayedSuit === winningCard.suit) {
                    pointsEarned = cardPoints;
                    newAccumulatedPoints = pointsEarned;
                }
                else {
                    pointsEarned = cardPoints;
                    newAccumulatedPoints = this.accumulatedPoints + pointsEarned;
                }
            }
            else {
                pointsEarned = 1;
                newAccumulatedPoints = 0;
            }
        }
        else {
            pointsEarned = 1;
            newAccumulatedPoints = 0;
        }
        if (winningCard.rank === "6" || winningCard.rank === "7") {
            newLastPlayedSuit = winningCard.suit;
        }
        var newHistory = __spreadArray(__spreadArray([], this.gameHistory, true), [
            {
                message: "".concat(newControl.name, " Won Round ").concat(this.cardsPlayed + 1),
                importance: true,
            },
        ], false);
        this.updateState({
            currentControl: newControl,
            message: resultMessage,
            gameHistory: newHistory,
            accumulatedPoints: newAccumulatedPoints,
            lastPlayedSuit: newLastPlayedSuit,
        });
        setTimeout(function () {
            _this.resetRound();
            var newRoundsPlayed = _this.cardsPlayed + 1;
            _this.updateState({
                cardsPlayed: newRoundsPlayed > 5 ? 5 : newRoundsPlayed,
            });
            if (newRoundsPlayed >= 5) {
                _this.handleGameOver(newControl, newAccumulatedPoints, pointsEarned);
            }
            else {
                // In the next round, currentControl must start.
                _this.updateState({
                    message: "".concat(_this.currentControl.name, " will play first"),
                });
            }
        }, 1500);
    };
    MultiplayerCardsGame.prototype.handleGameOver = function (newControl, newAccumulatedPoints, pointsEarned) {
        var _this = this;
        this.updateState({
            gameOver: true,
            showStartButton: true,
        });
        var finalPoints = newAccumulatedPoints === 0 ? pointsEarned : newAccumulatedPoints;
        var updatedPlayers = __spreadArray([], this.players, true);
        // Update the winning player's score.
        var winnerIndex = updatedPlayers.findIndex(function (p) { return p.id === newControl.id; });
        updatedPlayers[winnerIndex] = __assign(__assign({}, updatedPlayers[winnerIndex]), { score: updatedPlayers[winnerIndex].score + finalPoints });
        this.updateState({
            players: updatedPlayers,
            message: "\uD83C\uDFC6 ".concat(newControl.name, " won this game with ").concat(finalPoints, " points! \uD83C\uDFC6"),
        });
        // Check if any player has reached the winning score.
        var gameWinner = updatedPlayers.find(function (p) { return p.score >= _this.gameTo; });
        if (!gameWinner) {
            setTimeout(function () {
                _this.startGame();
            }, 3000);
        }
        else {
            // Game over, someone has won the entire match.
            var scores = updatedPlayers.map(function (p) { return ({
                playerName: p.name,
                score: p.score,
            }); });
            this.updateState({
                message: "Game Over! ".concat(gameWinner.name, " won the match!"),
                gameOverData: {
                    winner: gameWinner,
                    score: scores,
                    isCurrentPlayer: false,
                    isMultiPlayer: true,
                },
            });
        }
    };
    // Reset the entire game, for use after a complete match.
    MultiplayerCardsGame.prototype.resetGame = function () {
        var resetPlayers = this.players.map(function (player) { return (__assign(__assign({}, player), { score: 0, hands: [] })); });
        this.players = resetPlayers;
        this.currentPlays = [];
        this.currentLeadCard = null;
        this.currentCard = null;
        this.cardsPlayed = 0;
        this.gameOver = false;
        this.gameHistory = [];
        this.showStartButton = true;
        this.accumulatedPoints = 0;
        this.lastPlayedSuit = null;
        this.currentControl = resetPlayers[0];
        this.deck = [];
        this.updateState({
            message: "New game ready to start!",
        });
        this.startGame();
    };
    return MultiplayerCardsGame;
}());
exports.default = MultiplayerCardsGame;
