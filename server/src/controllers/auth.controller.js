import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateUser } from "../utils/validateUser.js";
import { createCsrfToken } from "../utils/csrf.js";
import { accessCookieOptions, csrfCookieOptions } from "../utils/authCookies.js";
import path from "node:path";

// Register a new student
export const registerStudent = async (req, res) => {
  try {
    // Step 1: Validate and clean the request data
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

    // Step 2: Check whether the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Step 3: Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 4: Create the student account
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    // Step 5: Return safe account information
    return res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Handle duplicate emails, including concurrent requests
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create your account.",
    });
  }
};

// Log in an existing user
export const loginStudent = async (req, res) => {
  try {
    // Step 1: Validate login input
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Step 2: Check authentication configuration
    if (!process.env.JWT_SECRET || !process.env.CSRF_SECRET) {
      console.error("JWT_SECRET or CSRF_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    // Step 3: Find the user and explicitly retrieve the password
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Check whether the account exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check whether an admin has deactivated the account
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact the administrator.",
      });
    }

    // Step 4: Compare the submitted password with its stored hash
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Step 5: Create a short-lived JWT
    const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
      subject: user._id.toString(),
      expiresIn: "15m",
    });

    // Step 6: Generate a CSRF token
    const csrfToken = createCsrfToken();

    // Step 7: Store the tokens in cookies
    res.cookie("accessToken", token, accessCookieOptions);
    res.cookie("csrfToken", csrfToken, csrfCookieOptions);

    // Step 8: Return safe user information
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};

export function getCsrfToken(req, res) {
  try {
    if (!process.env.CSRF_SECRET) {
      console.error("CSRF_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "CSRF protection is not configured.",
      });
    }

    const csrfToken = createCsrfToken();

    res.cookie("csrfToken", csrfToken, csrfCookieOptions);

    return res.status(200).json({
      success: true,
      csrfToken,
    });
  } catch (error) {
    console.error("Failed to create CSRF token:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create CSRF token.",
    });
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email role isActive");

    if (!user || !user.isActive) {
      res.clearCookie("accessToken");
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    return res
      .status(200)
      .json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Get current user failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your account.",
    });
  }
};

export const logoutStudent = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("csrfToken", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
