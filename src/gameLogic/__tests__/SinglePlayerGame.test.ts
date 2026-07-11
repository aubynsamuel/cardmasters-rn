import { Card } from "../../types/gamePlayTypes";
import { Player } from "../../types/serverPayloadTypes";
import CardsGame from "../SinglePlayerGameClass";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({
  rank,
  suit,
  value:
    rank === "J" ? 11 : rank === "Q" ? 12 : rank === "K" ? 13 : Number(rank),
});

const createPlayers = (): Player[] => [
  { id: "human", name: "You", hands: [], score: 0 },
  { id: "computer", name: "Computer", hands: [], score: 0 },
];

describe("single-player rules", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("rejects a card outside the lead suit when the player can follow", () => {
    const players = createPlayers();
    players[0].hands = [card("6", "club"), card("7", "spade")];
    const game = new CardsGame(players, 10);
    game.currentControl = players[1];
    game.currentLeadCard = card("8", "spade");
    game.currentPlays = [{ player: players[1], card: card("8", "spade") }];
    game.canPlayCard = true;

    const result = game.humanPlayCard(players[0].hands[0], 0);

    expect(result.error).toBe("Invalid Move");
    expect(players[0].hands).toHaveLength(2);
  });

  it("accumulates qualifying cards won across different suits", () => {
    const players = createPlayers();
    const game = new CardsGame(players, 5);
    game.currentControl = players[0];
    game.currentLeadCard = card("7", "spade");
    game.currentPlays = [
      { player: players[0], card: card("7", "spade") },
      { player: players[1], card: card("K", "club") },
    ];
    game.accumulatedPoints = 3;
    game.lastPlayedSuit = "diamond";
    game.cardsPlayed = 4;

    game.finishRound();
    jest.advanceTimersByTime(1500);

    expect(game.players[0].score).toBe(5);
    expect(game.gameOverData.winner.id).toBe("human");
  });

  it("replaces the accumulation when the winning suit repeats", () => {
    const players = createPlayers();
    const game = new CardsGame(players, 2);
    game.currentControl = players[0];
    game.currentLeadCard = card("7", "diamond");
    game.currentPlays = [
      { player: players[0], card: card("7", "diamond") },
      { player: players[1], card: card("K", "club") },
    ];
    game.accumulatedPoints = 3;
    game.lastPlayedSuit = "diamond";
    game.cardsPlayed = 4;

    game.finishRound();
    jest.advanceTimersByTime(1500);

    expect(game.players[0].score).toBe(2);
  });

  it("awards one point when a low card transfers control", () => {
    const players = createPlayers();
    const game = new CardsGame(players, 1);
    game.currentControl = players[1];
    game.currentLeadCard = card("6", "spade");
    game.currentPlays = [
      { player: players[1], card: card("6", "spade") },
      { player: players[0], card: card("7", "spade") },
    ];
    game.cardsPlayed = 4;

    game.finishRound();
    jest.advanceTimersByTime(1500);

    expect(game.players[0].score).toBe(1);
    expect(game.gameOverData.winner.id).toBe("human");
  });
});
