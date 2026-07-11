import { GameScore } from "@/types/gamePlayTypes";
import { Player, Room } from "./serverPayloadTypes";

interface GameScreenProps {
  navigate: (
    name: "GameOver",
    params: {
      winner: Player;
      score: GameScore[];
      isCurrentPlayer: boolean;
      isMultiPlayer: boolean;
    }
  ) => void;
  reset: (config: {
    index: number;
    routes: { name: string; params?: Record<string, unknown> }[];
  }) => void;
}

interface GameOverScreenProps {
  route: {
    params: {
      winner: Player;
      isCurrentPlayer: boolean;
      isMultiPlayer: boolean;
      score: GameScore[];
      roomId?: string;
      initialRoomData?: Room;
    };
  };
}

export { GameOverScreenProps, GameScreenProps };
