import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { initializeAuth, type Persistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { environment } from "./environment";

type ReactNativePersistenceFactory = (
  storage: typeof ReactNativeAsyncStorage
) => Persistence;

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: ReactNativePersistenceFactory;
  }
).getReactNativePersistence;

// Initialize Firebase
const app = initializeApp(environment.firebase);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, auth, db };
