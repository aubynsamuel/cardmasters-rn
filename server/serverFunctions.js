const suits = ["diamond", "spade", "love", "club"];
const ranks = ["6", "7", "8", "9", "10", "J", "Q", "K"];
const rankValues = {
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
};

// Create a standard deck of cards
function createDeck() {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ suit, rank, value: rankValues[rank] });
    });
  });
  return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

// Deal cards for multiplayer game
function dealCardsMultiPlayer(deck) {
  const you = [];
  const opponent1 = [];
  const deckCopy = [...deck];

  // First round: 3 cards each
  for (let i = 0; i < 3; i++) {
    you.push(deckCopy.shift());
  }
  for (let i = 0; i < 3; i++) {
    opponent1.push(deckCopy.shift());
  }

  // Second round: 2 cards each
  for (let i = 0; i < 2; i++) {
    you.push(deckCopy.shift());
  }
  for (let i = 0; i < 2; i++) {
    opponent1.push(deckCopy.shift());
  }

  return { you, opponent1, deck: deckCopy };
}

module.exports = {
  createDeck,
  shuffleDeck,
  dealCardsMultiPlayer,
};
