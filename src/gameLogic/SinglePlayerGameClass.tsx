import {
  chooseCardAI,
  createDeck,
  dealCards,
  shuffleDeck,
  suitSymbols,
} from "./GameUtils";
import {
  Card,
  gameHistoryType,
  Player,
  Play,
  GameScore,
  Suit,
  Deck,
} from "../Types";

export const GAME_TO = 10;

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
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  currentControl: Player;
  deck: Deck;
  gameOverData: GameOverData;
  canPlayCard: boolean;
}

export interface GameOverData {
  winner: Player;
  score: GameScore[];
  isCurrentPlayer: boolean;
  isMultiPlayer: boolean;
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
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  currentControl: Player;
  deck: Deck;
  callbacks: Callbacks;
  gameOverData: GameOverData;
  canPlayCard: boolean;

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
    this.accumulatedPoints = 0;
    this.lastPlayedSuit = null;
    this.currentControl = players[0];
    // Initialize gameState with empty arrays:
    this.deck = [];
    this.callbacks = {
      onStateChange: () => {},
      onRoundFinished: () => {},
    };
    this.gameOverData = {
      winner: this.players[0],
      score: [],
      isCurrentPlayer: false,
      isMultiPlayer: false,
    };
    this.canPlayCard = false;
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
      accumulatedPoints: this.accumulatedPoints,
      lastPlayedSuit: this.lastPlayedSuit,
      currentControl: this.currentControl,
      deck: this.deck,
      gameOverData: this.gameOverData,
      canPlayCard: this.canPlayCard,
    };
  }

  // Update state and notify React component
  updateState(newState: Partial<CardsGameUIState>): void {
    Object.assign(this, newState);
    this.callbacks.onStateChange(this.getState());
  }

  handleGameState(): void {
    if (!this.deck || this.deck.length < this.players.length * 5) {
      let newDeck: Card[] = createDeck();
      newDeck = shuffleDeck(newDeck);
      this.deck = newDeck;
    }
    const { hands, deck } = dealCards(this.players, this.deck);
    this.deck = deck;
    const updatedPlayers = this.players.map((player, idx) => ({
      ...player,
      hands: hands[idx],
    }));
    this.players = updatedPlayers;
  }

  startGame(): void {
    const needsShuffle = !this.deck || this.deck.length < 10;

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

        this.handleGameState();
        this.updateState({ isDealing: true });

        // Deal cards with animation
        setTimeout(() => {
          this.canPlayCard = this.currentControl.id === this.players[0].id;
          // End dealing animation after cards are shown
          setTimeout(() => {
            this.updateState({
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
    this.canPlayCard = true;
    this.updateState({
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
    this.canPlayCard = false;
    this.updateState({
      currentLeadCard: null,
      currentPlays: [],
    });
  }

  humanPlayCard(card: Card, index: number): { error: string; message: string } {
    if (this.gameOver) {
      return { error: "Game is over", message: " No more plays allowed." };
    }

    if (!this.canPlayCard) {
      return {
        error: "Error",
        message: "It is not your turn to play.",
      };
    }

    // If no one has played this round, only currentControl can play.
    if (
      this.currentPlays.length === 0 &&
      this.currentControl.id !== this.players[0].id
    ) {
      // Optionally: trigger an alert that only the round leader may start.
      return {
        error: "Error",
        message: "Only the round leader can play first.",
      };
    }

    // If this player has already played this round, disallow double play.
    if (
      this.currentPlays.some((play) => play.player.id === this.players[0].id)
    ) {
      // Optionally: trigger an alert that they've already played.
      return {
        error: "Error",
        message: "You have already played in this round.",
      };
    }

    // Enforce following suit if necessary
    if (this.currentLeadCard) {
      const requiredSuit = this.currentLeadCard.suit;
      const hasRequired = this.players[0].hands.some(
        (c) => c.suit === requiredSuit
      );

      if (hasRequired && card.suit !== requiredSuit) {
        // Optionally: trigger an alert that they must play the required suit.
        return {
          error: "Invalid Move",
          message: `You must play a ${requiredSuit} card if you have one.`,
        };
      } else {
        this.canPlayCard = false;
      }
    } else {
      this.canPlayCard = false;
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

    return { error: "", message: "" };
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
          this.canPlayCard = false;
          this.updateState({
            message: `${this.players[1].name} is playing.`,
          });
          setTimeout(() => {
            this.computerTurn();
          }, 1000);
        } else {
          this.canPlayCard = true;
          this.updateState({
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
    this.canPlayCard = false;
    this.updateState({
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
          isMultiPlayer: false,
        },
      });
    }
  }
}

export default CardsGame;
