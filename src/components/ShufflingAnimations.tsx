import Animated, { BounceInUp } from "react-native-reanimated";
import { View, Text } from "react-native";
import getStyles from "../Styles";
import DiagonalStripes from "./DiagonalStripes";

const rotateDegree: Record<number, string> = {
  0: "-75deg",
  1: "-65deg",
  2: "-55deg",
  3: "-45deg",
  4: "-35deg",
  5: "-25deg",
  6: "-15deg",
  7: "-5deg",
  8: "15deg",
  9: "25deg",
  10: "35deg",
  11: "45deg",
  12: "55deg",
  13: "65deg",
  14: "75deg",
};

const ShufflingAnimation = () => {
  // Create an array of cards for animation
  const cards = Array(15).fill(0);
  const styles = getStyles();

  return (
    <View style={styles.shuffleContainer}>
      <Text style={styles.shuffleText}>Shuffling...</Text>
      <View style={styles.shuffleCards}>
        {cards.map((_, index) => {
          return (
            <Animated.View
              key={index}
              entering={BounceInUp.delay(index * 50)
                .duration(300)
                .springify()
                .stiffness(300)}
            >
              <View
                key={index}
                style={[
                  styles.shuffleCard,
                  {
                    transform: [
                      {
                        rotate: rotateDegree[index],
                      },
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
