import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const RepeatedMistakes = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadRepeatedMistakes = async () => {
      try {
        const response = await api.get("/puzzles/my-repeated-mistakes");
        setMistakes(Array.isArray(response.data.mistakes) ? response.data.mistakes : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your repeated mistakes.");
      } finally {
        setLoading(false);
      }
    };

    loadRepeatedMistakes();
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-xl font-bold text-white">Repeated Mistakes</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Revisit puzzles where you have struggled and strengthen your tactical understanding.
        </p>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-gray-400">Loading your mistake history...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-300">{error}</p>
      ) : mistakes.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
          <p className="font-medium text-white">No repeated mistakes to show</p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Once you have made multiple incorrect attempts on a puzzle, it will appear here for focused revision.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {mistakes.map((mistake) => (
            <article
              key={mistake.puzzleId}
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-white">{mistake.title}</h3>

                <p className="mt-1 text-sm text-gray-400">Theme: {mistake.theme}</p>

                <p className="mt-2 text-sm text-amber-300">{mistake.failedAttempts} incorrect attempts</p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/practice/${encodeURIComponent(mistake.puzzleId)}`)}
                className="rounded-lg border border-lime-300/40 px-4 py-2 text-sm font-semibold text-lime-300 transition hover:bg-lime-300/10"
              >
                Review puzzle
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default RepeatedMistakes;
