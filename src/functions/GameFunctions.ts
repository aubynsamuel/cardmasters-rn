import {
  Card,
  GameScore,
  Player,
  Rank,
  Suit,
} from "../Types";

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

const gameScoreToString = (gameScoreList: GameScore[]) => {
  let Score: string = "";
  for (const gameScore of gameScoreList) {
    Score += `${gameScore.playerName} : ${gameScore.score}\n`;
    // ${
    //   gameScoreList.indexOf(gameScore) === gameScoreList.length - 1
    //     ? ""
    //     : "vs "
    // }
  }
  return Score;
};

// For testing scoring system
export const getFixedHands = (): { computer: Card[]; human: Card[] } => {
  // Create computer's hand with diamond and spade suits
  const computerHand: Card[] = [
    { suit: "diamond", rank: "6", value: rankValues["6"] },
    { suit: "diamond", rank: "7", value: rankValues["7"] },
    { suit: "diamond", rank: "K", value: rankValues["K"] },
    { suit: "spade", rank: "6", value: rankValues["6"] },
    { suit: "spade", rank: "7", value: rankValues["7"] },
    // { suit: "spade", rank: "K", value: rankValues["K"] },
  ];

  // Create human's hand with love and club suits
  const humanHand: Card[] = [
    { suit: "love", rank: "6", value: rankValues["6"] },
    { suit: "love", rank: "7", value: rankValues["7"] },
    { suit: "love", rank: "K", value: rankValues["K"] },
    { suit: "club", rank: "6", value: rankValues["6"] },
    { suit: "club", rank: "7", value: rankValues["7"] },
    // { suit: "club", rank: "K", value: rankValues["K"] },
  ];

  return { computer: computerHand, human: humanHand };
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ suit, rank, value: rankValues[rank] });
    });
  });
  return deck;
};

// Fisher–Yates shuffle
const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal 5 cards each (first 3 then 2 cards) for 2 players
// New, generalized dealing function:
const dealCards = (
  players: Player[],
  deck: Card[]
): { hands: Card[][]; deck: Card[] } => {
  const deckCopy = [...deck];
  // Create an array of hands, one per player
  const hands: Card[][] = players.map(() => []);

  // First round: deal 3 cards to each player
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < players.length; i++) {
      hands[i].push(deckCopy.shift()!);
    }
  }

  // Second round: deal 2 cards to each player
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < players.length; i++) {
      hands[i].push(deckCopy.shift()!);
    }
  }

  // (Optional duplicate-check across all hands)
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      for (const cardI of hands[i]) {
        for (const cardJ of hands[j]) {
          if (cardI === cardJ) {
            console.error("Duplicate Card found", cardI, cardJ);
          }
        }
      }
    }
  }

  return { hands, deck: deckCopy };
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

export {
  createDeck,
  shuffleDeck,
  dealCards,
  chooseCardAI,
  suitSymbols,
  gameScoreToString,
};
