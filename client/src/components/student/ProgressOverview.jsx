import { useEffect, useState } from "react";
import api from "../../api/axios";

const ProgressOverview = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await api.get("/puzzles/my-progress");
        setProgress(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your progress.");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-bold text-white">Progress Overview</h2>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        Track your practice activity and see how accurately you solve tactical puzzles.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-gray-400">Loading your progress...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-300">{error}</p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm text-gray-400">Total Attempts</p>
              <p className="mt-2 text-2xl font-bold text-white">{progress.totalAttempts ?? 0}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm text-gray-400">Correct Attempts</p>
              <p className="mt-2 text-2xl font-bold text-lime-300">{progress.correctAttempts ?? 0}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm text-gray-400">Accuracy</p>
              <p className="mt-2 text-2xl font-bold text-white">{progress.accuracy ?? 0}%</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm text-gray-400">Overall accuracy</span>
              <span className="text-sm font-semibold text-lime-300">{progress.accuracy ?? 0}%</span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Overall accuracy"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, Math.max(0, Number(progress.accuracy) || 0))}
            >
              <div
                className="h-full rounded-full bg-lime-300 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, Number(progress.accuracy) || 0))}%`,
                }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ProgressOverview;
