import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    puzzleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Puzzle",
      required: true,
    },

    playedMoves: {
      type: [String],
      required: true,
      validate: {
        validator: (moves) => moves.length > 0,
        message: "An attempt must contain at least one move.",
      },
    },

    isCorrect: {
      type: Boolean,
      required: true,
    },

    durationSeconds: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true },
);

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;
