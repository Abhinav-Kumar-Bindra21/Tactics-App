import { Chess } from "chess.js";

function normalizeSan(move) {
  return move.replace(/[+#?!]+$/g, "");
}

export const validatePuzzleAttempt = ({ fen, solutions, playedMoves }) => {
  if (
    typeof fen !== "string" ||
    !Array.isArray(solutions) ||
    solutions.length === 0 ||
    !Array.isArray(playedMoves) ||
    playedMoves.length === 0
  ) {
    return { isCorrect: false, reason: "invalid_input" };
  }

  try {
    const game = new Chess(fen);
    const canonicalMoves = [];

    // Replay every move and reject illegal moves.
    for (const playedMove of playedMoves) {
      if (typeof playedMove !== "string" || !playedMove.trim()) {
        return { isCorrect: false, reason: "invalid_move" };
      }

      const move = game.move(playedMove.trim());
      canonicalMoves.push(normalizeSan(move.san));
    }

    // Compare the complete submitted line with accepted solutions.
    const isCorrect = solutions.some((solutionLine) => {
      if (!Array.isArray(solutionLine) || solutionLine.length !== canonicalMoves.length) {
        return false;
      }

      return solutionLine.every(
        (solutionMove, index) =>
          typeof solutionMove === "string" && normalizeSan(solutionMove) === canonicalMoves[index],
      );
    });

    return {
      isCorrect,
      reason: isCorrect ? "correct" : "incorrect",
    };
  } catch (error) {
    // Invalid positions or illegal moves should not crash the API.
    return { isCorrect: false, reason: "invalid_move" };
  }
};
