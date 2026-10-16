import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authenticateToken(req, res, next) {
  // Step 1: Read the JWT from the HttpOnly cookie
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  // Step 2: Make sure the JWT secret exists
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      message: "Authentication is not configured.",
    });
  }

  try {
    // Step 3: Verify the token's signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Validate the token payload
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.sub !== "string" ||
      !["student", "coach", "admin"].includes(decoded.role)
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Step 5: Find the user's current account in MongoDB
    const user = await User.findById(decoded.sub).select("_id role isActive").lean();

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    // Step 6: Reject inactive accounts
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    // Step 7: Use current database identity and role
    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    // Step 8: Allow the request to continue
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" || error.name === "NotBeforeError") {
      return res.status(401).json({
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Authentication failed:", error.message);

    return res.status(500).json({
      message: "Unable to authenticate request.",
    });
  }
}
