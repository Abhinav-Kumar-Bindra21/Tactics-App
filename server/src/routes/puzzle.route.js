import express from "express";
import { getPuzzleById, getPuzzles, submitPuzzleAttempt } from "../controllers/puzzle.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireTrustedOrigin, verifyCsrf } from "../middleware/csrf.middleware.js";

const puzzleRouter = express.Router();

puzzleRouter.get("/", getPuzzles);
puzzleRouter.get("/:puzzleId", getPuzzleById);
puzzleRouter.post("/:puzzleId/attempts", requireTrustedOrigin, authenticateToken, verifyCsrf, submitPuzzleAttempt);

export default puzzleRouter;
