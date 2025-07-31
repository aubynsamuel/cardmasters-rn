# Card Masters

A React Native trick-taking card game built with Expo and Firebase.

## Overview

Card Masters is a multiplayer card game where players compete to reach a target score by strategically controlling tricks and accumulating points. The game supports both single-player (vs AI) and multiplayer modes.

<!-- ## Screenshots -->

## Rules and Gameplay

[Read the rules and gameplay details here](Game_Play_Rules.md).

## Tech Stack

- **Frontend**: React Native with Expo
- **Authentication**: Firebase Authentication
- **State Management**: Zustand
- **Multiplayer Mode**: Socket.io websockets
- **Game Stats**: Firebase Firestore

## Multiplayer Setup

This project requires a game server for multiplayer functionality. The game server is available at [aubynsamuel/cards-game-server](https://github.com/aubynsamuel/cards-game-server).

### Prerequisites for Multiplayer

1. **Game Server**: Clone and set up the game server from the repository above
2. **Environment Configuration**: Update your `.env` file with the server URL

### Configuration

Add the server URL to your `.env` file:

```.env
SERVER_URL=http://localhost:3000
```

### Game Server Setup

1. **Start the Game Server**

   ```bash
   # Clone the game server
   git clone https://github.com/aubynsamuel/cards-game-server.git
   cd cards-game-server
   
   # Install dependencies
   npm install
   
   # Start the server
   npm start
   ```

2. **Start Development**

   ```bash
   npm start
   ```

### Socket Configuration

The client uses Socket.io for real-time communication. The connection is managed through the SocketContext provider which:

- Establishes websocket connection to the game server
- Handles connection/disconnection events
- Provides socket state to child components
- Manages reconnection logic

### Environment Variables

Add the following environment variables to your `.env` file:

```.env
SERVER_URL=http://localhost:3000           # Local development adjust if needed
SERVER_URL=https://your-server.com         # Production server
```

### Testing Multiplayer

1. Start the game server
2. Run the client with `npm start`
3. Open multiple instances (devices/emulators) to test multiplayer functionality
4. Create or join game rooms through the app interface

## Development Setup

### Prerequisites

- Node.js
- Firebase

### Installation

```bash
# Clone repository
git clone [repository-url]
cd cardmasters-rn

# Install dependencies
npm install

# Start development server
npm start
```

### Firebase Configuration

Create `.env` file:
Set up a Firebase project and add project configuration details.

```.env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
