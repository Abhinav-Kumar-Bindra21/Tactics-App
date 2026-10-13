import { useEffect, useState } from "react";
import { Chess } from "chess.js";

function usePuzzle(puzzle) {
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [moves, setMoves] = useState([]);
  const [feedback, setFeedback] = useState(puzzle.description);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const newGame = new Chess(puzzle.fen);

    setGame(newGame);
    setFen(newGame.fen());
    setMoves([]);
    setFeedback(puzzle.description);
    setSolved(false);
    setShowHint(false);
  }, [puzzle.id, puzzle.fen, puzzle.description]);

  function makeMove({ sourceSquare, targetSquare }) {
    if (solved) return false;

    const nextGame = new Chess(game.fen());
    let move;

    try {
      move = nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    } catch {
      return false;
    }

    if (!move) return false;

    setGame(nextGame);
    setFen(nextGame.fen());
    setMoves((previousMoves) => [...previousMoves, move.san]);
    setFeedback("Move recorded. Submit your variation when you are ready.");

    return true;
  }

  function submitVariation() {
    if (solved) return "already-solved";

    if (moves.length === 0) {
      setFeedback("No moves to submit. Play a move first.");
      return "empty";
    }

    function normalizeMove(san) {
      return san.replace(/[+#?!]+/g, "");
    }

    const playedLine = moves.map(normalizeMove);

    const matchesSolution = (puzzle.solutions ?? []).some((solution) => {
      const expectedLine = solution.map(normalizeMove);

      return (
        playedLine.length === expectedLine.length && playedLine.every((move, index) => move === expectedLine[index])
      );
    });

    if (matchesSolution) {
      setSolved(true);
      setFeedback("Correct! Your variation matches an approved solution.");
      return "accepted";
    }

    const submittedGame = new Chess(puzzle.fen);

    try {
      for (const san of moves) {
        submittedGame.move(san);
      }
    } catch {
      setFeedback("Invalid variation. Reset and try again.");
      return "invalid";
    }

    if (submittedGame.isCheckmate()) {
      setFeedback("Legal checkmate, but this line is not in the approved solutions yet.");
      return "unapproved-checkmate";
    }

    setFeedback("Legal variation, but it does not match an approved solution. Try again.");

    return "unapproved";
  }

  function resetPuzzle() {
    const newGame = new Chess(puzzle.fen);

    setGame(newGame);
    setFen(newGame.fen());
    setMoves([]);
    setFeedback(puzzle.description);
    setSolved(false);
    setShowHint(false);
  }

  function revealHint() {
    if (!solved) {
      setShowHint(true);
    }
  }

  return {
    fen,
    moves,
    feedback,
    solved,
    showHint,
    makeMove,
    submitVariation,
    resetPuzzle,
    revealHint,
  };
}

export default usePuzzle;
