import Animated, { BounceInUp } from "react-native-reanimated";
import { View, Text } from "react-native";
import getStyles from "../Styles";
import { DiagonalDirections } from "react-native-gesture-handler/lib/typescript/Directions";
import DiagonalStripes from "./DiagonalStripes";

const ShufflingAnimation = () => {
  // Create an array of cards for animation
  const cards = Array(10).fill(0);
  const styles = getStyles();

  return (
    <View style={styles.shuffleContainer}>
      <Text style={styles.shuffleText}>Shuffling...</Text>
      <View style={styles.shuffleCards}>
        {cards.map((_, index) => {
          const isEven = index % 2 === 0;
          return (
            <Animated.View
              key={index}
              entering={BounceInUp.delay(index * 50).duration(300)}
            >
              <View
                key={index}
                style={[
                  styles.shuffleCard,
                  {
                    transform: [
                      { translateX: isEven ? -20 : 20 },
                      { rotate: isEven ? "-15deg" : "15deg" },
                    ],
                    zIndex: index,
                  },
                ]}
              >
                <DiagonalStripes />
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

export default ShufflingAnimation;
