import express from "express";
import { requireTrustedOrigin, verifyCsrf } from "../middleware/csrf.middleware.js";
import {
  getMyStudents,
  getStudentProgress,
  registerCoach,
  registerCoachStudent,
  submitCoachPuzzle,
} from "../controllers/coach.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireApprovedCoach } from "../middleware/requireApprovedCoach.js";

const coachRouter = express.Router();

// Public coach registration; new accounts remain pending approval.
coachRouter.post("/register", requireTrustedOrigin, registerCoach);

// Only authenticated, admin-approved coaches can submit puzzles.
coachRouter.post(
  "/puzzles",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireApprovedCoach,
  submitCoachPuzzle,
);

coachRouter.post(
  "/students",
  requireTrustedOrigin,
  authenticateToken,
  verifyCsrf,
  requireApprovedCoach,
  registerCoachStudent,
);

coachRouter.get("/students", authenticateToken, requireApprovedCoach, getMyStudents);

coachRouter.get("/students/:studentId/progress", authenticateToken, requireApprovedCoach, getStudentProgress);

export default coachRouter;
