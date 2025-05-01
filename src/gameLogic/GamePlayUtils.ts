import { Card, GameScore, Rank, Suit } from "../types/GamePlayTypes";
import { Player } from "../types/ServerPayloadTypes";

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
  }
  return Score;
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

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const dealCards = (
  players: Player[],
  deck: Card[]
): { hands: Card[][]; deck: Card[] } => {
  const deckCopy = [...deck];
  const hands: Card[][] = players.map(() => []);

  // First round: deal 3 cards to each player
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < 3; j++) {
      hands[i].push(deckCopy.shift()!);
    }
  }

  // Second round: deal 2 cards to each player
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < 2; j++) {
      hands[i].push(deckCopy.shift()!);
    }
  }

  // (Duplicate-check across all hands)
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      for (const cardI of hands[i]) {
        for (const cardJ of hands[j]) {
          if (cardI === cardJ) {
            console.error("[GameUtils] Duplicate Card found", cardI, cardJ);
          }
        }
      }
    }
  }

  return { hands, deck: deckCopy };
};

export { createDeck, shuffleDeck, dealCards, suitSymbols, gameScoreToString };
