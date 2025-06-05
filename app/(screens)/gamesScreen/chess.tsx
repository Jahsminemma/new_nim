import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome5 } from "@expo/vector-icons";

interface ICheSSGameProps {
  setCurrentGame: (value: any) => void;
}

interface ChessPiece {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
}

interface ChessState {
  board: (ChessPiece | null)[];
  selectedPiece: number | null;
  possibleMoves: number[];
  turn: 'white' | 'black';
  gameOver: boolean;
  lastMove: { from: number; to: number } | null;
  inCheck: boolean;
  canCastle: {
    white: { kingside: boolean; queenside: boolean };
    black: { kingside: boolean; queenside: boolean };
  };
  winner: 'white' | 'black' | null;
  gameEndReason: 'checkmate' | 'stalemate' | 'resignation' | null;
}

const ChessGame = ({ setCurrentGame }: ICheSSGameProps) => {

      const [chessState, setChessState] = useState<ChessState>({
        board: initialChessBoard(),
        selectedPiece: null,
        possibleMoves: [],
        turn: "white",
        gameOver: false,
        lastMove: null,
        inCheck: false,
        canCastle: {
          white: { kingside: true, queenside: true },
          black: { kingside: true, queenside: true },
        },
        winner: null,
        gameEndReason: null,
      });
    
      // Initial chess board setup
      function initialChessBoard() {
        const board = Array(64).fill(null);
    
        // Set up pawns
        for (let i = 8; i < 16; i++) {
          board[i] = { type: "pawn", color: "black" };
        }
        for (let i = 48; i < 56; i++) {
          board[i] = { type: "pawn", color: "white" };
        }
    
        // Set up rooks
        board[0] = board[7] = { type: "rook", color: "black" };
        board[56] = board[63] = { type: "rook", color: "white" };
    
        // Set up knights
        board[1] = board[6] = { type: "knight", color: "black" };
        board[57] = board[62] = { type: "knight", color: "white" };
    
        // Set up bishops
        board[2] = board[5] = { type: "bishop", color: "black" };
        board[58] = board[61] = { type: "bishop", color: "white" };
    
        // Set up queens
        board[3] = { type: "queen", color: "black" };
        board[59] = { type: "queen", color: "white" };
    
        // Set up kings
        board[4] = { type: "king", color: "black" };
        board[60] = { type: "king", color: "white" };
    
        return board;
      }

        // Render chess piece with proper icons
        const renderChessPiece = (piece: ChessPiece) => {
          const color = piece.color === "white" ? "#FFFFFF" : "#000000";
          const backgroundColor = piece.color === "white" ? "#FFFFFFAA" : "#00000033";
          let iconName;
      
          switch (piece.type) {
            case "pawn":
              iconName = "chess-pawn";
              break;
            case "rook":
              iconName = "chess-rook";
              break;
            case "knight":
              iconName = "chess-knight";
              break;
            case "bishop":
              iconName = "chess-bishop";
              break;
            case "queen":
              iconName = "chess-queen";
              break;
            case "king":
              iconName = "chess-king";
              break;
            default:
              return null;
          }
      
          return (
            <View style={[styles.chessPieceContainer, { backgroundColor }]}>
              <FontAwesome5
                name={iconName}
                size={28}
                color={color}
                style={styles.chessPiece}
              />
            </View>
          );
        };
      
    
      const handleChessSelect = (index: number) => {
        const piece = chessState.board[index];
    
        if (piece && piece.color === chessState.turn) {
          const possibleMoves = getValidMoves(
            index,
            chessState.board,
            chessState.turn
          );
          setChessState((prev) => ({
            ...prev,
            selectedPiece: index,
            possibleMoves,
          }));
        }
        // If a piece is already selected and clicking on a possible move
        else if (
          chessState.selectedPiece !== null &&
          chessState.possibleMoves.includes(index)
        ) {
          moveChessPiece(chessState.selectedPiece, index);
        }
        // If clicking elsewhere, deselect
        else {
          setChessState((prev) => ({
            ...prev,
            selectedPiece: null,
            possibleMoves: [],
          }));
        }
      };
    
      // Get basic moves for a piece without check validation
      const getBasicMoves = (index: number, board: (ChessPiece | null)[], turn: 'white' | 'black'): number[] => {
        const piece = board[index];
        if (!piece || piece.color !== turn) return [];
    
        const moves: number[] = [];
        const row = Math.floor(index / 8);
        const col = index % 8;
    
        // Handle pawn moves
        if (piece.type === "pawn") {
          const direction = piece.color === "white" ? -1 : 1;
          const oneStepIndex = index + direction * 8;
    
          // Move one step forward
          if (oneStepIndex >= 0 && oneStepIndex < 64 && !board[oneStepIndex]) {
            moves.push(oneStepIndex);
    
            // Initial two-step move
            const startRow = piece.color === "white" ? 6 : 1;
            if (row === startRow) {
              const twoStepIndex = index + direction * 16;
              if (!board[twoStepIndex]) {
                moves.push(twoStepIndex);
              }
            }
          }
    
          // Captures
          const captureLeft = index + direction * 8 - 1;
          if (
            captureLeft >= 0 &&
            captureLeft < 64 &&
            Math.floor(captureLeft / 8) === row + direction &&
            board[captureLeft] &&
            board[captureLeft]?.color !== piece.color
          ) {
            moves.push(captureLeft);
          }
    
          const captureRight = index + direction * 8 + 1;
          if (
            captureRight >= 0 &&
            captureRight < 64 &&
            Math.floor(captureRight / 8) === row + direction &&
            board[captureRight] &&
            board[captureRight]?.color !== piece.color
          ) {
            moves.push(captureRight);
          }
    
          // En passant
          if (chessState.lastMove) {
            const lastMove = chessState.lastMove;
            const lastPiece = board[lastMove.to];
            if (
              lastPiece?.type === 'pawn' &&
              Math.abs(lastMove.from - lastMove.to) === 16 &&
              Math.abs(lastMove.to - index) === 1 &&
              Math.floor(lastMove.to / 8) === row
            ) {
              moves.push(lastMove.to + direction * 8);
            }
          }
        }
    
        // Rook moves (horizontal and vertical)
        if (piece.type === "rook") {
          const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 },  // right
          ];
    
          for (const dir of directions) {
            let currentRow = row + dir.row;
            let currentCol = col + dir.col;
    
            while (
              currentRow >= 0 &&
              currentRow < 8 &&
              currentCol >= 0 &&
              currentCol < 8
            ) {
              const moveIndex = currentRow * 8 + currentCol;
              const targetPiece = board[moveIndex];
              
              if (!targetPiece) {
                moves.push(moveIndex);
              } else {
                if (targetPiece.color !== piece.color) {
                  moves.push(moveIndex);
                }
                break;
              }
    
              currentRow += dir.row;
              currentCol += dir.col;
            }
          }
        }
    
        // Bishop moves (diagonal)
        if (piece.type === "bishop") {
          const directions = [
            { row: -1, col: -1 }, // up-left
            { row: -1, col: 1 },  // up-right
            { row: 1, col: -1 },  // down-left
            { row: 1, col: 1 },   // down-right
          ];
    
          for (const dir of directions) {
            let currentRow = row + dir.row;
            let currentCol = col + dir.col;
    
            while (
              currentRow >= 0 &&
              currentRow < 8 &&
              currentCol >= 0 &&
              currentCol < 8
            ) {
              const moveIndex = currentRow * 8 + currentCol;
              const targetPiece = board[moveIndex];
              
              if (!targetPiece) {
                moves.push(moveIndex);
              } else {
                if (targetPiece.color !== piece.color) {
                  moves.push(moveIndex);
                }
                break;
              }
    
              currentRow += dir.row;
              currentCol += dir.col;
            }
          }
        }
    
        // Queen moves (combination of rook and bishop)
        if (piece.type === "queen") {
          const directions = [
            { row: -1, col: 0 },  // up
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 },  // left
            { row: 0, col: 1 },   // right
            { row: -1, col: -1 }, // up-left
            { row: -1, col: 1 },  // up-right
            { row: 1, col: -1 },  // down-left
            { row: 1, col: 1 },   // down-right
          ];
    
          for (const dir of directions) {
            let currentRow = row + dir.row;
            let currentCol = col + dir.col;
    
            while (
              currentRow >= 0 &&
              currentRow < 8 &&
              currentCol >= 0 &&
              currentCol < 8
            ) {
              const moveIndex = currentRow * 8 + currentCol;
              const targetPiece = board[moveIndex];
              
              if (!targetPiece) {
                moves.push(moveIndex);
              } else {
                if (targetPiece.color !== piece.color) {
                  moves.push(moveIndex);
                }
                break;
              }
    
              currentRow += dir.row;
              currentCol += dir.col;
            }
          }
        }
    
        // King moves (one square in any direction)
        if (piece.type === "king") {
          const directions = [
            { row: -1, col: 0 },  // up
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 },  // left
            { row: 0, col: 1 },   // right
            { row: -1, col: -1 }, // up-left
            { row: -1, col: 1 },  // up-right
            { row: 1, col: -1 },  // down-left
            { row: 1, col: 1 },   // down-right
          ];
    
          for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
    
            if (
              newRow >= 0 &&
              newRow < 8 &&
              newCol >= 0 &&
              newCol < 8
            ) {
              const moveIndex = newRow * 8 + newCol;
              const targetPiece = board[moveIndex];
              
              if (!targetPiece || targetPiece.color !== piece.color) {
                moves.push(moveIndex);
              }
            }
          }
    
          // Castling
          const castlingRights = chessState.canCastle[piece.color];
          const castlingRow = piece.color === 'white' ? 7 : 0;
    
          // Kingside castling
          if (castlingRights.kingside) {
            if (!board[castlingRow * 8 + 5] && !board[castlingRow * 8 + 6]) {
              moves.push(castlingRow * 8 + 6);
            }
          }
    
          // Queenside castling
          if (castlingRights.queenside) {
            if (!board[castlingRow * 8 + 1] && !board[castlingRow * 8 + 2] && !board[castlingRow * 8 + 3]) {
              moves.push(castlingRow * 8 + 2);
            }
          }
        }
    
        // Knight moves (L shape)
        if (piece.type === "knight") {
          const knightMoves = [
            { row: row - 2, col: col - 1 },
            { row: row - 2, col: col + 1 },
            { row: row - 1, col: col - 2 },
            { row: row - 1, col: col + 2 },
            { row: row + 1, col: col - 2 },
            { row: row + 1, col: col + 2 },
            { row: row + 2, col: col - 1 },
            { row: row + 2, col: col + 1 },
          ];
    
          knightMoves.forEach((move) => {
            if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
              const moveIndex = move.row * 8 + move.col;
              const targetPiece = board[moveIndex];
              if (!targetPiece || targetPiece.color !== piece.color) {
                moves.push(moveIndex);
              }
            }
          });
        }
    
        return moves;
      };
    
      // Check if a king is in check
      const isKingInCheck = (board: (ChessPiece | null)[], color: 'white' | 'black'): boolean => {
        // Find the king
        const kingIndex = board.findIndex(
          (piece) => piece?.type === 'king' && piece?.color === color
        );
        if (kingIndex === -1) return false;
    
        // Check if any opponent piece can capture the king
        for (let i = 0; i < 64; i++) {
          const piece = board[i];
          if (piece && piece.color !== color) {
            const moves = getBasicMoves(i, board, piece.color);
            if (moves.includes(kingIndex)) {
              return true;
            }
          }
        }
        return false;
      };
    
      // Check if a move would put/leave the king in check
      const isMoveLegal = (fromIndex: number, toIndex: number, board: (ChessPiece | null)[]): boolean => {
        const piece = board[fromIndex];
        if (!piece) return false;
    
        const newBoard = [...board];
        newBoard[toIndex] = newBoard[fromIndex];
        newBoard[fromIndex] = null;
    
        return !isKingInCheck(newBoard, piece.color);
      };
    
      // Get valid moves for chess pieces with check validation
      const getValidMoves = (index: number, board: (ChessPiece | null)[], turn: 'white' | 'black'): number[] => {
        const basicMoves = getBasicMoves(index, board, turn);
        return basicMoves.filter(move => {
          // Check if the move would leave the king in check
          if (!isMoveLegal(index, move, board)) {
            return false;
          }

          // Check if the move would expose a valuable piece to capture
          const piece = board[index];
          if (!piece) return false;

          // If the piece is valuable (not a pawn), check if moving it would expose other pieces
          if (piece.type !== 'pawn') {
            const newBoard = [...board];
            newBoard[move] = newBoard[index];
            newBoard[index] = null;

            // Check if any friendly pieces would be exposed to capture
            for (let i = 0; i < 64; i++) {
              const friendlyPiece = newBoard[i];
              if (friendlyPiece && friendlyPiece.color === turn) {
                // Check if any opponent piece can capture this friendly piece
                for (let j = 0; j < 64; j++) {
                  const opponentPiece = newBoard[j];
                  if (opponentPiece && opponentPiece.color !== turn) {
                    const opponentMoves = getBasicMoves(j, newBoard, opponentPiece.color);
                    if (opponentMoves.includes(i)) {
                      // If the piece is valuable, avoid exposing it
                      if (friendlyPiece.type !== 'pawn') {
                        return false;
                      }
                    }
                  }
                }
              }
            }
          }

          return true;
        });
      };
    
      // Handle pawn promotion
      const handlePawnPromotion = (index: number, color: 'white' | 'black'): ChessPiece => {
        return { type: 'queen', color };
      };
    
      // Update castling rights
      const updateCastlingRights = (board: (ChessPiece | null)[], fromIndex: number, toIndex: number) => {
        const piece = board[fromIndex];
        if (!piece) return chessState.canCastle;
    
        const newCastlingRights = { ...chessState.canCastle };
    
        // If king moves, lose all castling rights
        if (piece.type === 'king') {
          if (piece.color === 'white') {
            newCastlingRights.white.kingside = false;
            newCastlingRights.white.queenside = false;
          } else {
            newCastlingRights.black.kingside = false;
            newCastlingRights.black.queenside = false;
          }
        }
    
        // If rook moves or is captured, lose castling rights
        if (piece.type === 'rook' || (board[toIndex]?.type === 'rook')) {
          if (fromIndex === 0 || toIndex === 0) newCastlingRights.black.queenside = false;
          if (fromIndex === 7 || toIndex === 7) newCastlingRights.black.kingside = false;
          if (fromIndex === 56 || toIndex === 56) newCastlingRights.white.queenside = false;
          if (fromIndex === 63 || toIndex === 63) newCastlingRights.white.kingside = false;
        }
    
        return newCastlingRights;
      };
    
      // Enhanced piece values for more accurate evaluation
      const PIECE_VALUES = {
        pawn: 100,
        knight: 320,
        bishop: 330,
        rook: 500,
        queen: 900,
        king: 20000,
      };

      // Enhanced position bonus tables for better piece placement
      const POSITION_BONUS = {
        pawn: [
          [0,   0,   0,   0,   0,   0,   0,   0],
          [50,  50,  50,  50,  50,  50,  50,  50],
          [10,  10,  20,  30,  30,  20,  10,  10],
          [5,   5,  10,  25,  25,  10,   5,   5],
          [0,   0,   0,  20,  20,   0,   0,   0],
          [5,  -5, -10,   0,   0, -10,  -5,   5],
          [5,  10,  10, -20, -20,  10,  10,   5],
          [0,   0,   0,   0,   0,   0,   0,   0]
        ],
        knight: [
          [-50, -40, -30, -30, -30, -30, -40, -50],
          [-40, -20,   0,   0,   0,   0, -20, -40],
          [-30,   0,  10,  15,  15,  10,   0, -30],
          [-30,   5,  15,  20,  20,  15,   5, -30],
          [-30,   0,  15,  20,  20,  15,   0, -30],
          [-30,   5,  10,  15,  15,  10,   5, -30],
          [-40, -20,   0,   5,   5,   0, -20, -40],
          [-50, -40, -30, -30, -30, -30, -40, -50]
        ],
        bishop: [
          [-20, -10, -10, -10, -10, -10, -10, -20],
          [-10,   0,   0,   0,   0,   0,   0, -10],
          [-10,   0,   5,  10,  10,   5,   0, -10],
          [-10,   5,   5,  10,  10,   5,   5, -10],
          [-10,   0,  10,  10,  10,  10,   0, -10],
          [-10,  10,  10,  10,  10,  10,  10, -10],
          [-10,   5,   0,   0,   0,   0,   5, -10],
          [-20, -10, -10, -10, -10, -10, -10, -20]
        ],
        rook: [
          [0,   0,   0,   0,   0,   0,   0,   0],
          [5,  10,  10,  10,  10,  10,  10,   5],
          [-5,   0,   0,   0,   0,   0,   0,  -5],
          [-5,   0,   0,   0,   0,   0,   0,  -5],
          [-5,   0,   0,   0,   0,   0,   0,  -5],
          [-5,   0,   0,   0,   0,   0,   0,  -5],
          [-5,   0,   0,   0,   0,   0,   0,  -5],
          [0,   0,   0,   5,   5,   0,   0,   0]
        ],
        queen: [
          [-20, -10, -10,  -5,  -5, -10, -10, -20],
          [-10,   0,   0,   0,   0,   0,   0, -10],
          [-10,   0,   5,   5,   5,   5,   0, -10],
          [-5,    0,   5,   5,   5,   5,   0,  -5],
          [0,     0,   5,   5,   5,   5,   0,  -5],
          [-10,   5,   5,   5,   5,   5,   0, -10],
          [-10,   0,   5,   0,   0,   0,   0, -10],
          [-20, -10, -10,  -5,  -5, -10, -10, -20]
        ],
        king: [
          [-30, -40, -40, -50, -50, -40, -40, -30],
          [-30, -40, -40, -50, -50, -40, -40, -30],
          [-30, -40, -40, -50, -50, -40, -40, -30],
          [-30, -40, -40, -50, -50, -40, -40, -30],
          [-20, -30, -30, -40, -40, -30, -30, -20],
          [-10, -20, -20, -20, -20, -20, -20, -10],
          [20,   20,   0,   0,   0,   0,  20,  20],
          [20,   30,  10,   0,   0,  10,  30,  20]
        ]
      };

      // Enhanced evaluation function with more strategic considerations
      const evaluatePosition = (board: (ChessPiece | null)[]): number => {
        let score = 0;
        let mobilityScore = 0;
        let centerControlScore = 0;
        let kingSafetyScore = 0;
        
        // Center squares bonus
        const centerSquares = [27, 28, 35, 36];
        const extendedCenterSquares = [18, 19, 20, 21, 26, 29, 34, 37, 42, 43, 44, 45];
        
        for (let i = 0; i < 64; i++) {
          const piece = board[i];
          if (!piece) continue;

          const value = PIECE_VALUES[piece.type];
          const row = Math.floor(i / 8);
          const col = i % 8;
          const positionBonus = POSITION_BONUS[piece.type][piece.color === 'white' ? row : 7 - row][piece.color === 'white' ? col : 7 - col];

          // Basic piece value and position
          score += (piece.color === 'white' ? 1 : -1) * (value + positionBonus);

          // Mobility bonus
          const moves = getBasicMoves(i, board, piece.color);
          mobilityScore += (piece.color === 'white' ? 1 : -1) * moves.length * 10;

          // Center control bonus
          if (centerSquares.includes(i)) {
            centerControlScore += (piece.color === 'white' ? 1 : -1) * 30;
          } else if (extendedCenterSquares.includes(i)) {
            centerControlScore += (piece.color === 'white' ? 1 : -1) * 15;
          }

          // King safety bonus
          if (piece.type === 'king') {
            const kingRow = piece.color === 'white' ? row : 7 - row;
            const kingCol = piece.color === 'white' ? col : 7 - col;
            
            // Penalize exposed king
            if (kingRow > 2) {
              kingSafetyScore += (piece.color === 'white' ? 1 : -1) * -50;
            }
            
            // Bonus for castled king
            if (kingCol === 6 || kingCol === 2) {
              kingSafetyScore += (piece.color === 'white' ? 1 : -1) * 30;
            }
          }
        }

        // Combine all scores
        return score + mobilityScore + centerControlScore + kingSafetyScore;
      };

      // Enhanced minimax algorithm with better move ordering
      const minimax = (
        board: (ChessPiece | null)[],
        depth: number,
        alpha: number,
        beta: number,
        isMaximizing: boolean
      ): { score: number; move: { from: number; to: number } | null } => {
        if (depth === 0) {
          return { score: evaluatePosition(board), move: null };
        }

        const moves: { from: number; to: number }[] = [];
        const color = isMaximizing ? 'black' : 'white';

        // Generate all possible moves
        for (let i = 0; i < 64; i++) {
          const piece = board[i];
          if (piece && piece.color === color) {
            const validMoves = getValidMoves(i, board, color);
            validMoves.forEach(to => {
              moves.push({ from: i, to });
            });
          }
        }

        if (moves.length === 0) {
          return { score: isMaximizing ? -Infinity : Infinity, move: null };
        }

        // Sort moves by capture value for better alpha-beta pruning
        moves.sort((a, b) => {
          const pieceA = board[a.to];
          const pieceB = board[b.to];
          const valueA = pieceA ? PIECE_VALUES[pieceA.type] : 0;
          const valueB = pieceB ? PIECE_VALUES[pieceB.type] : 0;
          return valueB - valueA;
        });

        let bestMove = moves[0];
        let bestScore = isMaximizing ? -Infinity : Infinity;

        for (const move of moves) {
          const newBoard = [...board];
          newBoard[move.to] = newBoard[move.from];
          newBoard[move.from] = null;

          const { score } = minimax(newBoard, depth - 1, alpha, beta, !isMaximizing);

          if (isMaximizing) {
            if (score > bestScore) {
              bestScore = score;
              bestMove = move;
            }
            alpha = Math.max(alpha, score);
          } else {
            if (score < bestScore) {
              bestScore = score;
              bestMove = move;
            }
            beta = Math.min(beta, score);
          }

          if (beta <= alpha) break;
        }

        return { score: bestScore, move: bestMove };
      };

      // Check if a player has any legal moves
      const hasLegalMoves = (board: (ChessPiece | null)[], color: 'white' | 'black'): boolean => {
        for (let i = 0; i < 64; i++) {
          const piece = board[i];
          if (piece && piece.color === color) {
            const moves = getValidMoves(i, board, color);
            if (moves.length > 0) {
              return true;
            }
          }
        }
        return false;
      };

      // Check if a player is in checkmate
      const isCheckmate = (board: (ChessPiece | null)[], color: 'white' | 'black'): boolean => {
        return isKingInCheck(board, color) && !hasLegalMoves(board, color);
      };

      // Check if a player is in stalemate
      const isStalemate = (board: (ChessPiece | null)[], color: 'white' | 'black'): boolean => {
        return !isKingInCheck(board, color) && !hasLegalMoves(board, color);
      };

      // Move chess piece
      const moveChessPiece = (fromIndex: number, toIndex: number) => {
        const newBoard = [...chessState.board];
        const piece = newBoard[fromIndex];
        if (!piece) return;
    
        // Handle castling
        if (piece.type === 'king' && Math.abs(toIndex - fromIndex) === 2) {
          const isKingside = toIndex > fromIndex;
          const rookFrom = isKingside ? (piece.color === 'white' ? 63 : 7) : (piece.color === 'white' ? 56 : 0);
          const rookTo = isKingside ? toIndex - 1 : toIndex + 1;
          newBoard[rookTo] = newBoard[rookFrom];
          newBoard[rookFrom] = null;
        }
    
        // Handle en passant
        if (piece.type === 'pawn' && Math.abs(toIndex - fromIndex) % 8 === 1 && !newBoard[toIndex]) {
          const capturedPawnIndex = toIndex + (piece.color === 'white' ? 8 : -8);
          newBoard[capturedPawnIndex] = null;
        }
    
        // Handle pawn promotion
        if (piece.type === 'pawn' && (Math.floor(toIndex / 8) === 0 || Math.floor(toIndex / 8) === 7)) {
          newBoard[toIndex] = handlePawnPromotion(toIndex, piece.color);
        } else {
          newBoard[toIndex] = newBoard[fromIndex];
        }
        newBoard[fromIndex] = null;
    
        // Check for capture of king (game over)
        const capturedPiece = chessState.board[toIndex];
        const isKingCaptured = Boolean(capturedPiece && capturedPiece.type === "king");
    
        // Update castling rights
        const newCastlingRights = updateCastlingRights(newBoard, fromIndex, toIndex);
    
        // Switch turns
        const nextTurn = chessState.turn === "white" ? "black" : "white";
    
        // Check if the next player is in check
        const inCheck = isKingInCheck(newBoard, nextTurn);
    
        // Check for checkmate or stalemate
        let gameOver = isKingCaptured;
        let winner: 'white' | 'black' | null = null;
        let gameEndReason: 'checkmate' | 'stalemate' | 'resignation' | null = null;

        if (isKingCaptured) {
          gameOver = true;
          winner = piece.color;
          gameEndReason = 'checkmate';
        } else if (isCheckmate(newBoard, nextTurn)) {
          gameOver = true;
          winner = piece.color;
          gameEndReason = 'checkmate';
        } else if (isStalemate(newBoard, nextTurn)) {
          gameOver = true;
          gameEndReason = 'stalemate';
        }
    
        setChessState({
          board: newBoard,
          selectedPiece: null,
          possibleMoves: [],
          turn: nextTurn,
          gameOver,
          lastMove: { from: fromIndex, to: toIndex },
          inCheck,
          canCastle: newCastlingRights,
          winner,
          gameEndReason,
        });
    
        if (gameOver) {
          if (winner) {
          } else {
          }
        }
    
        // Computer move for black pieces
        if (nextTurn === "black" && !gameOver) {
          setTimeout(() => {
            makeComputerMove(newBoard);
          }, 1000);
        }
      };
    
      // Update makeComputerMove to use a deeper search
      const makeComputerMove = (board: (ChessPiece | null)[]) => {
        const { move } = minimax(board, 4, -Infinity, Infinity, true);
        
        if (move) {
          const newBoard = [...board];
          const piece = newBoard[move.from];
          if (!piece) return;

          // Handle castling
          if (piece.type === 'king' && Math.abs(move.to - move.from) === 2) {
            const isKingside = move.to > move.from;
            const rookFrom = isKingside ? 7 : 0;
            const rookTo = isKingside ? move.to - 1 : move.to + 1;
            newBoard[rookTo] = newBoard[rookFrom];
            newBoard[rookFrom] = null;
          }

          // Handle en passant
          if (piece.type === 'pawn' && Math.abs(move.to - move.from) % 8 === 1 && !newBoard[move.to]) {
            const capturedPawnIndex = move.to + 8;
            newBoard[capturedPawnIndex] = null;
          }

          // Handle pawn promotion
          if (piece.type === 'pawn' && Math.floor(move.to / 8) === 0) {
            newBoard[move.to] = handlePawnPromotion(move.to, piece.color);
          } else {
            newBoard[move.to] = newBoard[move.from];
          }
          newBoard[move.from] = null;

          // Check for capture of king (game over)
          const capturedPiece = board[move.to];
          const isKingCaptured = Boolean(capturedPiece && capturedPiece.type === "king");

          // Update castling rights
          const newCastlingRights = updateCastlingRights(newBoard, move.from, move.to);

          // Check if the next player is in check
          const inCheck = isKingInCheck(newBoard, 'white');

          // Check for checkmate or stalemate
          let gameOver = isKingCaptured;
          let winner: 'white' | 'black' | null = null;
          let gameEndReason: 'checkmate' | 'stalemate' | 'resignation' | null = null;

          if (isKingCaptured) {
            gameOver = true;
            winner = piece.color;
            gameEndReason = 'checkmate';
          } else if (isCheckmate(newBoard, 'white')) {
            gameOver = true;
            winner = piece.color;
            gameEndReason = 'checkmate';
          } else if (isStalemate(newBoard, 'white')) {
            gameOver = true;
            gameEndReason = 'stalemate';
          }

          setChessState({
            board: newBoard,
            selectedPiece: null,
            possibleMoves: [],
            turn: "white",
            gameOver,
            lastMove: move,
            inCheck,
            canCastle: newCastlingRights,
            winner,
            gameEndReason,
          });

          if (gameOver) {
            if (winner) {
            } else {
            }
          }
        }
      };
    
      // Reset chess game
      const resetChess = () => {
        setChessState({
          board: initialChessBoard(),
          selectedPiece: null,
          possibleMoves: [],
          turn: "white",
          gameOver: false,
          lastMove: null,
          inCheck: false,
          canCastle: {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true },
          },
          winner: null,
          gameEndReason: null,
        });
      };
      
  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity
          onPress={() => setCurrentGame(null)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.gameTitle}>Chess</Text>
        <TouchableOpacity onPress={resetChess} style={styles.resetButton}>
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.chessStatus}>
        <Text style={[styles.chessStatusText, chessState.inCheck && styles.checkText]}>
          {chessState.gameOver
            ? chessState.gameEndReason === 'stalemate'
              ? "Game Over! Stalemate!"
              : `Game Over! ${chessState.winner === "white" ? "White" : "Black"} wins by ${chessState.gameEndReason}!`
            : `${chessState.turn.charAt(0).toUpperCase() + chessState.turn.slice(1)}'s turn${
                chessState.inCheck ? " (Check!)" : ""
              }`}
        </Text>
      </View>

      <View style={styles.chessBoardContainer}>
        <View style={styles.chessBoard}>
          {chessState.board.map((piece, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isBlack = (row + col) % 2 === 1;
            const isSelected = index === chessState.selectedPiece;
            const isPossibleMove = chessState.possibleMoves.includes(index);
            const isLastMove = chessState.lastMove && 
              (index === chessState.lastMove.from || index === chessState.lastMove.to);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chessSquare,
                  isBlack ? styles.chessSquareBlack : styles.chessSquareWhite,
                  isSelected && styles.chessSquareSelected,
                  isPossibleMove && styles.chessPossibleMove,
                  isLastMove && styles.chessLastMove,
                ]}
                onPress={() => handleChessSelect(index)}
                disabled={chessState.gameOver || chessState.turn === "black"}
              >
                {piece && renderChessPiece(piece)}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.coordinates}>
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letter, i) => (
            <Text key={letter} style={styles.coordinateText}>
              {letter}
            </Text>
          ))}
        </View>
      </View>

      {chessState.gameOver && (
        <TouchableOpacity style={styles.newGameButton} onPress={resetChess}>
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 8,
  },
  newGameButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newGameButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gameHeaderButton: {
    padding: 8,
  },
  chessStatus: {
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chessStatusText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  checkText: {
    color: "#D32F2F",
    fontWeight: "bold",
  },
  chessBoardContainer: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  chessBoard: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 320,
    height: 320,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  chessSquare: {
    width: "12.5%",
    height: "12.5%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chessSquareWhite: {
    backgroundColor: "#F0D9B5",
  },
  chessSquareBlack: {
    backgroundColor: "#B58863",
  },
  chessSquareSelected: {
    backgroundColor: "#BBDEFB",
  },
  chessPossibleMove: {
    backgroundColor: "#A5D6A7",
  },
  chessLastMove: {
    backgroundColor: "#FFF176",
  },
  chessPieceContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  chessPiece: {
    margin: 0,
    padding: 0,
  },
  resetButton: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 8,
  },
  coordinates: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 320,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  coordinateText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default ChessGame;
