import { Redirect } from "expo-router";
import GameOverScreen from "../../screens/GameOverScreen";
import { useNavigationStore } from "../../store/navigationStore";

export default function GameOverRoute() {
  const gameOverData = useNavigationStore((state) => state.gameOverData);

  if (!gameOverData) {
    return <Redirect href="/(app)/menu" />;
  }

  return <GameOverScreen route={{ params: gameOverData }} />;
}
