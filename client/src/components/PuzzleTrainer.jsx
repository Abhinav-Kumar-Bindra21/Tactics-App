import { Chessboard } from "react-chessboard";
import usePuzzle from "../hooks/usePuzzle";

function PuzzleTrainer({ puzzle, onNext, puzzleNumber, totalPuzzles, onAttempt }) {
  const { fen, moves, feedback, solved, showHint, makeMove, submitVariation, resetPuzzle, revealHint } =
    usePuzzle(puzzle);

  function handleSubmit() {
    const result = submitVariation();

    if (result === "accepted" || result === "unapproved" || result === "unapproved-checkmate" || result === "invalid") {
      onAttempt?.({
        puzzleId: puzzle.id,
        correct: result === "accepted",
      });
    }
  }

  const boardOptions = {
    id: "puzzle-trainer",
    position: fen,
    onPieceDrop: makeMove,
    allowDragging: !solved,
    showNotation: true,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-xl">
        <Chessboard options={boardOptions} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <p className="text-sm text-lime-300">
          Puzzle {puzzleNumber} of {totalPuzzles}
        </p>

        <h3 className="mt-2 text-2xl font-bold text-white">{puzzle.title}</h3>

        <p className="mt-2 text-gray-300">{puzzle.description}</p>

        <p className="mt-4 rounded-xl bg-gray-900 p-4 text-sm text-gray-100">{feedback}</p>

        <div className="mt-5">
          <h4 className="font-semibold text-white">Your variation</h4>

          <p className="mt-2 min-h-6 break-words text-gray-300">
            {moves.length > 0 ? moves.join(" ") : "No moves played yet"}
          </p>
        </div>

        {showHint && <p className="mt-4 rounded-xl bg-gray-900 p-4 text-sm text-yellow-200">{puzzle.hint}</p>}

        {solved && <p className="mt-4 font-semibold text-lime-300">Puzzle solved!</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={revealHint}
            disabled={solved}
            className="rounded-xl border border-white/15 px-4 py-2 text-white disabled:opacity-40"
          >
            Show hint
          </button>

          <button
            type="button"
            onClick={resetPuzzle}
            className="rounded-xl border border-white/15 px-4 py-2 text-white"
          >
            Reset attempt
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={solved}
            className="rounded-xl bg-lime-400 px-4 py-2 font-bold text-gray-950 disabled:opacity-40"
          >
            Submit variation
          </button>
        </div>

        {solved && puzzleNumber < totalPuzzles && (
          <button
            type="button"
            onClick={onNext}
            className="mt-5 w-full rounded-xl bg-lime-400 px-4 py-3 font-bold text-gray-950 hover:bg-lime-300"
          >
            Next puzzle →
          </button>
        )}
      </div>
    </div>
  );
}

export default PuzzleTrainer;
