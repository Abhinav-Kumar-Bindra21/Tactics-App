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

export const getMyRecommendation = async (req, res) => {
  try {
    const themes = await getThemeStats(req.user.id);

    const eligibleThemes = themes.filter((theme) => theme.totalAttempts >= 5);

    if (eligibleThemes.length === 0) {
      return res.status(200).json({
        recommendation: null,
        message: "Complete at least 5 attempts in a tactical theme to receive a recommendation.",
      });
    }

    const solvedAttempts = await Attempt.find({
      studentId: req.user.id,
      isCorrect: true,
    }).distinct("puzzleId");

    let selectedTheme = null;
    let recommendedPuzzles = [];

    for (const theme of eligibleThemes) {
      const puzzles = await Puzzle.find({
        theme: theme.theme,
        isPublished: true,
        _id: { $nin: solvedAttempts },
      })
        .select("-solutions")
        .limit(5)
        .lean();

      if (puzzles.length > 0) {
        selectedTheme = theme;
        recommendedPuzzles = puzzles;
        break;
      }
    }

    if (!selectedTheme) {
      return res.status(200).json({
        recommendation: null,
        message:
          "You've solved all currently available puzzles in your eligible themes. Check back when new puzzles are added.",
      });
    }

    return res.status(200).json({
      recommendation: {
        theme: selectedTheme.theme,
        accuracy: selectedTheme.accuracy,
        totalAttempts: selectedTheme.totalAttempts,
        suggestedAction: `Practise more ${selectedTheme.theme} puzzles.`,
        puzzles: recommendedPuzzles,
      },
    });
  } catch (error) {
    console.error("Failed to generate recommendation:", error.message);

    return res.status(500).json({
      message: "Unable to generate a practice recommendation.",
    });
  }
};

export const getMyRepeatedMistakes = async (req, res) => {
  try {
    const mistakes = await Attempt.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(req.user.id),
          isCorrect: false,
        },
      },
      {
        $group: {
          _id: "$puzzleId",
          failedAttempts: { $sum: 1 },
        },
      },
      { $match: { failedAttempts: { $gte: 2 } } },
      { $sort: { failedAttempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "puzzles",
          localField: "_id",
          foreignField: "_id",
          as: "puzzle",
        },
      },
      { $unwind: "$puzzle" },
      {
        $match: {
          "puzzle.isPublished": true,
        },
      },
      {
        $project: {
          _id: 0,
          puzzleId: "$puzzle.puzzleId",
          title: "$puzzle.title",
          theme: "$puzzle.theme",
          failedAttempts: 1,
        },
      },
    ]);

    return res.status(200).json({ mistakes });
  } catch (error) {
    console.error("Failed to fetch repeated mistakes:", error.message);

    return res.status(500).json({
      message: "Unable to fetch repeated mistakes.",
    });
  }
};

export const getMyDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [summary, themes, repeatedMistakes] = await Promise.all([
      Attempt.aggregate([
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId),
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
      ]),
      getThemeStats(studentId),
      Attempt.aggregate([
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId),
            isCorrect: false,
          },
        },
        {
          $group: {
            _id: "$puzzleId",
            failures: { $sum: 1 },
          },
        },
        { $match: { failures: { $gte: 2 } } },
        { $count: "total" },
      ]),
    ]);

    const stats = summary[0] ?? {
      totalAttempts: 0,
      correctAttempts: 0,
    };

    const accuracy = stats.totalAttempts ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0;

    const eligibleThemes = themes.filter((theme) => theme.totalAttempts >= 5);

    return res.status(200).json({
      totalAttempts: stats.totalAttempts,
      correctAttempts: stats.correctAttempts,
      accuracy,
      weakestTheme: eligibleThemes[0] ?? null,
      repeatedMistakePuzzleCount: repeatedMistakes[0]?.total ?? 0,
    });
  } catch (error) {
    console.error("Failed to fetch student dashboard:", error.message);

    return res.status(500).json({
      message: "Unable to fetch your dashboard.",
    });
  }
};
