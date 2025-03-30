"use strict";
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
exports.gameScoreToString = exports.suitSymbols = exports.chooseCardAI = exports.dealCards = exports.shuffleDeck = exports.createDeck = exports.getFixedHands = void 0;
var suits = ["diamond", "spade", "love", "club"];
var ranks = ["6", "7", "8", "9", "10", "J", "Q", "K"];
var rankValues = {
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
};
var suitSymbols = {
    diamond: "♦",
    spade: "♠",
    love: "♥",
    club: "♣",
};
exports.suitSymbols = suitSymbols;
var gameScoreToString = function (gameScoreList) {
    var Score = "";
    for (var _i = 0, gameScoreList_1 = gameScoreList; _i < gameScoreList_1.length; _i++) {
        var gameScore = gameScoreList_1[_i];
        Score += "".concat(gameScore.playerName, " : ").concat(gameScore.score, "\n");
        // ${
        //   gameScoreList.indexOf(gameScore) === gameScoreList.length - 1
        //     ? ""
        //     : "vs "
        // }
    }
    return Score;
};
exports.gameScoreToString = gameScoreToString;
// For testing scoring system
var getFixedHands = function () {
    // Create computer's hand with diamond and spade suits
    var computerHand = [
        { suit: "diamond", rank: "6", value: rankValues["6"] },
        { suit: "diamond", rank: "7", value: rankValues["7"] },
        { suit: "diamond", rank: "K", value: rankValues["K"] },
        { suit: "spade", rank: "6", value: rankValues["6"] },
        { suit: "spade", rank: "7", value: rankValues["7"] },
        // { suit: "spade", rank: "K", value: rankValues["K"] },
    ];
    // Create human's hand with love and club suits
    var humanHand = [
        { suit: "love", rank: "6", value: rankValues["6"] },
        { suit: "love", rank: "7", value: rankValues["7"] },
        { suit: "love", rank: "K", value: rankValues["K"] },
        { suit: "club", rank: "6", value: rankValues["6"] },
        { suit: "club", rank: "7", value: rankValues["7"] },
        // { suit: "club", rank: "K", value: rankValues["K"] },
    ];
    return { computer: computerHand, human: humanHand };
};
exports.getFixedHands = getFixedHands;
var createDeck = function () {
    var deck = [];
    suits.forEach(function (suit) {
        ranks.forEach(function (rank) {
            deck.push({ suit: suit, rank: rank, value: rankValues[rank] });
        });
    });
    return deck;
};
exports.createDeck = createDeck;
// Fisher–Yates shuffle
var shuffleDeck = function (deck) {
    var _a;
    var shuffled = __spreadArray([], deck, true);
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [shuffled[j], shuffled[i]], shuffled[i] = _a[0], shuffled[j] = _a[1];
    }
    return shuffled;
};
exports.shuffleDeck = shuffleDeck;
// Deal 5 cards each (first 3 then 2 cards) for 2 players
// New, generalized dealing function:
var dealCards = function (players, deck) {
    var deckCopy = __spreadArray([], deck, true);
    // Create an array of hands, one per player
    var hands = players.map(function () { return []; });
    // First round: deal 3 cards to each player
    for (var round = 0; round < 3; round++) {
        for (var i = 0; i < players.length; i++) {
            hands[i].push(deckCopy.shift());
        }
    }
    // Second round: deal 2 cards to each player
    for (var round = 0; round < 2; round++) {
        for (var i = 0; i < players.length; i++) {
            hands[i].push(deckCopy.shift());
        }
    }
    // (Optional duplicate-check across all hands)
    for (var i = 0; i < players.length; i++) {
        for (var j = i + 1; j < players.length; j++) {
            for (var _i = 0, _a = hands[i]; _i < _a.length; _i++) {
                var cardI = _a[_i];
                for (var _b = 0, _c = hands[j]; _b < _c.length; _b++) {
                    var cardJ = _c[_b];
                    if (cardI === cardJ) {
                        console.error("Duplicate Card found", cardI, cardJ);
                    }
                }
            }
        }
    }
    return { hands: hands, deck: deckCopy };
};
exports.dealCards = dealCards;
/**
 * AI helper that chooses a card based on the lead
 * If no lead card exists (i.e. leading), play strategically
 * If following suit, choose a card that follows suit rules
 * If unable to follow suit, play strategically
 */
var chooseCardAI = function (hand, leadCard, remainingRounds) {
    // If AI is leading/ is in control (no lead card)
    if (!leadCard) {
        // console.log("AI is leading");
        if (remainingRounds <= 2) {
            // In final 2 rounds, play highest cards to secure control
            return __spreadArray([], hand, true).sort(function (a, b) { return b.value - a.value; })[0];
        }
        else {
            // Otherwise play lowest card to preserve high cards
            return __spreadArray([], hand, true).sort(function (a, b) { return a.value - b.value; })[0];
        }
    }
    // If AI is following
    else {
        // console.log("AI is following");
        var requiredSuit_1 = leadCard.suit;
        var cardsOfSuit = hand.filter(function (card) { return card.suit === requiredSuit_1; });
        // If AI has cards of the required suit
        if (cardsOfSuit.length > 0) {
            // console.log("AI has the required suit");
            // Find cards that can win
            var winningCards = cardsOfSuit.filter(function (card) { return card.value > leadCard.value; });
            if (winningCards.length > 0) {
                if (remainingRounds <= 2) {
                    // Play highest winner in final rounds
                    return winningCards.sort(function (a, b) { return b.value - a.value; })[0];
                }
                else {
                    // Play lowest winner in early rounds
                    return winningCards.sort(function (a, b) { return a.value - b.value; })[0];
                }
            }
            else {
                // Can't win, so play lowest card of required suit
                return cardsOfSuit.sort(function (a, b) { return a.value - b.value; })[0];
            }
        }
        // If AI doesn't have required suit
        else {
            // Play lowest value card to minimize loss
            // console.log("AI doesn't have the required suit");
            return __spreadArray([], hand, true).sort(function (a, b) { return a.value - b.value; })[0];
        }
    }
};
exports.chooseCardAI = chooseCardAI;
