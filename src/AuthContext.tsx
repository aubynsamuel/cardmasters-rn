import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

type UserData = {
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
};

type AuthContextType = {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setUserEmail(user.email);

        // Fetch additional user data from Firestore
        await fetchUserData(user);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserEmail(null);
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await AsyncStorage.setItem("userId", user.uid);
      await AsyncStorage.setItem("userEmail", user.email || "");
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      const userData: UserData = {
        email: email,
        displayName: displayName || "",
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "users", user.uid), userData);

      await AsyncStorage.setItem("userId", user.uid);
      await AsyncStorage.setItem("userEmail", email);
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userEmail");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        userEmail,
        userData,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
