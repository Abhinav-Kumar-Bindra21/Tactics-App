import express from "express";
import { requireTrustedOrigin } from "../middleware/csrf.middleware.js";
import { registerCoach } from "../controllers/coach.controller.js";

const coachRouter = express.Router();

// Public coach registration; new accounts remain pending approval.
coachRouter.post("/register", requireTrustedOrigin, registerCoach);

export default coachRouter;
