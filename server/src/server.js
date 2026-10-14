import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.routes.js";
import "dotenv/config";
import connectDb from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());

app.use("/api/health", healthRouter);

const startServer = async () => {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Tactic Lab API running on port ${PORT}`);
  });
};

startServer();
