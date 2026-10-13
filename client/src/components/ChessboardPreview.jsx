import { Chessboard } from "react-chessboard";

const puzzlePosition = "r3k2r/ppp2ppp/2n5/4p3/8/8/3P4/4K3 w - - 0 1";

function ChessboardPreview() {
  const boardOptions = {
    id: "daily-challenge",
    position: puzzlePosition,
    allowDragging: false,
    showNotation: true,
    boardStyle: {
      borderRadius: "8px",
      overflow: "hidden",
    },
    lightSquareStyle: {
      backgroundColor: "#eeeed2",
    },
    darkSquareStyle: {
      backgroundColor: "#779556",
    },
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#19211c] p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-lime-300">DAILY CHALLENGE</p>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Find the best move</h2>
        </div>

        <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-300">PUZZLE #001</span>
      </div>

      <div className="mx-auto w-full max-w-[460px]">
        <Chessboard options={boardOptions} />
      </div>

      <p className="mt-4 text-sm text-gray-400">Study the position and look for the strongest move.</p>
    </div>
  );
}

export default ChessboardPreview;
