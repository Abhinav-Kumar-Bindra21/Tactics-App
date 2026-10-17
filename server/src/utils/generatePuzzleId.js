import Counter from "../models/Counter.js";

export async function generatePuzzleId() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "puzzleId" },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return `TL-${String(counter.sequence).padStart(6, "0")}`;
}
