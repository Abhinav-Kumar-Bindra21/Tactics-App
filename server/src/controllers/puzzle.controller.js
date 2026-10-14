import Attempt from "../models/Attempt.js";
import Puzzle from "../models/Puzzle.js";
import mongoose from "mongoose";
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
    const { playedMoves, durationSeconds } = req.body ?? {};

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

    // Save Every attempt, including incorrect attempts
    const attemptData = {
      studentId: req.user.id,
      puzzleId: puzzle._id,
      playedMoves,
      isCorrect: result.isCorrect,
    };

    if (durationSeconds !== undefined) {
      attemptData.durationSeconds = durationSeconds;
    }

    const attempt = await Attempt.create(attemptData);

    return res.status(200).json({
      attemptId: attempt._id,
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

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attemp.find({ studentId: req.user.id })
      .populate("puzzleId", "puzzleId title theme difficulty")
      .select("-playedMoves")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error("Failed to fetch student attempts:", error.message);

    return res.status(500).json({
      message: "Unable to fetch your attempt history.",
    });
  }
};

export const getMyProgress = async (req, res) => {
  try {
    const summary = await Attempt.aggregate([
      {
        $match: {
          studentId: new (await import("mongoose")).default.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          correctAttempts: {
            $sum: { $cond: ["$isCorrect", 1, 0] },
          },
        },
      },
    ]);

    const stats = summary[0] ?? {
      totalAttempts: 0,
      correctAttempts: 0,
    };

    const accuracy = stats.totalAttempts === 0 ? 0 : Math.round((stats.correctAttempts / stats.totalAttempts) * 100);

    return res.status(200).json({
      totalAttempts: stats.totalAttempts,
      correctAttempts: stats.correctAttempts,
      accuracy,
    });
  } catch (error) {
    console.error("Failed to fetch student progress:", error.message);

    return res.status(500).json({
      message: "Unable to fetch your progress.",
    });
  }
};

const getThemeStats = (studentId) => {
  return Attempt.aggregate([
    {
      $match: {
        studentId: new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $lookup: {
        from: "puzzles",
        localField: "puzzleId",
        foreignField: "_id",
        as: "puzzle",
      },
    },
    { $unwind: "$puzzle" },
    {
      $group: {
        _id: "$puzzle.theme",
        totalAttempts: { $sum: 1 },
        correctAttempts: {
          $sum: { $cond: ["$isCorrect", 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        theme: "$_id",
        totalAttempts: 1,
        correctAttempts: 1,
        accuracy: {
          $round: [
            {
              $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100],
            },
            1,
          ],
        },
      },
    },
    { $sort: { accuracy: 1 } },
  ]);
};

export const getMyThemeProgress = async (req, res) => {
  try {
    const results = await getThemeStats(req.user.id);

    return res.status(200).json({ themes: results });
  } catch (error) {
    console.error("Failed to fetch theme progress:", error.message);

    return res.status(500).json({
      message: "Unable to fetch tactical theme progress.",
    });
  }
};
