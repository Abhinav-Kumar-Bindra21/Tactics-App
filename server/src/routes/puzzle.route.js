import express from "express";
import {
  getMyAttempts,
  getMyCoachSubmissions,
  getMyDashboard,
  getMyProgress,
  getMyRecommendation,
  getMyRepeatedMistakes,
  getMyThemeProgress,
  getPuzzleById,
  getPuzzles,
  submitCoachPuzzle,
  submitPuzzleAttempt,
} from "../controllers/puzzle.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireTrustedOrigin, verifyCsrf } from "../middleware/csrf.middleware.js";
import { requireRole } from "../middleware/requireRole.js";

const puzzleRouter = express.Router();

puzzleRouter.get("/", getPuzzles);
puzzleRouter.get("/my-attempts", authenticateToken, getMyAttempts);
puzzleRouter.get("/my-progress", authenticateToken, getMyProgress);
puzzleRouter.get("/my-theme-progress", authenticateToken, getMyThemeProgress);
puzzleRouter.get("/my-recommendation", authenticateToken, getMyRecommendation);
puzzleRouter.get("/my-repeated-mistakes", authenticateToken, getMyRepeatedMistakes);
puzzleRouter.get("/my-dashboard", authenticateToken, getMyDashboard);
puzzleRouter.get("/:puzzleId", getPuzzleById);
puzzleRouter.post("/:puzzleId/attempts", requireTrustedOrigin, authenticateToken, verifyCsrf, submitPuzzleAttempt);

puzzleRouter.post(
  "/coach-submissions",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireRole("coach"),
  submitCoachPuzzle,
);

puzzleRouter.get("/my-coach-submissions", authenticateToken, requireRole("coach"), getMyCoachSubmissions);

export default puzzleRouter;
