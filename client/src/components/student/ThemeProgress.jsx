import { useEffect, useState } from "react";
import api from "../../api/axios";

const ThemeProgress = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadThemeProgress = async () => {
      try {
        const response = await api.get("/puzzles/my-theme-progress");

        setThemes(Array.isArray(response.data.themes) ? response.data.themes : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load tactical theme progress.");
      } finally {
        setLoading(false);
      }
    };

    loadThemeProgress();
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-bold">Tactical Theme Progress</h2>

      <p className="mt-2 text-gray-400">Review your performance across different chess tactics.</p>

      {loading ? (
        <p className="mt-5 text-gray-400">Loading tactical theme progress...</p>
      ) : error ? (
        <p className="mt-5 text-red-400">{error}</p>
      ) : themes.length === 0 ? (
        <p className="mt-5 text-gray-400">
          No tactical practice data available yet. Solve some puzzles to see your progress.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {themes.map((theme, index) => {
            const accuracy = Math.min(100, Math.max(0, Number(theme.accuracy) || 0));

            return (
              <div key={theme.theme || index}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-white">{theme.theme || "Unknown theme"}</span>

                  <span className="text-sm text-lime-300">{accuracy}% accuracy</span>
                </div>

                <p className="mb-2 text-xs text-gray-400">
                  {theme.correctAttempts} correct out of {theme.totalAttempts} attempts
                </p>

                <div
                  className="h-2 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-label={`${theme.theme || "Tactical theme"} accuracy`}
                  aria-valuenow={accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-lime-400 transition-all duration-500"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ThemeProgress;
