import Puzzle from "../models/Puzzle.js";
import { validatePuzzleAttempt } from "../utils/validatePuzzleAttempt.js";

export const getPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find({ isPublished: true }).select("-solutions").sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      count: puzzles.length,
      puzzles,
    });
  } catch (error) {
    console.error("Failed to fetch puzzles:", error.message);

    return res.status(500).json({
      message: "Unable to fetch puzzles.",
    });
  }
};

export const getPuzzleById = async (req, res) => {
  try {
    const puzzle = await Puzzle.findOne({
      puzzleId: req.params.puzzleId,
      isPublished: true,
    })
      .select("-solutions")
      .lean();

    if (!puzzle) {
      return res.status(404).json({
        message: "Puzzle not found.",
      });
    }

    return res.status(200).json({ puzzle });
  } catch (error) {
    console.error("Failed to fetch puzzle:", error.message);

    return res.status(500).json({
      message: "Unable to fetch puzzle.",
    });
  }
};

export const submitPuzzleAttempt = async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const { playedMoves, durationSeconds } = req.body;

    // Validate the request before querying the database.
    if (
      !Array.isArray(playedMoves) ||
      playedMoves.length === 0 ||
      playedMoves.length > 20 ||
      !playedMoves.every((move) => typeof move === "string" && move.trim().length > 0)
    ) {
      return res.status(400).json({
        message: "Provide a valid sequence of moves.",
      });
    }

    if (durationSeconds !== undefined && (!Number.isInteger(durationSeconds) || durationSeconds < 0)) {
      return res.status(400).json({
        message: "durationSeconds must be a non-negative integer.",
      });
    }

    // Load the published puzzle and its private solution.
    const puzzle = await Puzzle.findOne({
      puzzleId,
      isPublished: true,
    }).select("+solutions");

    if (!puzzle) {
      return res.status(404).json({
        message: "Puzzle not found.",
      });
    }

    // The server determines correctness; the client cannot submit a verdict.
    const result = validatePuzzleAttempt({
      fen: puzzle.fen,
      solutions: puzzle.solutions,
      playedMoves,
    });

    return res.status(200).json({
      puzzleId: puzzle.puzzleId,
      isCorrect: result.isCorrect,
      message: result.isCorrect ? "Correct solution!" : "Not quite. Try again.",
    });
  } catch (error) {
    console.error("Failed to validate puzzle attempt:", error.message);

    return res.status(500).json({
      message: "Unable to validate this attempt.",
    });
  }
};
