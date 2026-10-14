import express from "express";

const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tactic Lab API is running",
  });
});

export default healthRouter;
