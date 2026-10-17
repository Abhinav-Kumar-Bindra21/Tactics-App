import express from "express";

import {
  createdAdminPuzzle,
  deleteAdminPuzzle,
  getAdminStatus,
  getAllCoaches,
  getAllPuzzles,
  getAllUsers,
  getPendingPuzzles,
  reviewCoachApplication,
  reviewCoachPuzzle,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { requireTrustedOrigin, verifyCsrf } from "../middleware/csrf.middleware.js";

const adminRouter = express.Router();

// Admin-only diagnostic endpoint
adminRouter.get("/status", authenticateToken, requireRole("admin"), getAdminStatus);

// Admin-only user management endpoint
adminRouter.get("/users", authenticateToken, requireRole("admin"), getAllUsers);

// Update a user's active status
adminRouter.patch("/users/:userId/status", authenticateToken, requireRole("admin"), updateUserStatus);

// Get All Coaches record
adminRouter.get("/coaches", authenticateToken, requireRole("admin"), getAllCoaches);

// Admin-only puzzle library
adminRouter.get("/puzzles", authenticateToken, requireRole("admin"), getAllPuzzles);

adminRouter.post(
  "/puzzles",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireRole("admin"),
  createdAdminPuzzle,
);

adminRouter.delete(
  "/puzzles/:puzzleId",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireRole("admin"),
  deleteAdminPuzzle,
);

adminRouter.get("/puzzles/pending", authenticateToken, requireRole("admin"), getPendingPuzzles);

adminRouter.patch(
  "/puzzles/:puzzleId/review",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireRole("admin"),
  reviewCoachPuzzle,
);

adminRouter.patch(
  "/coaches/:userId/review",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireRole("admin"),
  reviewCoachApplication,
);
export default adminRouter;
