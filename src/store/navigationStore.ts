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
  gameOverData: GameOverRouteData | null;
  setRoom: (roomId: string, roomData?: Room | null) => void;
  setGameOverData: (data: GameOverRouteData) => void;
  clearRoom: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  roomId: null,
  roomData: null,
  gameOverData: null,
  setRoom: (roomId, roomData) =>
    set((state) => ({
      roomId,
      roomData: roomData ?? state.roomData,
    })),
  setGameOverData: (gameOverData) => set({ gameOverData }),
  clearRoom: () => set({ roomId: null, roomData: null }),
}));
