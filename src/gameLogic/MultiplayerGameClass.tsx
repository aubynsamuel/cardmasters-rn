import { createDeck, dealCards, shuffleDeck, suitSymbols } from "./GameUtils";
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
  accumulatedPoints: number;
  lastPlayedSuit: Suit | null;
  /** currentControl: the player who won the previous round*/
  currentControl: Player;
  /** activePlayerIndex indicates the “first” player for the round,
   *  but isn’t used for turn enforcement after currentControl’s move. */
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
      isMultiPlayer: true,
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
    // Reset activePlayerIndex for new round; currentControl remains as the leader from previous round.
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
            // Inform that it's the currentControl's turn to start the round.
            this.updateState({
              isDealing: false,
              message: `${this.currentControl.name} will play first`,
            });
          }, 1000);
        }, 1000);
      },
      needsShuffle ? 2000 : 50
    );
  }

  /**
   * - If no card has been played in the round (currentPlays is empty),
   *   only the currentControl is allowed to play.
   * - Once currentControl has played, any player who has not yet played this round is allowed.
   * - A player is prevented from playing more than once in the same round.
   */
  playerPlayCard(playerId: number, card: Card, index: number): boolean {
    if (this.gameOver) {
      return false;
    }

    // Determine which player is attempting the play.
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return false;
    }

    // If no one has played this round, only currentControl can play.
    if (this.currentPlays.length === 0 && this.currentControl.id !== playerId) {
      // Optionally: trigger an alert that only the round leader may start.
      return false;
    }

    // If this player has already played this round, disallow double play.
    if (this.currentPlays.some((play) => play.player.id === playerId)) {
      // Optionally: trigger an alert that they've already played.
      return false;
    }

    // Enforce following suit if necessary.
    if (this.currentLeadCard) {
      const requiredSuit = this.currentLeadCard.suit;
      const hasRequired = this.players[playerIndex].hands.some(
        (c) => c.suit === requiredSuit
      );
      if (hasRequired && card.suit !== requiredSuit) {
        // Optionally: trigger an alert that they must play the required suit.
        return false;
      }
    }

    // Remove the card from the player's hand.
    const updatedPlayers = [...this.players];
    const newHand = [...updatedPlayers[playerIndex].hands];
    newHand.splice(index, 1);
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      hands: newHand,
    };
    this.updateState({ players: updatedPlayers });

    // Delay slightly to simulate play action.
    setTimeout(() => {
      this.playCard(this.players[playerIndex], card);
    }, 300);

    return true;
  }

  /**
   * Registers a played card.
   * After currentControl’s card is played (i.e. when currentPlays was empty),
   * any subsequent player can play once until all players have played.
   */
  playCard(player: Player, card: Card): void {
    const newPlays: Play[] = [...this.currentPlays, { player, card }];
    const newLeadCard =
      this.currentPlays.length === 0 ? card : this.currentLeadCard;
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

    // If all players have played, finish the round.
    if (newPlays.length === this.players.length) {
      this.finishRound();
    } else {
      // We no longer enforce a strict next-player turn order.
      // The UI should simply allow any player who hasn't played to make a move.
      this.updateState({
        message: `Waiting for opponents to play...`,
      });
    }
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

  finishRound(): void {
    if (this.currentPlays.length === 0 || !this.currentLeadCard) {
      return;
    }

    const leadSuit = this.currentLeadCard.suit;

    // Determine the winning play among plays that follow the lead suit.
    let winningPlayIndex = 0;
    let highestValue = this.currentPlays[0].card.value;

    for (let i = 1; i < this.currentPlays.length; i++) {
      const play = this.currentPlays[i];
      // Only compare cards of the lead suit.
      if (play.card.suit === leadSuit && play.card.value > highestValue) {
        winningPlayIndex = i;
        highestValue = play.card.value;
      }
    }

    const winningPlay = this.currentPlays[winningPlayIndex];
    const winningPlayer = winningPlay.player;
    const winningCard = winningPlay.card;

    // Set currentControl for the next round.
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

    // Set activePlayerIndex to the winner for the next round.
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
        // In the next round, currentControl must start.
        this.updateState({
          message: `${this.currentControl.name} will play first`,
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
      gameOver: true,
      showStartButton: true,
    });

    const finalPoints =
      newAccumulatedPoints === 0 ? pointsEarned : newAccumulatedPoints;
    const updatedPlayers = [...this.players];

    // Update the winning player's score.
    const winnerIndex = updatedPlayers.findIndex((p) => p.id === newControl.id);
    updatedPlayers[winnerIndex] = {
      ...updatedPlayers[winnerIndex],
      score: updatedPlayers[winnerIndex].score + finalPoints,
    };

    this.updateState({
      players: updatedPlayers,
      message: `🏆 ${newControl.name} won this game with ${finalPoints} points! 🏆`,
    });

    // Check if any player has reached the winning score.
    const gameWinner = updatedPlayers.find((p) => p.score >= GAME_TO);

    if (!gameWinner) {
      setTimeout(() => {
        this.startGame();
      }, 3000);
    } else {
      // Game over, someone has won the entire match.
      const scores: GameScore[] = updatedPlayers.map((p) => ({
        playerName: p.name,
        score: p.score,
      }));

      this.updateState({
        message: `Game Over! ${gameWinner.name} won the match!`,
        gameOverData: {
          winner: gameWinner,
          score: scores,
          isCurrentPlayer: false,
          isMultiPlayer: true,
        },
      });
    }
  }

  // Reset the entire game, for use after a complete match.
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
