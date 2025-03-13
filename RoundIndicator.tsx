import { View } from "react-native";
import { styles } from "./Styles";
import { RoundIndicatorProps } from "./Types";

// Round Indicator Component
export const RoundIndicator: React.FC<RoundIndicatorProps> = ({
  currentRound,
}) => {
  return (
    <View style={styles.roundIndicator}>
      {[1, 2, 3, 4, 5].map((round) => (
        <View
          key={`round-${round}`}
          style={[
            styles.roundCircle,
            round <= currentRound ? styles.activeRound : {},
          ]}
        />
      ))}
    </View>
  );
};
