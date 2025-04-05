import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../AuthContext";
import { FirebaseError } from "firebase/app";
import { useNavigation } from "@react-navigation/native";
import { useCustomAlerts } from "../CustomAlertsContext";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigation = useNavigation();
  const { showAlert } = useCustomAlerts();

  const getFirebaseErrorMessage = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already in use. Please try another one.";
      case "auth/invalid-email":
        return "The email address is invalid.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/weak-password":
        return "The password is too weak. Please use a stronger password.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return error.message;
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    if (!email || !password) {
      showAlert({
        title: "Error",
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    if (!validateEmail(email)) {
      showAlert({
        title: "Error",
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    if (!validatePassword(password)) {
      showAlert({
        title: "Error",
        message: "Password must be at least 6 characters long",
        type: "error",
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      showAlert({
        title: "Error",
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigation.reset({
          index: 0,
          routes: [{ name: "MainMenu" as never }],
        });
      } else {
        await signup(email, password, displayName);
        navigation.reset({
          index: 0,
          routes: [{ name: "MainMenu" as never }],
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof FirebaseError
          ? getFirebaseErrorMessage(error)
          : "Authentication failed. Please try again.";

      showAlert({ title: "Error", message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setConfirmPassword("");
  };

  return (
    <LinearGradient colors={["#076324", "#076345"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.authContainer}>
            <Text style={styles.title}>CARD MASTER</Text>
            <Text style={styles.authTitle}>
              {isLogin ? "Login" : "Sign Up"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Display Name (optional)"
                placeholderTextColor="#aaa"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? "Login" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleAuthMode}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  authContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#076324",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 2,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  authButton: {
    backgroundColor: "#076324",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: "#076324",
    fontSize: 16,
  },
});

export default AuthScreen;
