import Puzzle from "../models/Puzzle.js";
import User from "../models/User.js";
import { Chess } from "chess.js";
import { generatePuzzleId } from "../utils/generatePuzzleId.js";

export const getAdminStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin authorization successful",
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role isActive createdAt").sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Failed to retrieve admin user list:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users.",
    });
  }
};

export const reviewCoachApplication = async (req, res) => {
  try {
    const { userId } = req.params;
    const { decision } = req.body ?? {};

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be "approve" or "reject".',
      });
    }

    const coach = await User.findOne({ _id: userId, role: "coach" });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach account not found.",
      });
    }

    if (coach.coachApprovalStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "This coach application has already been reviewed.",
        coachApprovalStatus: coach.coachApprovalStatus,
      });
    }

    coach.coachApprovalStatus = decision === "approve" ? "approved" : "rejected";

    await coach.save();

    return res.status(200).json({
      success: true,
      message: decision === "approve" ? "Coach approved successfully" : "Coach application rejected",
      coach: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
        coachApprovalStatus: coach.coachApprovalStatus,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid coach ID.",
      });
    }

    console.error("Failed to review coach application:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review coach application.",
    });
  }
};

export const getAllCoaches = async (req, res) => {
  try {
    const coaches = await User.find({ role: "coach" })
      .select("name email role isActive coachApprovalStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: coaches.length,
      coaches,
    });
  } catch (error) {
    console.error("Failed to retrieve coach list:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve coaches.",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent an admin from disabling their own account.
    if (user._id.toString() === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Failed to update user status:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user status.",
    });
  }
};

export const getAllPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find()
      .select("-solutions")
      .populate("createdBy", "name email role")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: puzzles.length,
      puzzles,
    });
  } catch (error) {
    console.error("Failed to retrieve admin puzzle library:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve puzzles.",
    });
  }
};

export const getPendingPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find({
      source: "coach",
      status: "pending",
    })
      .select("-solutions")
      .populate("createdBy", "name email role")
      .populate("coachId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: puzzles.length, puzzles });
  } catch (error) {
    console.error("Failed to retrieve pending puzzles:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending puzzles.",
    });
  }
};

export const reviewCoachPuzzle = async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const { decision, reviewNote } = req.body ?? {};

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be "approve" or "reject" ' });
    }

    if (decision === "reject" && (typeof reviewNote !== "string" || !reviewNote.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a reason for rejection" });
    }

    if (reviewNote !== undefined && typeof reviewNote !== "string") {
      return res.status(400).json({ success: false, message: "Review note must be text" });
    }

    if (typeof reviewNote === "string" && reviewNote.trim().length > 1000) {
      return res.status(400).json({ success: false, message: "Review note must be 1000 characters or fewer." });
    }

    const puzzle = await Puzzle.findOne({ puzzleId, source: "coach", status: "pending" });

    if (!puzzle) {
      return res.status(404).json({ success: false, message: "Pending coach puzzle not found" });
    }

    puzzle.status = decision === "approve" ? "approved" : "rejected";
    puzzle.reviewedBy = req.user.id;
    puzzle.reviewedAt = new Date();
    puzzle.reviewNote = reviewNote?.trim() || "";

    puzzle.visibility = "coach_students";

    if (decision === "approve") {
      puzzle.isPublished = true;
    } else {
      puzzle.isPublished = false;
    }

    await puzzle.save();

    return res.status(200).json({
      success: true,
      message:
        decision === "approve"
          ? "Puzzle approved for the submitting coach's students."
          : "Puzzle rejected and returned with feedback.",
      puzzle: {
        puzzleId: puzzle.puzzleId,
        status: puzzle.status,
        visibility: puzzle.visibility,
        isPublished: puzzle.isPublished,
        reviewNote: puzzle.reviewNote,
      },
    });
  } catch (error) {
    console.error("Failed to review coach puzzle:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review coach puzzle.",
    });
  }
};

export const createdAdminPuzzle = async (req, res) => {
  try {
    const { title, fen, theme, difficulty, description, hint = "", solutions } = req.body ?? {};

    // Validate required fields.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof fen !== "string" ||
      !fen.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !Array.isArray(solutions) ||
      solutions.length === 0 ||
      !solutions.every(
        (line) =>
          Array.isArray(line) &&
          line.length > 0 &&
          line.every((move) => typeof move === "string" && move.trim().length > 0),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid puzzle details and at least one solution line.",
      });
    }

    // Validate the FEN position.
    const cleanedFen = fen.trim();

    try {
      const chess = new Chess();
      chess.load(cleanedFen);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid FEN position. Please enter a valid chess position.",
      });
    }

    // Validate theme and difficulty.
    const allowedThemes = ["Knight Forks", "Pins", "Skewers", "Checkmate", "Discovered Attacks", "Deflection"];

    const allowedDifficulties = ["Beginner", "Intermediate", "Advanced"];

    if (!allowedThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: "Invalid puzzle theme.",
      });
    }

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid puzzle difficulty.",
      });
    }

    if (
      typeof hint !== "string" ||
      title.trim().length > 120 ||
      description.trim().length > 1000 ||
      hint.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more text fields are invalid or too long.",
      });
    }

    // Generate the puzzle ID on the backend.
    const puzzleId = await generatePuzzleId();

    // Save the puzzle.
    const puzzle = await Puzzle.create({
      puzzleId,
      title: title.trim(),
      fen: cleanedFen,
      theme,
      difficulty,
      description: description.trim(),
      hint: hint.trim(),
      solutions: solutions.map((line) => line.map((move) => move.trim())),

      // Permissions and review details are controlled by the server.
      source: "admin",
      createdBy: req.user.id,
      coachId: null,
      status: "approved",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewNote: "",
      visibility: "library",
      isPublished: true,
    });

    return res.status(201).json({
      success: true,
      message: "Puzzle added to the student library.",
      puzzle: {
        id: puzzle._id,
        puzzleId: puzzle.puzzleId,
        title: puzzle.title,
        theme: puzzle.theme,
        difficulty: puzzle.difficulty,
        status: puzzle.status,
        isPublished: puzzle.isPublished,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A puzzle with this ID already exists.",
      });
    }

    console.error("Failed to create admin puzzle:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create puzzle.",
    });
  }
};

export const deleteAdminPuzzle = async (req, res) => {
  try {
    const { puzzleId } = req.params;

    if (!puzzleId) {
      return res.status(400).json({
        success: false,
        message: "Puzzle ID is required.",
      });
    }

    const puzzle = await Puzzle.findById(puzzleId);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: "Puzzle not found.",
      });
    }

    await Puzzle.deleteOne({ _id: puzzle._id });

    return res.status(200).json({
      success: true,
      message: "Puzzle deleted successfully.",
      puzzleId: puzzle._id,
    });
  } catch (error) {
    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid puzzle ID.",
      });
    }

    console.error("Failed to delete admin puzzle:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete puzzle.",
    });
  }
};
