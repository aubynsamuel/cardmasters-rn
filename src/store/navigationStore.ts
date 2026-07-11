import { create } from "zustand";
import { GameOverData } from "../types/gamePlayTypes";
import { Room } from "../types/serverPayloadTypes";

export type GameOverRouteData = GameOverData & {
  roomId?: string;
  initialRoomData?: Room;
};

interface NavigationState {
  roomId: string | null;
  roomData: Room | null;
  gameId: string | null;
  gameOverData: GameOverRouteData | null;
  setRoom: (roomId: string, roomData?: Room | null) => void;
  setGameOverData: (data: GameOverRouteData) => void;
  setGameId: (gameId: string) => void;
  clearRoom: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  roomId: null,
  roomData: null,
  gameId: null,
  gameOverData: null,
  setRoom: (roomId, roomData) =>
    set((state) => ({
      roomId,
      roomData: roomData ?? state.roomData,
    })),
  setGameOverData: (gameOverData) => set({ gameOverData }),
  setGameId: (gameId) => set({ gameId }),
  clearRoom: () => set({ roomId: null, roomData: null, gameId: null }),
}));
