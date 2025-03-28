import {
  chooseCardAI,
  createDeck,
  dealCards,
  shuffleDeck,
  suitSymbols,
} from "../functions/GameFunctions";
import {
  Card,
  GameState,
  gameHistoryType,
  Player,
  Play,
  GameScore,
  Suit,
} from "../Types";

export const GAME_TO = 2;

export interface CardsGameUIState {
  players: Player[];
  currentPlays: Play[];
  currentLeadCard: Card | null;
  cardsPlayed: number;
  message: string;
  gameOver: boolean;
  gameHistory: gameHistoryType[];
  showStartButton: boolean;
  isShuffling: boolean;
  isDealing: boolean;
  canPlayCard: boolean;
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  currentControl: Player;
  gameState: GameState;
  gameOverData: GameOverData;
}

export interface GameOverData {
  winner: Player;
  score: GameScore[];
  isCurrentPlayer: boolean;
}

export type Callbacks = {
  onStateChange: (state: CardsGameUIState) => void;
  onRoundFinished: () => void;
};

class CardsGame {
  players: Player[];
  currentPlays: Play[];
  currentLeadCard: Card | null;
  currentCard: Card | null;
  cardsPlayed: number;
  message: string;
  gameOver: boolean;
  gameHistory: gameHistoryType[];
  showStartButton: boolean;
  isShuffling: boolean;
  isDealing: boolean;
  canPlayCard: boolean;
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  currentControl: Player;
  gameState: GameState;
  callbacks: Callbacks;
  gameOverData: GameOverData;

  constructor(players: Player[]) {
    this.players = players;
    this.currentPlays = [];
    this.currentLeadCard = null;
    this.currentCard = null;
    this.cardsPlayed = 0;
    this.message = "";
    this.gameOver = false;
    this.gameHistory = [];
    this.showStartButton = false;
    this.isShuffling = false;
    this.isDealing = false;
    this.canPlayCard = false;
    this.accumulatedPoints = 0;
    this.lastPlayedSuit = null;
    this.currentControl = players[0];
    // Initialize gameState with empty arrays:
    this.gameState = {
      computer: [],
      deck: [],
      human: [],
    };
    this.callbacks = {
      onStateChange: () => {},
      onRoundFinished: () => {},
    };
    this.gameOverData = {
      winner: this.players[0],
      score: [],
      isCurrentPlayer: false,
    };
  }

