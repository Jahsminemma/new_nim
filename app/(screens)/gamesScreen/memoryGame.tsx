import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";

import { FontAwesome5, Ionicons } from "@expo/vector-icons";

export interface MemoryState {
  cards: [];
  flippedIndices: [];
  matchedPairs: [];
  moves: 0;
  gameOver: false;
  loading: boolean;
}

export interface IMemoryGameProps {
  setCurrentGame: (val: any) => void;
  generateMemoryCards: () => void;
  memoryState: MemoryState;
  setMemoryState: (val: MemoryState) => void;
}

const MemoryGame = ({
  setCurrentGame,
  generateMemoryCards,
  memoryState,
  setMemoryState,
}: IMemoryGameProps) => {
  useEffect(() => {
    setMemoryState(memoryState);
  }, [memoryState]);
  // Reset memory game
  const resetMemoryGame = () => {
    generateMemoryCards();
  };

  // Handle card flip in memory game
  const handleCardFlip = (index) => {
    // If already flipped, return
    if (
      memoryState.flippedIndices.includes(index) ||
      memoryState.matchedPairs.includes(memoryState.cards[index].pairId)
    ) {
      return;
    }

    // If already two cards flipped, return
    if (memoryState.flippedIndices.length === 2) {
      return;
    }

    // Add to flipped cards
    const newFlippedIndices = [...memoryState.flippedIndices, index];

    if (newFlippedIndices.length === 2) {
      // Check if match
      const firstCardId = memoryState.cards[newFlippedIndices[0]].pairId;
      const secondCardId = memoryState.cards[newFlippedIndices[1]].pairId;

      if (firstCardId === secondCardId) {
        // Match found
        const newMatchedPairs = [...memoryState.matchedPairs, firstCardId];
        const newMoves = memoryState.moves + 1;
        const gameOver =
          newMatchedPairs.length === memoryState.cards.length / 2;

        setTimeout(() => {
          setMemoryState((prev) => ({
            ...prev,
            flippedIndices: [],
            matchedPairs: newMatchedPairs,
            moves: newMoves,
            gameOver,
          }));

          if (gameOver) {
            let pointsToAward = 0;
    
            if (memoryState.moves <= 16) {
              pointsToAward = 10; // Perfect game
            } else if (memoryState.moves > 40) {
              pointsToAward = 2; // Many moves but completed
            } else {
              // Linear decrease from 10 to 2 points between 16 and 40 moves
              pointsToAward = Math.max(2, Math.round(10 - ((memoryState.moves - 16) / 24) * 8));
            }
          }
        }, 1000);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setMemoryState((prev) => ({
            ...prev,
            flippedIndices: [],
            moves: prev.moves + 1,
          }));
        }, 1500);
      }
    }

    setMemoryState((prev) => ({
      ...prev,
      flippedIndices: newFlippedIndices,
    }));
  };

  const renderMemoryGame = () => {
    if (!memoryState.cards || memoryState.cards.length === 0) {
      return (
        <View style={[styles.gameContainer, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>Generating memory game...</Text>
        </View>
      );
    }

    if (memoryState.gameOver) {
      return (
        <View style={[styles.gameContainer, styles.gameResultContainer]}>
          <Text style={styles.gameResultTitle}>Memory Game Complete!</Text>
          <Text style={styles.gameResultScore}>
            You completed the game in {memoryState.moves} moves!
          </Text>

          <View style={styles.gameResultStats}>
            <FontAwesome5 name="brain" size={64} color="#6A1B9A" />
            <Text style={styles.gameResultMessage}>
              {memoryState.moves <= memoryState.cards.length / 2 + 2
                ? "Amazing memory! Perfect performance!"
                : memoryState.moves <= memoryState.cards.length
                ? "Great job! Your memory is impressive."
                : "Good effort! Keep practicing to improve your memory."}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newGameButton}
            onPress={resetMemoryGame}
          >
            <Text style={styles.newGameButtonText}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToMenuButton}
            onPress={() => setCurrentGame(null)}
          >
            <Text style={styles.backToMenuButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Calculate grid dimensions based on card count
    const cardCount = memoryState.cards.length;
    const columns = cardCount <= 12 ? 3 : 4;

    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity
            onPress={() => setCurrentGame(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.gameTitle}>Knowledge Match</Text>
          <Text style={styles.memoryMoves}>Moves: {memoryState.moves}</Text>
        </View>

        <Text style={styles.memoryInstructions}>
          Match the related concepts by finding pairs
        </Text>

        <View
          style={[
            styles.memoryGrid,
            { width: columns * 85 + (columns - 1) * 10 },
          ]}
        >
          {memoryState.cards.map((card, index) => {
            const isFlipped = memoryState.flippedIndices.includes(index);
            const isMatched = memoryState.matchedPairs.includes(card.pairId);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.memoryCard,
                  isFlipped && styles.memoryCardFlipped,
                  isMatched && styles.memoryCardMatched,
                ]}
                onPress={() => handleCardFlip(index)}
                disabled={isFlipped || isMatched}
              >
                {isFlipped || isMatched ? (
                  <Text style={styles.memoryCardText}>{card.content}</Text>
                ) : (
                  <FontAwesome5 name="question" size={24} color="#6A1B9A" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {memoryState.flippedIndices.length === 2 &&
          memoryState.cards[memoryState.flippedIndices[0]].pairId ===
            memoryState.cards[memoryState.flippedIndices[1]].pairId && (
            <View style={styles.memoryExplanationContainer}>
              <Text style={styles.memoryExplanationTitle}>Connection:</Text>
              <Text style={styles.memoryExplanationText}>
                {memoryState.cards[memoryState.flippedIndices[0]].explanation}
              </Text>
            </View>
          )}
      </View>
    );
  };

  return <>{renderMemoryGame()}</>;
};

const styles = StyleSheet.create({
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  gameHeaderButton: {
    padding: 8,
  },
  gameProgress: {
    marginBottom: 16,
  },
  gameProgressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  gameProgressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  flashcard: {
    height: 300,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  flashcardInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  flashcardFront: {
    alignItems: "center",
    justifyContent: "center",
  },
  flashcardBack: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  flashcardWord: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5E35B1",
    marginBottom: 12,
    textAlign: "center",
  },
  flashcardPartOfSpeech: {
    fontSize: 18,
    color: "#9E9E9E",
    fontStyle: "italic",
    marginBottom: 20,
  },
  gameContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  flashcardInstructions: {
    fontSize: 14,
    color: "#9E9E9E",
    position: "absolute",
    bottom: 10,
  },
  flashcardDefinition: {
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  flashcardExampleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#689F38",
    marginBottom: 8,
  },
  flashcardExample: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#333",
    textAlign: "center",
  },
  flashcardControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginTop: 20,
  },
  flashcardButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  memoryMoves: {
    fontSize: 16,
    color: "#6A1B9A",
    fontWeight: "bold",
  },
  memoryInstructions: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  memoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  memoryCard: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#E1BEE7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9C27B0",
  },
  memoryCardFlipped: {
    backgroundColor: "#9C27B0",
  },
  memoryCardMatched: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
  },
  memoryCardText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    padding: 4,
  },
  memoryExplanationContainer: {
    backgroundColor: "#F3E5F5",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#9C27B0",
  },
  memoryExplanationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6A1B9A",
    marginBottom: 8,
  },
  memoryExplanationText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  gameResultContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  gameResultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  gameResultScore: {
    fontSize: 22,
    color: "#333",
    marginBottom: 32,
    textAlign: "center",
  },
  gameResultStats: {
    alignItems: "center",
    marginBottom: 40,
  },
  gameResultMessage: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 26,
  },
  newGameButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  newGameButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  backToMenuButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToMenuButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MemoryGame;
