import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const RecommendedPuzzles = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        const response = await api.get("/puzzles/my-recommendation");
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load recommended puzzles.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendation();
  }, []);

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Recommended Practice</h2>
        <p className="mt-3 text-sm text-gray-400">Finding your next practice session...</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-bold text-white">Recommended Practice</h2>

      <p className="mt-2 text-sm text-gray-400">Practice puzzles selected according to your tactical performance.</p>

      {error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : !data?.recommendation ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
          <p className="font-medium text-white">No recommendations yet</p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            {data?.message || "Keep practising to unlock personalized recommendations."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-xl border border-lime-300/20 bg-lime-300/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-lime-300">Focus theme</p>

            <h3 className="mt-2 text-lg font-bold text-white">{data.recommendation.theme}</h3>

            <p className="mt-2 text-sm text-gray-300">Current accuracy: {data.recommendation.accuracy}%</p>

            <p className="mt-1 text-sm text-gray-400">{data.recommendation.suggestedAction}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {data.recommendation.puzzles.map((puzzle) => (
              <article key={puzzle._id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <h4 className="font-semibold text-white">{puzzle.title}</h4>

                <p className="mt-2 text-sm text-gray-400">{puzzle.description}</p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-gray-300">{puzzle.theme}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-gray-300">{puzzle.difficulty}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/practice/${encodeURIComponent(puzzle.puzzleId)}`)}
                  className="mt-4 rounded-lg bg-lime-300 px-4 py-2 text-sm font-bold text-gray-950 transition hover:bg-lime-200"
                >
                  Practice puzzle
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default RecommendedPuzzles;
