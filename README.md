# Card Masters React Native

Card Masters is a trick-taking card game for Android. It includes single-player games against an AI and real-time multiplayer games for two to four players.

This project is the Expo Router recovery of the original `CardMaster` client. It preserves the existing interface, Firebase data, gameplay rules, and Socket.IO server contract.

## Requirements

- Node.js 22.13 or newer
- Expo Go with SDK 57 support on an Android device
- A Firebase project with Authentication and Firestore enabled
- The Card Masters Socket.IO server for multiplayer games

This recovery uses Expo Go. It does not require Gradle, Android Studio, a development build, or a generated `android` directory.

## Setup

Install dependencies:

```powershell
npm install
```

Copy `.env.example` to `.env`, then replace the example values:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
EXPO_PUBLIC_SERVER_URL=http://192.168.1.10:3000
```

Use a server address that the Android device can reach. `localhost` on a physical device points to the device itself, not the development computer.

## Run with Expo Go

Start Metro:

```powershell
npx expo start --clear
```

Open Expo Go on the Android device and scan the QR code. The device and development computer should normally be on the same network.

Start the multiplayer server separately from `CardsGameServer`:

```powershell
yarn dev
```

## Checks

Run the managed-workflow checks without invoking Gradle:

```powershell
npx tsc --noEmit
npm run lint
npm test
npx expo-doctor
```

## Main routes

- `/` — splash and session routing
- `/(auth)/sign-in` — registration and login
- `/(app)/menu` — main menu
- `/(app)/single-player` — local game against the AI
- `/(app)/multiplayer/lobby` — available multiplayer rooms
- `/(app)/multiplayer/room/[roomId]` — waiting room and chat
- `/(app)/multiplayer/game/[roomId]` — live multiplayer game
- `/(app)/profile`, `settings`, `rules`, and `stats` — account and supporting screens

## Data

Firebase Authentication owns user sessions. Firestore stores profiles and authenticated game records. AsyncStorage stores settings and local game records. The Socket.IO server remains authoritative for live multiplayer rooms and matches.
