import { Dimensions, View, Text, StyleSheet } from "react-native";
import { PlayedCardComponentProps } from "./Types";
import { styles } from "./Styles";

export const PlayedCardComponent: React.FC<PlayedCardComponentProps> = ({
  card,
  playerName,
  isHighlight,
}) => {
  const { width } = Dimensions.get("window");
  const cardWidth = width * 0.15;

  return (
    <View style={styles.playedCardContainer}>
      <Text style={styles.playedCardLabel}>{playerName}</Text>
      <View
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardWidth * 1.5,
            borderColor: isHighlight ? "#FFD700" : "#ccc",
            borderWidth: isHighlight ? 3 : 1,
          },
        ]}
      >
        <Text style={[styles.cardValue, { color: card.getColor() }]}>
          {card.value}
        </Text>
        <Text style={[styles.cardSuit, { color: card.getColor() }]}>
          {card.getSuitSymbol()}
        </Text>
      </View>
    </View>
  );
};
