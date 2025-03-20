import { create } from "zustand";

interface GameStateStore {
  winner: string | null;
  score: number;
  setWinner: (winner: string) => void;
  setScore: (score: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStateStore>((set) => ({
  winner: null,
  score: 0,
  setWinner: (winner: string) => set({ winner }),
  setScore: (score: number) => set({ score }),
  reset: () => set({ winner: null, score: 0 }),
}));
