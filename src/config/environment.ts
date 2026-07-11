const requireValue = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const environment = {
  firebase: {
    apiKey: requireValue(
      "EXPO_PUBLIC_FIREBASE_API_KEY",
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY
    ),
    authDomain: requireValue(
      "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
    ),
    projectId: requireValue(
      "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
    ),
    storageBucket: requireValue(
      "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
    ),
    messagingSenderId: requireValue(
      "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    ),
    appId: requireValue(
      "EXPO_PUBLIC_FIREBASE_APP_ID",
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID
    ),
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  serverUrl: requireValue(
    "EXPO_PUBLIC_SERVER_URL",
    process.env.EXPO_PUBLIC_SERVER_URL
  ),
} as const;
