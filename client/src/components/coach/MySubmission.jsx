import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

function MySubmissions() {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/puzzles/my-coach-submissions");
      setPuzzles(response.data.puzzles ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const statusStyles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };

  if (loading) {
    return <p className="py-8 text-gray-400">Loading submissions...</p>;
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">My Submissions</h2>
          <p className="mt-1 text-sm text-gray-400">Track your puzzles and admin feedback.</p>
        </div>

        <button
          type="button"
          onClick={loadSubmissions}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-950 p-3 text-sm text-red-200">
          {error}
          <button type="button" onClick={loadSubmissions} className="ml-2 underline">
            Try again
          </button>
        </div>
      )}

      {!error && puzzles.length === 0 && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-6 text-gray-400">
          You haven't submitted any puzzles yet.
        </div>
      )}

      <div className="mt-5 space-y-4">
        {puzzles.map((puzzle) => (
          <article key={puzzle._id} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">{puzzle.title}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {puzzle.puzzleId} · {puzzle.theme} · {puzzle.difficulty}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[puzzle.status] || "bg-gray-700 text-gray-200"
                }`}
              >
                {puzzle.status}
              </span>
            </div>

            {puzzle.status === "pending" && (
              <p className="mt-4 text-sm text-amber-200">Your puzzle is waiting for admin review.</p>
            )}

            {puzzle.status === "approved" && (
              <p className="mt-4 text-sm text-emerald-200">
                Approved for your students. Student access will work once the coach-student assignment feature is
                connected.
              </p>
            )}

            {puzzle.status === "rejected" && (
              <div className="mt-4 rounded-lg bg-red-950/60 p-3">
                <p className="text-sm font-semibold text-red-200">Admin feedback</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">
                  {puzzle.reviewNote?.trim() || "No feedback was provided."}
                </p>
              </div>
            )}

            {puzzle.createdAt && (
              <p className="mt-3 text-xs text-gray-500">Submitted: {new Date(puzzle.createdAt).toLocaleDateString()}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default MySubmissions;
