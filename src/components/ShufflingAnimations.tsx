import Animated, { BounceInUp } from "react-native-reanimated";
import { View, Text, StyleSheet } from "react-native";
import DiagonalStripes from "./DiagonalStripes";
import Colors from "../Colors";

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
  const cards = Array(15).fill(0);
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

const styles = StyleSheet.create({
  shuffleContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    elevation: 5,
  },
  shuffleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  shuffleCard: {
    position: "absolute",
    width: 45,
    height: 70,
    backgroundColor: Colors.cardBackBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBackBorder,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  shuffleCards: {
    width: 100,
    height: 100,
  },
});

export default ShufflingAnimation;
