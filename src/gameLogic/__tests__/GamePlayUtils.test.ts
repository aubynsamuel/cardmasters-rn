import { Card } from "../../types/gamePlayTypes";
import { Player } from "../../types/serverPayloadTypes";
import { chooseCardAI } from "../ChooseCardAI";
import { createDeck, dealCards } from "../GamePlayUtils";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({
  rank,
  suit,
  value:
    rank === "J" ? 11 : rank === "Q" ? 12 : rank === "K" ? 13 : Number(rank),
});

const players: Player[] = [
  { id: "human", name: "You", hands: [], score: 0 },
  { id: "computer", name: "Computer", hands: [], score: 0 },
];

describe("Card Masters deck", () => {
  it("creates the reduced 32-card deck without duplicates", () => {
    const deck = createDeck();
    const identities = new Set(deck.map((item) => `${item.rank}-${item.suit}`));

    expect(deck).toHaveLength(32);
    expect(identities.size).toBe(32);
  });

  it("deals five unique cards to each player in a two-player hand", () => {
    const deck = createDeck();
    const result = dealCards(players, deck);
    const dealtCards = result.hands.flat();
    const identities = new Set(
      dealtCards.map((item) => `${item.rank}-${item.suit}`)
    );

    expect(result.hands).toHaveLength(2);
    expect(result.hands[0]).toHaveLength(5);
    expect(result.hands[1]).toHaveLength(5);
    expect(identities.size).toBe(10);
    expect(result.deck).toHaveLength(22);
  });
});

describe("Card Masters AI", () => {
  it("follows suit and uses the lowest winning card", () => {
    const hand = [card("6", "club"), card("9", "spade"), card("K", "spade")];
    const chosen = chooseCardAI(hand, card("8", "spade"), 4);

    expect(chosen).toEqual(card("9", "spade"));
  });

  it("discards its lowest card when it cannot follow suit", () => {
    const hand = [card("6", "club"), card("9", "diamond")];
    const chosen = chooseCardAI(hand, card("8", "spade"), 4);

    expect(chosen).toEqual(card("6", "club"));
  });

  it("preserves high cards early and leads high cards late", () => {
    const hand = [card("6", "club"), card("K", "diamond")];

    expect(chooseCardAI(hand, null, 4)).toEqual(card("6", "club"));
    expect(chooseCardAI(hand, null, 2)).toEqual(card("K", "diamond"));
  });
});
