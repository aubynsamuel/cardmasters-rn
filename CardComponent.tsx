import { Dimensions, TouchableOpacity, Text } from "react-native";
import { styles } from "./Styles";
import { CardComponentProps } from "./Types";

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  index = -1,
  playable = false,
  onPress = () => {},
  isBackface,
}) => {
  const { width } = Dimensions.get("window");
  const cardWidth = width * 0.15;

  if (isBackface) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          styles.cardBack,
          { width: cardWidth, height: cardWidth * 1.5 },
        ]}
        disabled={true}
      ></TouchableOpacity>
    );
  }

  if (!card) return null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardWidth * 1.5,
          borderColor: playable ? "#FFD700" : "#ccc",
          borderWidth: playable ? 2 : 1,
        },
      ]}
      onPress={() => onPress(index)}
      disabled={!playable}
    >
      <Text style={[styles.cardValue, { color: card.getColor() }]}>
        {card.value}
      </Text>
      <Text style={[styles.cardSuit, { color: card.getColor() }]}>
        {card.getSuitSymbol()}
      </Text>
    </TouchableOpacity>
  );
};
