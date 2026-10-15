import express from "express";
import {
  loginStudent,
  registerStudent,
  getCsrfToken,
  getCurrentUser,
  logoutStudent,
} from "../controllers/auth.controller.js";
import { requireTrustedOrigin } from "../middleware/csrf.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

// Get a CSRF token before making requests
userRouter.get("/csrf", getCsrfToken);

// Public authentication routes
userRouter.post("/register", requireTrustedOrigin, registerStudent);
userRouter.post("/login", requireTrustedOrigin, loginStudent);

// Check the currently logged-in user
userRouter.get("/me", authenticateToken, getCurrentUser);

// Logout Feature
userRouter.post("/logout", requireTrustedOrigin, logoutStudent);

export default userRouter;
