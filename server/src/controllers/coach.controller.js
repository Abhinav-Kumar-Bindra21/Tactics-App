import User from "../models/User.js";
import bcrypt from "bcrypt";
import { validateUser } from "../utils/validateUser.js";

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
