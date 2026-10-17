import mongoose from "mongoose";

const puzzleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    puzzleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fen: {
      type: String,
      required: true,
      trim: true,
    },

    theme: {
      type: String,
      required: true,
      enum: ["Knight Forks", "Pins", "Skewers", "Checkmate", "Discovered Attacks", "Deflection"],
    },

    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    hint: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    solutions: {
      type: [[String]],
      required: true,
      validate: {
        validator: (solutions) =>
          Array.isArray(solutions) &&
          solutions.length > 0 &&
          solutions.every((line) => Array.isArray(line) && line.length > 0),
        message: "At least one non-empty solution line is required.",
      },
      select: false,
    },

    // Who submitted or created this puzzle?
    source: {
      type: String,
      enum: ["admin", "coach"],
      default: "admin",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Coach who owns a coach-only puzzle.
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Admin review workflow.
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // Shared library vs. a particular coach's students.
    visibility: {
      type: String,
      enum: ["library", "coach_students"],
      default: "library",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

puzzleSchema.index({ status: 1, createdAt: -1 });
puzzleSchema.index({ visibility: 1, isPublished: 1 });
puzzleSchema.index({ coachId: 1, status: 1 });

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

export default Puzzle;
