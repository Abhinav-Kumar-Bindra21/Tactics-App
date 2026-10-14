import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    // Stores the bcrypt hash, never the plain-text password
    password: {
      type: String,
      required: true,
      select: false,
    },

    // The user's role belongs in its own field
    role: {
      type: String,
      enum: ["student", "coach", "admin"],
      default: "student",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
