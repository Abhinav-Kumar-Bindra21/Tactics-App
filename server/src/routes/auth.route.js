import express from "express";
import { loginStudent, registerStudent, getCsrfToken } from "../controllers/auth.controller.js";
import { requireTrustedOrigin } from "../middleware/csrf.middleware.js";

const userRouter = express.Router();

// Get a CSRF token before making requests
userRouter.get("/csrf", getCsrfToken);

// Public authentication routes
userRouter.post("/register", requireTrustedOrigin, registerStudent);
userRouter.post("/login", requireTrustedOrigin, loginStudent);

export default userRouter;
