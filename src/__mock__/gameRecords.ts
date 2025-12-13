import { GameRecord } from "@/src/types/gamePlayTypes";

export const dummyRecords: GameRecord[] = [
  {
    gameId: "game-123456",
    dateString: new Date().toUTCString(),

    targetScore: 20,
    playerCount: 4,
    mode: "multiplayer",
    players: [
      { id: "p1", name: "Alice", finalScore: 22, position: 1 },
      { id: "p2", name: "Bob", finalScore: 18, position: 2 },
      { id: "p3", name: "Charlie", finalScore: 15, position: 3 },
      { id: "p4", name: "David", finalScore: 12, position: 4 },
    ],
    winnerId: "p1",
    winnerName: "Alice",
  },
  {
    gameId: "game-789012",
    dateString: new Date().toUTCString(),
    targetScore: 15,
    playerCount: 2,
    mode: "multiplayer",
    players: [
      { id: "p5", name: "Emma", finalScore: 16, position: 1 },
      { id: "p6", name: "Frank", finalScore: 12, position: 2 },
    ],
    winnerId: "p5",
    winnerName: "Emma",
  },
  {
    gameId: "game-345678",
    dateString: new Date().toUTCString(),

    targetScore: 25,
    playerCount: 1,
    mode: "single-player",
    players: [{ id: "p7", name: "You", finalScore: 27, position: 1 }],
    winnerId: "p7",
    winnerName: "You",
  },
  {
    gameId: "game-901234",
    dateString: new Date().toUTCString(),
    targetScore: 30,
    playerCount: 3,
    mode: "multiplayer",
    players: [
      { id: "p8", name: "Grace", finalScore: 32, position: 1 },
      { id: "p9", name: "You", finalScore: 28, position: 2 },
      { id: "p10", name: "Ian", finalScore: 24, position: 3 },
    ],
    winnerId: "p8",
    winnerName: "Grace",
  },
  {
    gameId: "game-567890",
    dateString: new Date().toUTCString(),
    targetScore: 15,
    playerCount: 1,
    mode: "single-player",
    players: [{ id: "p11", name: "You", finalScore: 17, position: 1 }],
    winnerId: "p11",
    winnerName: "You",
  },
];
