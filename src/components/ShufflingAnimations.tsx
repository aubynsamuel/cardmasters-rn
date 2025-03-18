import Animated, { BounceInUp } from "react-native-reanimated";
import { View, Text } from "react-native";
import getStyles from "../Styles";

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
                      { translateX: isEven ? -10 : 10 },
                      { rotate: isEven ? "-5deg" : "5deg" },
                    ],
                    zIndex: index,
                  },
                ]}
              >
                <Text style={styles.cardBackText}>🂠</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

export default ShufflingAnimation;
