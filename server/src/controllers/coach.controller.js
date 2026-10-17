import User from "../models/User.js";
import bcrypt from "bcrypt";
import { validateUser } from "../utils/validateUser.js";
import { generatePuzzleId } from "../utils/generatePuzzleId.js";
import Puzzle from "../models/Puzzle.js";
import mongoose from "mongoose";
import Attempt from "../models/Attempt.js";

// Register a new coach account.
// Coaches must wait for admin approval before using coach features.
export const registerCoach = async (req, res) => {
  try {
    let validatedData;

    try {
      validatedData = validateUser(req.body);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { name, email, password } = validatedData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const coach = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "coach",
      coachApprovalStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Coach registration submitted. Please wait for admin approval.",
      user: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
        coachApprovalStatus: coach.coachApprovalStatus,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Coach registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit coach registration.",
    });
  }
};

export const submitCoachPuzzle = async (req, res) => {
  try {
    const { title, fen, theme, difficulty, description, hint = "", solutions } = req.body ?? {};

    // Validate required fields.
    if (
      typeof title !== "string" ||
      typeof fen !== "string" ||
      typeof theme !== "string" ||
      typeof difficulty !== "string" ||
      typeof description !== "string" ||
      !Array.isArray(solutions) ||
      solutions.length === 0 ||
      !solutions.every(
        (line) =>
          Array.isArray(line) && line.length > 0 && line.every((move) => typeof move === "string" && move.trim()),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid puzzle details and at least one solution line.",
      });
    }

    const cleanTitle = title.trim();
    const cleanFen = fen.trim();
    const cleanDescription = description.trim();
    const cleanHint = typeof hint === "string" ? hint.trim() : null;

    if (
      !cleanTitle ||
      cleanTitle.length > 120 ||
      !cleanFen ||
      !cleanDescription ||
      cleanDescription.length > 1000 ||
      cleanHint === null ||
      cleanHint.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more puzzle fields are invalid.",
      });
    }

    const allowedThemes = ["Knight Forks", "Pins", "Skewers", "Checkmate", "Discovered Attacks", "Deflection"];

    const allowedDifficulties = ["Beginner", "Intermediate", "Advanced"];

    if (!allowedThemes.includes(theme) || !allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid puzzle theme or difficulty.",
      });
    }

    // Generate a unique puzzle ID using the existing helper.
    const puzzleId = await generatePuzzleId();

    const puzzle = await Puzzle.create({
      title: cleanTitle,
      puzzleId,
      fen: cleanFen,
      theme,
      difficulty,
      description: cleanDescription,
      hint: cleanHint,
      solutions: solutions.map((line) => line.map((move) => move.trim())),
      source: "coach",
      createdBy: req.user.id,
      coachId: req.user.id,
      status: "pending",
      visibility: "coach_students",
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Puzzle submitted successfully and is awaiting admin review.",
      puzzle: {
        id: puzzle._id,
        puzzleId: puzzle.puzzleId,
        title: puzzle.title,
        theme: puzzle.theme,
        difficulty: puzzle.difficulty,
        status: puzzle.status,
        createdAt: puzzle.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A puzzle with this ID already exists. Please try again.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Coach puzzle submission failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit puzzle.",
    });
  }
};

export const registerCoachStudent = async (req, res) => {
  try {
    let validatedData;

    try {
      validatedData = validateUser(req.body);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { name, email, password } = validatedData;

    // Verify that the authenticated coach is approved and active.
    const coach = await User.findOne({
      _id: req.user.id,
      role: "coach",
      coachApprovalStatus: "approved",
      isActive: true,
    });

    if (!coach) {
      return res.status(403).json({
        success: false,
        message: "Only active, approved coaches can manage students.",
      });
    }

    // Check whether an account with this email already exists.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Only student accounts can be linked to a coach.
      if (existingUser.role !== "student") {
        return res.status(409).json({
          success: false,
          message: "This email belongs to a coach or admin account.",
        });
      }

      // Already connected to this coach.
      if (existingUser.coachId?.toString() === coach._id.toString()) {
        return res.status(409).json({
          success: false,
          message: "This student is already in your student list.",
        });
      }

      // Do not silently transfer students from another coach.
      if (existingUser.coachId) {
        return res.status(409).json({
          success: false,
          message: "This student is already assigned to another coach.",
        });
      }

      // Link the existing independent student without changing
      // their name, password, email, or other account details.
      existingUser.coachId = coach._id;
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "Existing student added to your student list.",
        student: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          coachId: existingUser.coachId,
        },
      });
    }

    // No account exists, so create a new student.
    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      coachId: coach._id,
      coachApprovalStatus: "not_required",
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        coachId: student.coachId,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Refresh and try again.",
      });
    }

    console.error("Coach student registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register student.",
    });
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      coachId: req.user.id,
    })
      .select("_id name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Failed to fetch coach students:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your students.",
    });
  }
};

export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Validate the student ID before querying MongoDB.
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    // 2. Confirm this student belongs to the logged-in coach.
    const student = await User.findOne({
      _id: studentId,
      role: "student",
      coachId: req.user.id,
    })
      .select("_id name email")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your student list.",
      });
    }

    // 3. Load this student's attempts and their puzzle themes.
    const attempts = await Attempt.find({
      studentId: student._id,
    })
      .select("puzzleId isCorrect durationSeconds createdAt")
      .populate({
        path: "puzzleId",
        select: "theme",
      })
      .lean();

    // 4. Calculate the overall statistics.
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((attempt) => attempt.isCorrect).length;

    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    const timedAttempts = attempts.filter((attempt) => Number.isFinite(attempt.durationSeconds));

    const averageDurationSeconds =
      timedAttempts.length > 0
        ? Math.round(
            timedAttempts.reduce((total, attempt) => total + attempt.durationSeconds, 0) / timedAttempts.length,
          )
        : null;

    // 5. Group attempts by tactical theme.
    const themeStats = {};

    for (const attempt of attempts) {
      const theme = attempt.puzzleId?.theme;

      // Skip attempts whose puzzle is no longer available.
      if (!theme) continue;

      if (!themeStats[theme]) {
        themeStats[theme] = {
          theme,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
        };
      }

      themeStats[theme].totalAttempts += 1;

      if (attempt.isCorrect) {
        themeStats[theme].correctAttempts += 1;
      }
    }

    // 6. Calculate accuracy for each theme.
    const themes = Object.values(themeStats).map((stats) => ({
      ...stats,
      accuracy: Math.round((stats.correctAttempts / stats.totalAttempts) * 100),
    }));

    // Lowest accuracy appears first.
    themes.sort((a, b) => a.accuracy - b.accuracy);

    // 7. Return the progress report.
    return res.status(200).json({
      success: true,
      student,
      overview: {
        totalAttempts,
        correctAttempts,
        accuracy,
        averageDurationSeconds,
      },
      themes,
    });
  } catch (error) {
    console.error("Failed to fetch student progress:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student progress.",
    });
  }
};
