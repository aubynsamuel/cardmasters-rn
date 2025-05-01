import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const RulesScreen = () => {
  const navigation = useNavigation();

  const renderRuleSection = (title, icon, content) => (
    <View style={styles.sectionCard}>
      <LinearGradient
        colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
        style={styles.sectionGradient}
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name={icon} size={22} color="#FFD700" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>{content}</View>
      </LinearGradient>
    </View>
  );

  const renderBulletPoint = (text, bold) => (
    <View style={styles.bulletItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.bulletText}>
        {bold && <Text style={styles.boldText}>{bold}: </Text>}
        {text}
      </Text>
    </View>
  );

  const renderNumberedPoint = (number, text, bold) => (
    <View style={styles.bulletItem}>
      <Text style={styles.numberPoint}>{number}</Text>
      <Text style={styles.bulletText}>
        {bold && <Text style={styles.boldText}>{bold}: </Text>}
        {text}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={["#076324", "#076345"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#FF4E50", "#F9D423"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>GAME RULES</Text>
        </LinearGradient>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Setup Section */}
        {renderRuleSection(
          "Setup",
          "cards-playing-outline",
          <View>
            {renderBulletPoint(
              "6 through King of each suit (diamonds, spades, hearts, clubs)",
              "Cards Used"
            )}
            {renderBulletPoint(
              "Shuffle and deal 3 cards to each player clockwise, then 2 more (5 total per player)",
              "Deal"
            )}
          </View>
        )}

        {/* Gameplay Section */}
        {renderRuleSection(
          "Gameplay",
          "gamepad-variant",
          <View>
            {renderNumberedPoint(
              1,
              "The player who received the first card begins",
              "First Turn"
            )}
            {renderNumberedPoint(
              2,
              "The player in control plays any card from their hand",
              "Control"
            )}
            {renderNumberedPoint(
              3,
              "Moving clockwise, each player must play a card of the called suit if available",
              "Following Turns"
            )}
            {renderNumberedPoint(
              4,
              "When a player plays a higher card of the called suit, they gain control",
              "Gaining Control"
            )}
            {renderNumberedPoint(
              5,
              "After all 5 cards have been played, the player in control wins the round",
              "Winning the Round"
            )}
          </View>
        )}

        {/* Important Rules Section */}
        {renderRuleSection(
          "Important Rules",
          "alert-circle-outline",
          <View>
            {renderBulletPoint(
              "Players must play a card of the called suit if they have one"
            )}
            {renderBulletPoint(
              "If a player is caught hiding a card of the called suit, they are disqualified"
            )}
            {renderBulletPoint(
              "Strategy involves saving higher cards for later tricks when possible"
            )}
            {renderBulletPoint(
              "Each card is unique, ensuring no ties in control"
            )}
          </View>
        )}

        {/* Scoring System Section */}
        {renderRuleSection(
          "Scoring System",
          "trophy-outline",
          <View>
            <View style={styles.scoreRow}>
              <View style={[styles.scoreCard, { backgroundColor: "#FFC107" }]}>
                <Text style={styles.scoreCardText}>6</Text>
                <Text style={styles.scoreCardPoints}>3 pts</Text>
              </View>
              <View style={[styles.scoreCard, { backgroundColor: "#4CAF50" }]}>
                <Text style={styles.scoreCardText}>7</Text>
                <Text style={styles.scoreCardPoints}>2 pts</Text>
              </View>
              <View style={[styles.scoreCard, { backgroundColor: "#2196F3" }]}>
                <Text style={styles.scoreCardText}>8-K</Text>
                <Text style={styles.scoreCardPoints}>1 pt</Text>
              </View>
            </View>
            {renderBulletPoint(
              "Points from 6s and 7s accumulate, playing 8-K resets accumulation",
              "Accumulation"
            )}
            {renderBulletPoint(
              "If a player loses control, their accumulated points reset to 0"
            )}
          </View>
        )}

        {/* Special Rules Section */}
        {renderRuleSection(
          "Special Rules",
          "star-outline",
          <View>
            <View style={styles.specialRule}>
              <Text style={styles.specialRuleTitle}>Same Suit Rule</Text>
              <Text style={styles.specialRuleText}>
                When playing same suit cards while maintaining control, only the
                most recent card&apos;s value counts
              </Text>
              <Text style={styles.specialRuleExample}>
                Example: 6♠ → 7♠ = 2 points
              </Text>
            </View>

            <View style={styles.specialRule}>
              <Text style={styles.specialRuleTitle}>Different Suit Rule</Text>
              <Text style={styles.specialRuleText}>
                When playing 6s and 7s of different suits while maintaining
                control, points accumulate
              </Text>
              <Text style={styles.specialRuleExample}>
                Example: 6♦ → 7♠ = 5 points (3+2)
              </Text>
            </View>

            <View style={styles.specialRule}>
              <Text style={styles.specialRuleTitle}>Control Transfer</Text>
              <Text style={styles.specialRuleText}>
                If someone overtakes your 6 or 7 with a higher card, they earn
                only 1 point
              </Text>
            </View>
          </View>
        )}

        {/* Game End Section */}
        {renderRuleSection(
          "Game End",
          "flag-checkered",
          <View>
            {renderBulletPoint(
              "If enough cards remain for 5 per player, start a new round"
            )}
            {renderBulletPoint(
              "If fewer than 10 cards remain, reshuffle the deck"
            )}
            {renderBulletPoint(
              "First player to reach the target score (e.g., 20 points) wins"
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <LinearGradient
          colors={["#FF4E50", "#F9D423"]}
          style={styles.backButtonGradient}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerGradient: {
    borderRadius: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  sectionCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionGradient: {
    borderRadius: 12,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  sectionContent: {
    paddingLeft: 5,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD700",
    marginTop: 7,
    marginRight: 8,
  },
  numberPoint: {
    minWidth: 20,
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 15,
  },
  bulletText: {
    flex: 1,
    color: "white",
    fontSize: 15,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "bold",
    color: "#FFD700",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  scoreCard: {
    width: width / 4,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  scoreCardText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  scoreCardPoints: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  specialRule: {
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 10,
  },
  specialRuleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 5,
  },
  specialRuleText: {
    color: "white",
    fontSize: 14,
    lineHeight: 19,
  },
  specialRuleExample: {
    color: "#FFD700",
    fontStyle: "italic",
    marginTop: 5,
    fontSize: 14,
  },
  backButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  backButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacer: {
    height: 100,
  },
});

export default RulesScreen;
