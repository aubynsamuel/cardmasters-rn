import { CardValue, Suit } from "./Types";
export class Card {
  suit: Suit;
  value: CardValue;
  numericValue: number;
  constructor(suit: Suit, value: CardValue) {
    this.suit = suit;
    this.value = value;
    this.numericValue = this.getNumericValue();
  }

  getNumericValue() {
    if (this.value === "J") return 11;
    if (this.value === "Q") return 12;
    if (this.value === "K") return 13;

    return parseInt(this.value);
  }

  getSuitSymbol() {
    switch (this.suit) {
      case "diamond":
        return "♦";
      case "spade":
        return "♠";
      case "love":
        return "♥";
      case "club":
        return "♣";
      default:
        return "";
    }
  }

  getColor() {
    return this.suit === "diamond" || this.suit === "love" ? "red" : "black";
  }

  toString() {
    return `${this.value}${this.getSuitSymbol()}`;
  }
}

// Deck class
export class Deck {
  cards: Card[];
  constructor() {
    this.cards = [];
    this.initialize();
  }

  initialize() {
    const suits: Suit[] = [Suit.Diamond, Suit.Spade, Suit.Heart, Suit.Club];
    const values: CardValue[] = [
      CardValue.Six,
      CardValue.Seven,
      CardValue.Eight,
      CardValue.Nine,
      CardValue.Ten,
      CardValue.Jack,
      CardValue.Queen,
      CardValue.King,
    ];

    for (const suit of suits) {
      for (const value of values) {
        this.cards.push(new Card(suit, value));
      }
    }
    console.log("Game Initialized!");
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    console.log("Cards Shuffled!");
    console.log("");
  }

  deal(numCards: number) {
    if (numCards > this.cards.length) return [];
    console.log("Cards dealt");
    return this.cards.splice(0, numCards);
  }
}

// Player class
export class Player {
  name: string;
  hand: Card[];
  isHuman: boolean;
  constructor(name: string, isHuman = false) {
    this.name = name;
    this.hand = [];
    this.isHuman = isHuman;
  }

  addCards(cards: Card[]) {
    this.hand = [...this.hand, ...cards];
    this.sortHand();
    console.log("cards added");
  }

  sortHand() {
    // Sort by value
    console.log("cards sorted");

    this.hand.sort((a, b) => a.numericValue - b.numericValue);
  }

  playCard(index: number) {
    if (index >= 0 && index < this.hand.length) {
      console.log("card played");
      return this.hand.splice(index, 1)[0];
    }
    console.log("card is empty!");
    return null;
  }

  hasSuit(suit: Suit) {
    console.log("has suit");

    return this.hand.some((card) => card.suit === suit);
  }

  getPlayableCards(leadSuit: Suit | null) {
    if (!leadSuit || !this.hasSuit(leadSuit)) {
      console.log("does not have suit and is not leading");

      return this.hand.map((_, index) => index);
    }
    console.log("suit is present");

    return this.hand
      .map((card, index) => (card.suit === leadSuit ? index : -1))
      .filter((index) => index !== -1);
  }

  // Computer AI strategy
  chooseCardAI(
    leadSuit: Suit | null,
    highestCard: { numericValue: number } | null
  ) {
    const playableIndices = this.getPlayableCards(leadSuit);

    // If we're leading, play our lowest card
    if (!leadSuit) {
      console.log("computer is not leading");

      return playableIndices[0];
    }

    // If we must follow suit
    if (this.hasSuit(leadSuit)) {
      const sameSuitCards = playableIndices.map((idx) => ({
        index: idx,
        card: this.hand[idx],
      }));

      // If we can win, play lowest winning card
      if (highestCard) {
        console.log("played lowest card");

        const winningCards = sameSuitCards.filter(
          ({ card }) => card.numericValue > highestCard.numericValue
        );

        if (winningCards.length > 0) {
          // Sort by value and play lowest winning card
          winningCards.sort(
            (a, b) => a.card.numericValue - b.card.numericValue
          );
          return winningCards[0].index;
        }
      }

      // Can't win or no highest card yet, play lowest
      return sameSuitCards[0].index;
    }

    // If we can play any card, play the lowest
    console.log("playing lowest card");

    return playableIndices[0];
  }
}
