import mongoose from "mongoose";

const puzzleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
    },

    hint: {
      type: String,
      default: "",
    },

    solutions: {
      type: [[String]],
      required: true,
      validate: {
        validator: (solutions) => solutions.length > 0 && solutions.every((line) => line.length > 0),
        message: "At least one non-empty solution line is required.",
      },
      select: false,
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

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

export default Puzzle;
