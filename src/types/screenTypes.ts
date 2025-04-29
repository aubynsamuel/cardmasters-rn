import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GameScore } from "./GamePlayTypes";
import { Player, Room } from "./ServerPayloadTypes";

type GameScreenStackParamList = {
  GameOver: {
    winner: Player;
    score: GameScore[];
    isCurrentPlayer: boolean;
    isMultiPlayer: boolean;
  };
};

type GameScreenProps = NativeStackNavigationProp<
  GameScreenStackParamList,
  "GameOver"
>;

interface GameOverScreenProps {
  route: {
    params: {
      winner: Player;
      isCurrentPlayer: boolean;
      isMultiPlayer: boolean;
      score: {
        playerName: string;
        score: number;
      }[];
      roomId: string;
      initialRoomData: Room;
    };
  };
}

export { GameScreenProps, GameOverScreenProps };
