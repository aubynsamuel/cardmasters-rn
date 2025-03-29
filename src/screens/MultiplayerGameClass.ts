import {
  createDeck,
  dealCards,
  shuffleDeck,
  suitSymbols,
} from "../functions/GameFunctions";
import {
  Card,
  gameHistoryType,
  Player,
  Play,
  GameScore,
  Suit,
  Deck,
  Callbacks,
  GameOverData,
  CardsGameState,
} from "../Types";

export const GAME_TO = 10;

class MultiplayerCardsGame {
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
  activePlayerIndex: number;
  deck: Deck;
  callbacks: Callbacks;
  gameOverData: GameOverData;

  constructor(players: Player[]) {
    if (players.length < 2) {
      throw new Error("Game requires at least 2 players");
    }

    this.players = players;
    this.currentPlays = [];
    this.currentLeadCard = null;
    this.currentCard = null;
    this.cardsPlayed = 0;
    this.message = "";
    this.gameOver = false;
    this.gameHistory = [];
    this.showStartButton = true;
    this.isShuffling = false;
    this.isDealing = false;
    this.canPlayCard = false;
    this.accumulatedPoints = 0;
    this.lastPlayedSuit = null;
    this.currentControl = players[0];
    this.activePlayerIndex = 0;
    this.deck = [];
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

  // Register callbacks from the React component/websocket server
  setCallbacks(callbacks: Partial<Callbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get current UI state for React component/websocket server
  getState(): CardsGameState {
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
      activePlayerIndex: this.activePlayerIndex,
      deck: this.deck,
      gameOverData: this.gameOverData,
    };
  }

  // Update state and notify React component/websocket server
  updateState(newState: Partial<CardsGameState>): void {
    Object.assign(this, newState);
    this.callbacks.onStateChange(this.getState());
  }

  handleGameState(): void {
    // Calculate minimum cards needed for all players
    const minCardsNeeded = this.players.length * 5;

    if (!this.deck || this.deck.length < minCardsNeeded) {
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
    const needsShuffle =
      !this.deck || this.deck.length < this.players.length * 5;
    this.activePlayerIndex = 0;

    this.updateState({
      cardsPlayed: 0,
      currentLeadCard: null,
      currentPlays: [],
      message: needsShuffle ? `Shuffling cards...` : "",
      gameOver: false,
      showStartButton: false,
      gameHistory: [],
      isShuffling: needsShuffle,
      accumulatedPoints: 0,
      lastPlayedSuit: null,
      currentControl: this.players[0],
      activePlayerIndex: 0,
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
          // End dealing animation after cards are shown
          setTimeout(() => {
            this.updateState({
              canPlayCard: true,
              isDealing: false,
              message: `${
                this.players[this.activePlayerIndex].name
              }'s turn to play`,
            });
          }, 1000);
        }, 1000);
      },
      needsShuffle ? 2000 : 50
    );
  }

  playCard(player: Player, card: Card): void {
    /** TODO: add a condition to check if currentPlays is equal to the length of players to avoid
    double plays (a player playing more than one card in a round)
    might rather check to see if that player has already played since that will
    be a better check to avoiding double plays */
    // TODO: return true if play was and false if play wasn't
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

    // Move to next player or finish round if all players have played
    if (newPlays.length === this.players.length) {
      this.finishRound();
    } else {
      this.moveToNextPlayer();
    }
  }

  moveToNextPlayer(): void {
    const nextPlayerIndex = (this.activePlayerIndex + 1) % this.players.length;

    this.updateState({
      activePlayerIndex: nextPlayerIndex,
      message: `${this.players[nextPlayerIndex].name}'s turn to play`,
    });
  }

  calculateCardPoints(card: Card): number {
    if (card.rank === "6") return 3;
    if (card.rank === "7") return 2;
    return 1; // For ranks 8-K
  }

  resetRound(): void {
    this.updateState({
      currentLeadCard: null,
      currentPlays: [],
    });
  }

  playerPlayCard(playerId: number, card: Card, index: number): boolean {
    if (this.gameOver) {
      return false;
    }

    // Check if it's this player's turn
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== this.activePlayerIndex) {
      //  TODO: Show an alert to the player that its not their turn to play
      return false;
    }

