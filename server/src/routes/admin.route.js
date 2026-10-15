import express from "express";

import { getAdminStatus } from "../controllers/admin.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";

const adminRouter = express.Router();

// Admin-only diagnostic endpoint
adminRouter.get("/status", authenticateToken, requireRole("admin"), getAdminStatus);

export default adminRouter;
