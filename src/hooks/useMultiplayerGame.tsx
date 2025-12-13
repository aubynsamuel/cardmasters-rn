import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCustomAlerts } from "../context/CustomAlertsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { saveGameRecord } from "../services/firestore";
import {
  CardsGameState,
  GameRecordPlayer,
  GameRecord,
} from "@/src/types/gamePlayTypes";
import { GameScreenProps } from "@/src/types/screenTypes";
import {
  GameStartedPayload,
  validPlay,
  PlayerLeftPayload,
} from "../types/serverPayloadTypes";

const RECONNECTION_RETRIES = 4;

export const useMultiplayerGame = () => {
  const navigation = useNavigation<GameScreenProps>();
  const route = useRoute();
  const { isConnected, socket, socketId } = useSocket();
  const { userId, userData } = useAuth();
  const { roomId, roomData } = route.params as GameStartedPayload;
  const [gameState, setGameState] = useState<CardsGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showAlert, showToast, hideAlert } = useCustomAlerts();
  const reconnectionRetries = useRef(0);
  const reconnectionTimeOut = useRef<NodeJS.Timeout>();
  const waitingReconnectionTimeOut = useRef<NodeJS.Timeout>();
  const thirtySecondsTimer = useRef<NodeJS.Timeout>();
  const reconnectionId = useRef<string | null | undefined>();
  const [reconnectionDisplay, setReconnectionDisplay] = useState({
    message: "",
    show: false,
  });

  useEffect(() => {
    reconnectionId.current = socketId;
    return () => {
      clearTimeout(waitingReconnectionTimeOut.current);
      clearTimeout(reconnectionTimeOut.current);
      clearTimeout(thirtySecondsTimer.current);
    };
  }, []);

  // Game over event handler
  useEffect(() => {
    if (!gameState) return;

    const currentPlayer = gameState.players.find(
      (player) => player.id === userId || player.id === socketId
    );

    const opponentPlayer = gameState.players.find(
      (player) => player.id !== userId && player.id !== socketId
    );

    if (!currentPlayer || !opponentPlayer) return;

    if (gameState.players.some((p) => p.score >= gameState.gameTo)) {
      const gameRecord: GameRecord = {
        dateString: new Date().toUTCString(),
        gameId: `game_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        mode: "multiplayer",
        playerCount: 2,
        targetScore: gameState.gameTo,
        winnerName:
          gameState.gameOverData.winner.name === userData?.displayName
            ? "You"
            : gameState.gameOverData.winner.name,
        winnerId: gameState.gameOverData.winner.id,
        players: playersListBuilder(),
      };

      // Retrieve existing records, append the new one, and save back
      AsyncStorage.getItem("gameRecord")
        .then(async (storedRecords) => {
          const records = storedRecords ? JSON.parse(storedRecords) : [];
          records.push(gameRecord); // Add the new record to the list
          return AsyncStorage.setItem("gameRecord", JSON.stringify(records));
        })
        .then(() => console.log("Record Stored"))
        .catch((error) => console.error("Error saving game record:", error));
      if (userId) {
        saveGameRecord(userId, gameRecord);
      }

      socket?.emit("game_ended", { roomId });
      const gameScoreList = gameState.players.map((player) => ({
        playerName: player.name,
        score: player.score,
      }));
      if (gameState.gameOverData) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "GameOver",
              params: {
                winner: gameState.gameOverData.winner,
                isCurrentPlayer:
                  gameState.gameOverData.winner.id === currentPlayer?.id,
                isMultiPlayer: true,
                score: gameScoreList,
                roomId: roomId,
                initialRoomData: roomData,
              },
            },
          ],
        });
      }
    }
  }, [gameState?.cardsPlayed, gameState?.players]);

  // Socket Events Registration and cleanup
  useEffect(() => {
    if (socket && isConnected) {
      socket.on("game_state_update", handleGameStateUpdate);
      socket.on("player_left", handlePlayerLeft);
      socket.on("play_error", handlePlayError);
      socket.on("disconnect", handleDisconnect);
      socket.on("reconnection_response", handleReconnectionResponse);
      socket.on("player_reconnected", handlePlayerReconnected);

      return () => {
        socket.off("game_state_update", handleGameStateUpdate);
        socket.off("player_left", handlePlayerLeft);
        socket.off("play_error", handlePlayError);
        socket.off("disconnect", handleDisconnect);
        socket?.off("reconnection_response", handleReconnectionResponse);
        socket.off("player_reconnected", handlePlayerReconnected);
      };
    }
  }, [socket, isConnected, roomId]);

  // Socket Event Handlers
  const handleReconnectionResponse = ({
    message,
    status,
  }: {
    message: string;
    status: string;
  }) => {
    if (status === "success") {
      // Reset all reconnection state
      setReconnectionDisplay({ message: message, show: true });
      if (message === "Reconnected Waiting for next round") {
        setTimeout(() => {
          setReconnectionDisplay({ show: false, message: "" });
        }, 8000);
      } else setReconnectionDisplay({ show: false, message: "" });

      clearTimeout(reconnectionTimeOut.current);
      reconnectionRetries.current = 0;
      reconnectionId.current = socketId;
      console.log("reconnection message");
      // showToast({ message, type: "success", duration: 3000 });
      setIsLoading(false);
    } else {
      handleReconnectionFailure(message);
    }
  };

  const handlePlayerReconnected = ({ message }: { message: string }) => {
    showToast({ message, type: "info" });
    clearTimeout(waitingReconnectionTimeOut.current);
    hideAlert();
    clearTimeout(thirtySecondsTimer.current);
    setReconnectionDisplay({ message: "", show: false });
  };

  const handlePlayError = ({ valid }: validPlay) => {
    showToast({
      message: valid.message,
      duration: 2000,
      type: "error",
    });
  };

  const handleGameStateUpdate = (newState: CardsGameState) => {
    clearTimeout(reconnectionTimeOut.current);
    setGameState((prev) => ({ ...prev, ...newState }));
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    reconnectionRetries.current = 0;
    console.log("[MultiPlayerGameScreen] Handling disconnect");
    reconnectToServer();
  };

  const handlePlayerLeft = (data: PlayerLeftPayload) => {
    if (data.userId === socket?.id) return;

    clearTimeout(waitingReconnectionTimeOut.current);

    if (data.updatedPlayers && data.updatedPlayers.length >= 2) {
      showToast({
        message: `${data.playerName} has lost connection`,
        type: "warning",
        duration: 3000,
      });

      setGameState((prevState) =>
        prevState
          ? {
              ...prevState,
              players: data.updatedPlayers,
            }
          : null
      );
    } else if (data.isIntentional) {
      showAlert({
        title: `${data.playerName} left the game`,
        message: "Not enough players to continue, Returning to lobby",
        type: "warning",
        buttons: [
          {
            text: "Ok",
            onPress: () => {
              socket?.emit("leave_room", { roomId });
              navigateToLobby();
              clearTimeout(thirtySecondsTimer.current);
            },
          },
        ],
      });
    } else {
      showToast({
        message: `${data.playerName} has lost connection reconnecting...`,
        type: "warning",
        duration: 3000,
      });

      thirtySecondsTimer.current = setTimeout(() => {
        handleReconnectionFailure(
          `${data.playerName} could not be reconnected`
        );
      }, 25000);

      waitingReconnectionTimeOut.current = setTimeout(() => {
        showAlert({
          title: `${data.playerName} has lost connection`,
          message: "Not enough players to continue",
          type: "error",
          buttons: [
            { text: "Wait", onPress: () => {}, negative: true },
            {
              text: "Leave Game",
              onPress: () => {
                socket?.emit("leave_room", { roomId });
                navigateToLobby();
                clearTimeout(thirtySecondsTimer.current);
              },
            },
          ],
        });
      }, 5000);
    }
  };

  // Helper Functions
  const reconnectToServer = () => {
    // Don't start a new reconnection if we've already reached the max retries
    if (reconnectionRetries.current >= RECONNECTION_RETRIES) {
      handleReconnectionFailure("Reconnection attempts exceeded");
      return;
    }

    // Update the display to show current reconnection attempt
    setReconnectionDisplay({
      message: `Reconnecting... (${reconnectionRetries.current}/3)`,
      show: true,
    });

    clearTimeout(reconnectionTimeOut.current);

    if (reconnectionId.current) {
      console.log(
        `[MultiPlayerGameScreen] Attempting reconnection ${reconnectionRetries.current}/3 with ID:`,
        reconnectionId.current
      );
      socket?.emit("reconnection", { savedId: reconnectionId.current });

      reconnectionRetries.current += 1;

      reconnectionTimeOut.current = setTimeout(() => {
        if (reconnectionRetries.current < RECONNECTION_RETRIES) {
          reconnectToServer();
        } else {
          handleReconnectionFailure(
            "Reconnection timed out after multiple attempts"
          );
        }
      }, 10000);
    } else {
      handleReconnectionFailure("No session information found");
    }
  };

  const handleReconnectionFailure = (message: string) => {
    clearTimeout(reconnectionTimeOut.current);
    showAlert({
      title: "Connection Lost",
      message: `${message}. Returning to lobby.`,
      type: "error",
      buttons: [
        {
          text: "OK",
          onPress: () => {
            navigateToLobby();
            socket?.emit("leave_room", { roomId });
          },
        },
      ],
    });
  };

  const navigateToLobby = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MultiplayerLobby" as never }],
    });
  };

  const QuitGameAlert = () => {
    showAlert({
      title: "Quit Game",
      message: "Do you want to quit game",
      type: "warning",
      buttons: [
        {
          text: "No",
          onPress: () => {},
        },
        {
          text: "Yes",
          negative: true,
          onPress: () => {
            socket?.emit("leave_room", { roomId });
            navigateToLobby();
          },
        },
      ],
    });
  };

  const playersListBuilder = () => {
    const playersList: GameRecordPlayer[] = [];
    if (!gameState || !gameState.players) return [];
    for (const player of gameState.players) {
      playersList.push({
        finalScore: player.score,
        id: player.id,
        name: player.name === userData?.displayName ? "You" : player.name,
        position: 1,
      });
    }
    return playersList;
  };

  return {
    gameState,
    isLoading,
    reconnectionDisplay,
    userId,
    socketId,
    socket,
    roomId,
    QuitGameAlert,
  };
};