    // Enforce following suit if necessary
    if (this.currentLeadCard) {
      const requiredSuit = this.currentLeadCard.suit;
      const hasRequired = this.players[playerIndex].hands.some(
        (c) => c.suit === requiredSuit
      );

      if (hasRequired && card.suit !== requiredSuit) {
        // TODO: Show an alert to the player that they must play the required suit if they have it
        return false;
      }
    }

    // Remove the card from the player's hand
    // TODO: Make playCard return if play was successful before removing card from players hand
    const updatedPlayers = [...this.players];
    const newHand = [...updatedPlayers[playerIndex].hands];
    newHand.splice(index, 1);
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      hands: newHand,
    };
    this.updateState({ players: updatedPlayers });

    // Play the card
    // TODO: Must be performed before attempting to remove card from players hand
    setTimeout(() => {
      this.playCard(this.players[playerIndex], card);
    }, 300);

    return true;
  }

  finishRound(): void {
    if (this.currentPlays.length === 0 || !this.currentLeadCard) {
      return;
    }

    const leadSuit = this.currentLeadCard.suit;

    // Find the winner of the round
    let winningPlayIndex = 0;
    let highestValue = this.currentPlays[0].card.value;

    for (let i = 1; i < this.currentPlays.length; i++) {
      const play = this.currentPlays[i];
      // Only compare cards of the lead suit
      if (play.card.suit === leadSuit && play.card.value > highestValue) {
        winningPlayIndex = i;
        highestValue = play.card.value;
      }
    }

    const winningPlay = this.currentPlays[winningPlayIndex];
    const winningPlayer = winningPlay.player;
    const winningCard = winningPlay.card;

    const newControl = winningPlayer;
    const resultMessage = `${winningPlayer.name} wins the round.`;

    let newAccumulatedPoints = this.accumulatedPoints;
    let newLastPlayedSuit = this.lastPlayedSuit;
    let pointsEarned = 0;

    if (this.currentControl.id !== newControl.id) {
      newAccumulatedPoints = 0;
      newLastPlayedSuit = null;
    }

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

    // Set the active player to the winner for the next round
    const winnerIndex = this.players.findIndex(
      (p) => p.id === winningPlayer.id
    );

    this.updateState({
      currentControl: newControl,
      activePlayerIndex: winnerIndex,
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
        this.updateState({
          canPlayCard: true,
          message: `${this.players[winnerIndex].name}'s turn to play`,
        });
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
      showStartButton: true,
    });

    const finalPoints =
      newAccumulatedPoints === 0 ? pointsEarned : newAccumulatedPoints;
    const updatedPlayers = [...this.players];

    // Update the winning player's score
    const winnerIndex = updatedPlayers.findIndex((p) => p.id === newControl.id);
    updatedPlayers[winnerIndex] = {
      ...updatedPlayers[winnerIndex],
      score: updatedPlayers[winnerIndex].score + finalPoints,
    };

    this.updateState({
      players: updatedPlayers,
      message: `🏆 ${newControl.name} won this game with ${finalPoints} points! 🏆`,
    });

    // Check if any player has reached the winning score
    const gameWinner = updatedPlayers.find((p) => p.score >= GAME_TO);

    if (!gameWinner) {
      setTimeout(() => {
        this.startGame();
      }, 3000);
    } else {
      // Game over, someone has won the entire match
      const scores: GameScore[] = updatedPlayers.map((p) => ({
        playerName: p.name,
        score: p.score,
      }));

      this.updateState({
        message: `Game Over! ${gameWinner.name} won the match!`,
        gameOverData: {
          winner: gameWinner,
          score: scores,
          isCurrentPlayer: false, // This doesn't make sense in multiplayer context
        },
      });
    }
  }

  // Reset the entire game, for use after a complete match
  resetGame(): void {
    const resetPlayers = this.players.map((player) => ({
      ...player,
      score: 0,
      hands: [],
    }));

    this.players = resetPlayers;
    this.currentPlays = [];
    this.currentLeadCard = null;
    this.currentCard = null;
    this.cardsPlayed = 0;
    this.gameOver = false;
    this.gameHistory = [];
    this.showStartButton = true;
    this.accumulatedPoints = 0;
    this.lastPlayedSuit = null;
    this.currentControl = resetPlayers[0];
    this.activePlayerIndex = 0;
    this.deck = [];

    this.updateState({
      message: "New game ready to start!",
    });
  }
}

export default MultiplayerCardsGame;
