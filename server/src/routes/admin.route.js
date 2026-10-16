import express from "express";

import { getAdminStatus, getAllUsers, updateUserStatus } from "../controllers/admin.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";

const adminRouter = express.Router();

// Admin-only diagnostic endpoint
adminRouter.get("/status", authenticateToken, requireRole("admin"), getAdminStatus);

// Admin-only user management endpoint
adminRouter.get("/users", authenticateToken, requireRole("admin"), getAllUsers);

// Update a user's active status
adminRouter.patch("/users/:userId/status", authenticateToken, requireRole("admin"), updateUserStatus);

export default adminRouter;
