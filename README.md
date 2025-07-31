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
