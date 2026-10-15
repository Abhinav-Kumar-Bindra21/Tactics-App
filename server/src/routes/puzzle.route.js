import express from "express";
import {
  getMyAttempts,
  getMyDashboard,
  getMyProgress,
  getMyRecommendation,
  getMyRepeatedMistakes,
  getMyThemeProgress,
  getPuzzleById,
  getPuzzles,
  submitPuzzleAttempt,
} from "../controllers/puzzle.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireTrustedOrigin, verifyCsrf } from "../middleware/csrf.middleware.js";

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

export default puzzleRouter;
