const tactics = [
  {
    id: "fork",
    name: "Knight Forks",
    symbol: "♞",
    difficulty: "Beginner",
    description: "Attack two or more enemy pieces with one move.",
    puzzles: 24,
  },
  {
    id: "pin",
    name: "Pins",
    symbol: "♝",
    difficulty: "Beginner",
    description: "Restrict a piece because moving it exposes a target.",
    puzzles: 18,
  },
  {
    id: "skewer",
    name: "Skewers",
    symbol: "♜",
    difficulty: "Intermediate",
    description: "Attack a valuable piece to win material behind it.",
    puzzles: 16,
  },
  {
    id: "checkmate",
    name: "Checkmate",
    symbol: "♛",
    difficulty: "Intermediate",
    description: "Find a forcing combination that ends the game.",
    puzzles: 32,
  },
  {
    id: "discovered-attack",
    name: "Discovered Attacks",
    symbol: "♗",
    difficulty: "Advanced",
    description: "Move one piece to reveal an attack from another.",
    puzzles: 12,
  },
  {
    id: "deflection",
    name: "Deflection",
    symbol: "♘",
    difficulty: "Advanced",
    description: "Lure a defender away from a critical square.",
    puzzles: 10,
  },
];

export default tactics;
