const puzzles = [
  {
    id: "mate-001",
    title: "Queen's Finishing Move",
    theme: "Checkmate",
    difficulty: "Beginner",
    description: "White to move. Find checkmate in one move.",
    fen: "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
    solutions: [["Qg7#"]],
    hint: "Move the queen to g7. Check the king's escape squares.",
    solutionText: "Qg7#",
  },
  {
    id: "mate-002",
    title: "Queen's Final Attack",
    theme: "Checkmate",
    difficulty: "Beginner",
    description: "White to move. Find checkmate in one move.",
    fen: "7k/8/5K2/6Q1/8/8/8/8 w - - 0 1",
    solutions: [["Qg7#"]],
    hint: "Find the queen move that checkmates the king.",
    solutionText: "Qg7#",
  },
];

export default puzzles;
