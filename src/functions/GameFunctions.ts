import { Card, GameState, Rank, roundsType, Suit } from "../Types";

const suits: Suit[] = ["diamond", "spade", "love", "club"];
const ranks: Rank[] = ["6", "7", "8", "9", "10", "J", "Q", "K"];
const rankValues: Record<Rank, number> = {
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
};
const suitSymbols: Record<Suit, string> = {
  diamond: "♦",
  spade: "♠",
  love: "♥",
  club: "♣",
};

const roundsList: roundsType[] = [
  { roundNUmber: 1, active: true },
  { roundNUmber: 2, active: false },
  { roundNUmber: 3, active: false },
  { roundNUmber: 4, active: false },
  { roundNUmber: 5, active: false },
];

const createDeck = (): Card[] => {
  let deck: Card[] = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ suit, rank, value: rankValues[rank] });
    });
  });
  return deck;
};

// Fisher–Yates shuffle
const shuffleDeck = (deck: Card[]): Card[] => {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal 5 cards each (first 3 then 2 cards) for 2 players
const dealCards = (deck: Card[]): GameState => {
  let human: Card[] = [];
  let computer: Card[] = [];
  let deckCopy = [...deck];

  // First round: 3 cards each
  for (let i = 0; i < 3; i++) {
    human.push(deckCopy.shift()!);
  }
  for (let i = 0; i < 3; i++) {
    computer.push(deckCopy.shift()!);
  }

  // Second round: 2 cards each
  for (let i = 0; i < 2; i++) {
    human.push(deckCopy.shift()!);
  }
  for (let i = 0; i < 2; i++) {
    computer.push(deckCopy.shift()!);
  }

  for (let humanCard of human) {
    for (let computerCard of computer) {
      if (humanCard === computerCard) {
        console.error("Duplicate Card found", humanCard, computerCard);
      }
    }
  }

  return { human, computer, deck: deckCopy };
};

/**
 * AI helper that chooses a card based on the lead
 * If no lead card exists (i.e. leading), play strategically
 * If following suit, choose a card that follows suit rules
 * If unable to follow suit, play strategically
 */
const chooseCardAI = (
  hand: Card[],
  leadCard: Card | null,
  remainingRounds: number
): Card => {
  // If AI is leading/ is in control (no lead card)
  if (!leadCard) {
    // console.log("AI is leading");
    if (remainingRounds <= 2) {
      // In final 2 rounds, play highest cards to secure control
      return [...hand].sort((a, b) => b.value - a.value)[0];
    } else {
      // Otherwise play lowest card to preserve high cards
      return [...hand].sort((a, b) => a.value - b.value)[0];
    }
  }
  // If AI is following
  else {
    // console.log("AI is following");
    const requiredSuit = leadCard.suit;
    const cardsOfSuit = hand.filter((card) => card.suit === requiredSuit);

    // If AI has cards of the required suit
    if (cardsOfSuit.length > 0) {
      // console.log("AI has the required suit");
      // Find cards that can win
      const winningCards = cardsOfSuit.filter(
        (card) => card.value > leadCard.value
      );

      if (winningCards.length > 0) {
        if (remainingRounds <= 2) {
          // Play highest winner in final rounds
          return winningCards.sort((a, b) => b.value - a.value)[0];
        } else {
          // Play lowest winner in early rounds
          return winningCards.sort((a, b) => a.value - b.value)[0];
        }
      } else {
        // Can't win, so play lowest card of required suit
        return cardsOfSuit.sort((a, b) => a.value - b.value)[0];
      }
    }
    // If AI doesn't have required suit
    else {
      // Play lowest value card to minimize loss
      // console.log("AI doesn't have the required suit");
      return [...hand].sort((a, b) => a.value - b.value)[0];
    }
  }
};

export { createDeck, shuffleDeck, dealCards, chooseCardAI, suitSymbols };
