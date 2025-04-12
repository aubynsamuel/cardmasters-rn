import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { FirebaseError } from "firebase/app";
import { useNavigation } from "@react-navigation/native";
import { useCustomAlerts } from "../context/CustomAlertsContext";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <LinearGradient
        colors={["#10b981", "#065f46"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-white">CARD MASTER</Text>
            <View className="w-20 h-1 mt-2 rounded-full bg-gold opacity-70" />
          </View>

          <View className="p-6 bg-white shadow-lg rounded-3xl">
            <Text className="mb-6 text-2xl font-bold text-center text-gray-800">
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="mb-1 ml-1 text-sm font-medium text-gray-600">
                  Email
                </Text>
                <TextInput
                  className="px-4 py-3 text-gray-800 border border-gray-200 bg-gray-50 rounded-xl"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {!isLogin && (
                <View>
                  <Text className="mb-1 ml-1 text-sm font-medium text-gray-600">
                    Display Name (optional)
                  </Text>
                  <TextInput
                    className="px-4 py-3 text-gray-800 border border-gray-200 bg-gray-50 rounded-xl"
                    placeholder="How others will see you"
                    placeholderTextColor="#9CA3AF"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View>
                <Text className="mb-1 ml-1 text-sm font-medium text-gray-600">
                  Password
                </Text>
                <TextInput
                  className="px-4 py-3 text-gray-800 border border-gray-200 bg-gray-50 rounded-xl"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              {!isLogin && (
                <View>
                  <Text className="mb-1 ml-1 text-sm font-medium text-gray-600">
                    Confirm Password
                  </Text>
                  <TextInput
                    className="px-4 py-3 text-gray-800 border border-gray-200 bg-gray-50 rounded-xl"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              className={`mt-6 rounded-xl py-4 ${
                isLogin ? "bg-emerald-600" : "bg-gold"
              }`}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`text-lg font-bold text-center ${
                    isLogin ? "text-white" : "bg-gold"
                  }`}
                >
                  {isLogin ? "Log In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleAuthMode}
              className="mt-6"
              activeOpacity={0.7}
            >
              <Text className="font-medium text-center text-emerald-600">
                {isLogin
                  ? "Don't have an account? Create one"
                  : "Already have an account? Log in"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-8 text-xs text-center text-white opacity-70">
            &copy; {new Date().getFullYear()} Card Master. All rights reserved.
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