  // Register callbacks from the React component
  setCallbacks(callbacks: Partial<Callbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get current UI state for React component
  getState(): CardsGameUIState {
    return {
      players: this.players,
      currentPlays: this.currentPlays,
      currentLeadCard: this.currentLeadCard,
      cardsPlayed: this.cardsPlayed,
      message: this.message,
      gameOver: this.gameOver,
      gameHistory: this.gameHistory,
      showStartButton: this.showStartButton,
      isShuffling: this.isShuffling,
      isDealing: this.isDealing,
      canPlayCard: this.canPlayCard,
      accumulatedPoints: this.accumulatedPoints,
      lastPlayedSuit: this.lastPlayedSuit,
      currentControl: this.currentControl,
      gameState: this.gameState,
      gameOverData: this.gameOverData,
    };
  }

  // Update state and notify React component
  updateState(newState: Partial<CardsGameUIState>): void {
    Object.assign(this, newState);
    this.callbacks.onStateChange(this.getState());
  }

  handleGameState(): GameState {
    if (!this.gameState || this.gameState.deck.length < 10) {
      let newDeck: Card[] = createDeck();
      newDeck = shuffleDeck(newDeck);
      const updatedGameState: GameState = dealCards(newDeck);
      this.gameState = updatedGameState;
      return updatedGameState;
    } else {
      const updatedGameState: GameState = dealCards(this.gameState.deck);
      this.gameState = updatedGameState;
      return updatedGameState;
    }
  }

  startGame(): void {
    const needsShuffle = !this.gameState || this.gameState.deck.length < 10;

    this.updateState({
      cardsPlayed: 0,
      currentLeadCard: null,
      currentPlays: [],
      message: needsShuffle ? `Shuffling cards...` : "",
      gameOver: false,
      showStartButton: this.currentControl.id === this.players[1].id,
      gameHistory: [],
      isShuffling: needsShuffle,
      accumulatedPoints: 0,
      lastPlayedSuit: null,
    });

    // Show the shuffling animation for 2 seconds
    setTimeout(
      () => {
        this.updateState({
          isShuffling: false,
          message: `Dealing cards...`,
        });

        const gameState = this.handleGameState();
        this.updateState({ isDealing: true });

        // Deal cards with animation
        setTimeout(() => {
          const updatedPlayers = [...this.players];
          updatedPlayers[1] = {
            ...updatedPlayers[1],
            hands: gameState.computer,
          };
          updatedPlayers[0] = { ...updatedPlayers[0], hands: gameState.human };

          this.updateState({ players: updatedPlayers });

          // End dealing animation after cards are shown
          setTimeout(() => {
            this.updateState({
              canPlayCard: this.currentControl.id === this.players[0].id,
              isDealing: false,
              message:
                this.currentControl.id === this.players[1].id
                  ? "Press 'Start Game' to play"
                  : "Play a card to start",
            });
          }, 1500);
        }, 500);
      },
      needsShuffle ? 2000 : 50
    );
  }

  startPlaying(): void {
    this.updateState({ showStartButton: false });
    setTimeout(() => {
      this.computerTurn();
    }, 1500);
  }

  computerTurn(): void {
    if (this.players[1].hands.length === 0) {
      return;
    }

    const remainingRounds = 5 - this.cardsPlayed;
    let cardToPlay: Card;

    if (this.currentControl.id === this.players[1].id) {
      cardToPlay = chooseCardAI(this.players[1].hands, null, remainingRounds);
    } else {
      if (!this.currentLeadCard) {
        return;
      }
      cardToPlay = chooseCardAI(
        this.players[1].hands,
        this.currentLeadCard,
        remainingRounds
      );
    }

    const updatedPlayers = [...this.players];
    const newHand = [...updatedPlayers[1].hands];
    const cardIndex = newHand.findIndex(
      (card) => card.suit === cardToPlay.suit && card.rank === cardToPlay.rank
    );

    if (cardIndex !== -1) {
      newHand.splice(cardIndex, 1);
      updatedPlayers[1] = { ...updatedPlayers[1], hands: newHand };
      this.updateState({ players: updatedPlayers });
    }

    this.playCard(this.players[1], cardToPlay);
    this.updateState({
      canPlayCard: true,
      message: "It's your turn to play.",
    });
  }

  playCard(player: Player, card: Card): void {
    const newPlays: Play[] = [...this.currentPlays, { player, card }];
    const newLeadCard =
      this.currentLeadCard === null ? card : this.currentLeadCard;
    const newHistory: gameHistoryType[] = [
      ...this.gameHistory,
      {
        message: `${player.name} played ${card.rank}${suitSymbols[card.suit]}`,
        importance: false,
      },
    ];

    this.updateState({
      currentPlays: newPlays,
      currentLeadCard: newLeadCard,
      gameHistory: newHistory,
    });

    // If two cards have been played, finish the round
    if (newPlays.length === 2) {
      this.finishRound();
    }
  }

  calculateCardPoints(card: Card): number {
    if (card.rank === "6") return 3;
    if (card.rank === "7") return 2;
    return 1; // For ranks 8-K
  }

  resetRound(): void {
    this.updateState({
      canPlayCard: false,
      currentLeadCard: null,
      currentPlays: [],
    });
  }

  humanPlayCard(card: Card, index: number): boolean {
    if (this.gameOver) {
      return false;
    }

    if (
      this.currentControl.id === this.players[1].id &&
      !this.currentLeadCard
    ) {
      return false;
    }

    if (!this.canPlayCard) {
      return false;
    }

    // Enforce following suit if necessary
    if (this.currentLeadCard) {
      const requiredSuit = this.currentLeadCard.suit;
      const hasRequired = this.players[0].hands.some(
        (c) => c.suit === requiredSuit
      );

      if (hasRequired && card.suit !== requiredSuit) {
        return false;
      } else {
        this.updateState({ canPlayCard: false });
      }
    } else {
      this.updateState({ canPlayCard: false });
    }

    const updatedPlayers = [...this.players];
    const newHand = [...updatedPlayers[0].hands];
    newHand.splice(index, 1);
    updatedPlayers[0] = { ...updatedPlayers[0], hands: newHand };
    this.updateState({ players: updatedPlayers });

    setTimeout(() => {
      this.playCard(this.players[0], card);

      const isLeading = this.currentPlays.length === 1;
      if (isLeading) {
        this.currentCard = card;
        this.updateState({ message: `${this.players[1].name} is thinking...` });
        setTimeout(() => this.computerTurn(), 1000);
      }
    }, 300);

    return true;
  }

  finishRound(): void {
    const [firstPlay, secondPlay] = this.currentPlays;
    let newControl: Player;
    let resultMessage: string = "";
    let pointsEarned = 0;

    if (!this.currentLeadCard) {
      return;
    }

    const leadSuit = this.currentLeadCard.suit;
    const followerCard = secondPlay.card;

    if (
      followerCard.suit === leadSuit &&
      followerCard.value > this.currentLeadCard.value
    ) {
      newControl = secondPlay.player;
      resultMessage =
        secondPlay.player.id === this.players[1].id
          ? `${this.players[1].name} wins the round.`
          : "You win the round.";
    } else {
      newControl = firstPlay.player;
      resultMessage =
        firstPlay.player.id === this.players[0].id
          ? "You win the round."
          : `${this.players[1].name} wins the round.`;
    }

    let newAccumulatedPoints = this.accumulatedPoints;
    let newLastPlayedSuit = this.lastPlayedSuit;

    if (this.currentControl.id !== newControl.id) {
      newAccumulatedPoints = 0;
      newLastPlayedSuit = null;
    }

    const winningCard: Card =
      newControl.id === firstPlay.player.id ? firstPlay.card : secondPlay.card;

    const isControlTransfer =
      this.currentControl.id !== newControl.id &&
      (winningCard.rank === "6" || winningCard.rank === "7") &&
      winningCard.suit === leadSuit;

    if (isControlTransfer) {
      pointsEarned = 1;
      newAccumulatedPoints = 0;
    } else if (newControl.id === this.currentControl.id) {
      const cardPoints = this.calculateCardPoints(winningCard);
      if (winningCard.rank === "6" || winningCard.rank === "7") {
        if (this.lastPlayedSuit === winningCard.suit) {
          pointsEarned = cardPoints;
          newAccumulatedPoints = pointsEarned;
        } else {
          pointsEarned = cardPoints;
          newAccumulatedPoints = this.accumulatedPoints + pointsEarned;
        }
      } else {
        pointsEarned = 1;
        newAccumulatedPoints = 0;
      }
    } else {
      pointsEarned = 1;
      newAccumulatedPoints = 0;
    }

    if (winningCard.rank === "6" || winningCard.rank === "7") {
      newLastPlayedSuit = winningCard.suit;
    }

    const newHistory = [
      ...this.gameHistory,
      {
        message: `${newControl.name} Won Round ${this.cardsPlayed + 1}`,
        importance: true,
      },
    ];

    this.updateState({
      currentControl: newControl,
      message: resultMessage,
      gameHistory: newHistory,
      accumulatedPoints: newAccumulatedPoints,
      lastPlayedSuit: newLastPlayedSuit,
    });

    setTimeout(() => {
      this.resetRound();
      const newRoundsPlayed = this.cardsPlayed + 1;
      this.updateState({
        cardsPlayed: newRoundsPlayed > 5 ? 5 : newRoundsPlayed,
      });

      if (newRoundsPlayed >= 5) {
        this.handleGameOver(newControl, newAccumulatedPoints, pointsEarned);
      } else {
        if (newControl.id === this.players[1].id) {
          this.updateState({
            canPlayCard: false,
            message: `${this.players[1].name} is playing.`,
          });
          setTimeout(() => {
            this.computerTurn();
          }, 1000);
        } else {
          this.updateState({
            canPlayCard: true,
            message: "It's your turn to play.",
          });
        }
      }
    }, 1500);
  }

  handleGameOver(
    newControl: Player,
    newAccumulatedPoints: number,
    pointsEarned: number
  ): void {
    this.updateState({
      canPlayCard: false,
      gameOver: true,
      showStartButton: false,
    });

    const finalPoints =
      newAccumulatedPoints === 0 ? pointsEarned : newAccumulatedPoints;
    const updatedPlayers = [...this.players];
    let humanScore: number, computerScore: number;

    if (newControl.id === this.players[1].id) {
      computerScore = this.players[1].score + finalPoints;
      humanScore = this.players[0].score;
      updatedPlayers[1] = { ...updatedPlayers[1], score: computerScore };
    } else {
      computerScore = this.players[1].score;
      humanScore = this.players[0].score + finalPoints;
      updatedPlayers[0] = { ...updatedPlayers[0], score: humanScore };
    }

    this.updateState({
      players: updatedPlayers,
      message:
        newControl.id === this.players[0].id
          ? `🏆 You won this game with ${finalPoints} points! 🏆`
          : `🏆 ${this.players[1].name} won this game with ${finalPoints} points! 🏆`,
    });

    if (computerScore < GAME_TO && humanScore < GAME_TO) {
      setTimeout(() => {
        this.startGame();
      }, 1000);
    } else {
      this.updateState({
        message: `Game Over ${this.currentControl.name} won`,
        gameOverData: {
          winner: this.currentControl,
          score: [
            { playerName: this.players[0].name, score: humanScore },
            { playerName: this.players[1].name, score: computerScore },
          ],
          isCurrentPlayer: this.currentControl.id === this.players[0].id,
        },
      });
    }
  }
}

export default CardsGame;
