import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import puzzleRouter from "./routes/puzzle.route.js";
import userRouter from "./routes/auth.route.js";
import adminRouter from "./routes/admin.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not configured in .env");
}

// Allow requests from your frontend and support cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  }),
);

// Middleware must be registered before the routes
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// API routes

app.use("/api/puzzles", puzzleRouter);
app.use("/api/auth", userRouter);
app.use("/api/admin", adminRouter);

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Tactic Lab API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
