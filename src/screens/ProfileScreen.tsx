import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userEmail, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate("Auth" as never);
    } catch {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => navigation.goBack()}
        activeOpacity={0.5}
      >
        <Ionicons name="arrow-back" size={25} />
      </TouchableOpacity>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={styles.profileCard}>
          <Text style={styles.title}>Your Profile</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>

          {userData?.displayName && (
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{userData.displayName}</Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Account Created:</Text>
            <Text style={styles.value}>
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#076324",
    marginBottom: 20,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    width: "40%",
  },
  value: {
    fontSize: 16,
    color: "#555",
    width: "60%",
  },
  logoutButton: {
    backgroundColor: "#076324",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
