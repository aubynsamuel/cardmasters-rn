import { Card } from "@/src/types/gamePlayTypes";

/**
 * AI helper that chooses a card based on the lead
 * If no lead card exists (i.e. leading), play strategically
 * If following suit, choose a card that follows suit rules
 * If unable to follow suit, play strategically
 */
export const chooseCardAI = (
  hand: Card[],
  leadCard: Card | null,
  remainingRounds: number
): Card => {
  // If AI is leading/ is in control (no lead card)
  if (!leadCard) {
    // console.log("[GameUtils] AI is leading");
    if (remainingRounds <= 2) {
      // In final 2 rounds, play highest cards to secure control
      return hand.sort((a, b) => b.value - a.value)[0];
    } else {
      // Otherwise play lowest card to preserve high cards
      return hand.sort((a, b) => a.value - b.value)[0];
    }
  }
  // If AI is following
  else {
    // console.log("[GameUtils] AI is following");
    const requiredSuit = leadCard.suit;
    const cardsOfSuit = hand.filter((card) => card.suit === requiredSuit);

    // If AI has cards of the required suit
    if (cardsOfSuit.length > 0) {
      // console.log("[GameUtils] AI has the required suit");
      // Find cards that can win
      const winningCards = cardsOfSuit.filter(
        (card) => card.value > leadCard.value
      );

      if (winningCards.length > 0) {
        // Win with the lowest winning card always
        return winningCards.sort((a, b) => a.value - b.value)[0];
      } else {
        // Can't win, so play lowest card of required suit
        return cardsOfSuit.sort((a, b) => a.value - b.value)[0];
      }
    }
    // If AI doesn't have required suit
    else {
      // Play lowest value card to minimize loss
      // console.log("[GameUtils] AI doesn't have the required suit");
      return hand.sort((a, b) => a.value - b.value)[0];
    }
  }
};
