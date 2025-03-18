import { View } from "react-native";
import Animated, { FlipInEasyX } from "react-native-reanimated";
import DiagonalStripes from "./DiagonalStripes";

interface opponentCardInterface {
  index: number;
  styles: any;
  isDealing: boolean;
}
const OpponentCard: React.FC<opponentCardInterface> = ({
  index,
  styles,
  isDealing,
}) => {
  return (
    <Animated.View
      key={`opponent-card-${index}`}
      entering={
        isDealing ? FlipInEasyX.delay(index * 200).duration(300) : undefined
      }
    >
      <View style={styles.cardBack}>
        <DiagonalStripes />
      </View>
    </Animated.View>
  );
};

export default OpponentCard;
