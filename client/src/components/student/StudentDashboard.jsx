import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { useAuth } from "../../context/authContext";
import ThemeProgress from "./ThemeProgress";
import RecommendedPuzzles from "./RecommendedPuzzles";
import RepeatedMistakes from "./RepeatedMistakes";

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await api.get("/puzzles/my-dashboard");

        if (active) {
          setDashboard(response.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "We couldn't load your dashboard. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have logged out successfully.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/puzzles/my-dashboard");
      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-lime-300" />
          <p className="mt-5 font-medium">Preparing your training dashboard...</p>
          <p className="mt-2 text-sm text-gray-400">Loading your chess progress</p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-5 text-white">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold">Dashboard unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {error || "Your dashboard data is currently unavailable."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-lime-300 px-5 py-2.5 font-bold text-gray-950 transition hover:bg-lime-200"
            >
              Try again
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/15 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  const totalAttempts = dashboard.totalAttempts ?? 0;
  const correctAttempts = dashboard.correctAttempts ?? 0;
  const accuracy = Math.min(100, Math.max(0, Number(dashboard.accuracy) || 0));
  const repeatedMistakes = dashboard.repeatedMistakePuzzleCount ?? 0;

  const stats = [
    {
      title: "Puzzles attempted",
      value: totalAttempts,
      detail: "Your total practice attempts",
    },
    {
      title: "Correct attempts",
      value: correctAttempts,
      detail: "Attempts solved correctly",
    },
    {
      title: "Overall accuracy",
      value: `${accuracy}%`,
      detail: "Your success rate",
    },
    {
      title: "Puzzles to revisit",
      value: repeatedMistakes,
      detail: "Puzzles missed more than once",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-extrabold tracking-[0.25em] text-lime-300">TACTIC LAB</p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Your training space</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              {user?.name ? `Welcome back, ${user.name}. ` : "Welcome back. "}
              Build stronger chess instincts, review your mistakes, and keep improving one puzzle at a time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/tactics")}
              className="rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-lime-200"
            >
              Explore tactics
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Progress summary */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold sm:text-2xl">Your progress at a glance</h2>
            <p className="mt-1 text-sm text-gray-400">Every attempt helps you understand your chess better.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <article
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-lime-300/30 hover:bg-white/[0.06]"
              >
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>

                <p className={`mt-4 text-3xl font-extrabold ${index === 2 ? "text-lime-300" : "text-white"}`}>
                  {stat.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">{stat.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* First-practice guidance */}
        {totalAttempts === 0 && (
          <section className="mt-6 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Start your journey</p>

            <h2 className="mt-2 text-xl font-bold">Your chess improvement starts with one move.</h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
              You haven't recorded any puzzle attempts yet. Start practising tactical patterns to build your progress
              history and unlock personalized recommendations.
            </p>

            <button
              type="button"
              onClick={() => navigate("/tactics")}
              className="mt-5 rounded-lg bg-lime-300 px-5 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-lime-200"
            >
              Start practising
            </button>
          </section>
        )}

        {/* Main dashboard content */}
        <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
          <div className="min-w-0 space-y-6 xl:col-span-2">
            <RecommendedPuzzles />
            <ThemeProgress />
            <RepeatedMistakes />
          </div>

          <aside className="min-w-0 space-y-6">
            {/* Weakest theme */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Training focus</p>

              <h2 className="mt-3 text-xl font-bold">Your weakest tactical theme</h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Focused practice can help turn a difficult pattern into a familiar one.
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                {dashboard.weakestTheme ? (
                  <>
                    <p className="font-semibold text-white">{dashboard.weakestTheme.theme}</p>

                    <p className="mt-2 text-sm text-gray-400">
                      {dashboard.weakestTheme.accuracy}% accuracy across {dashboard.weakestTheme.totalAttempts} attempts
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-gray-400">
                    Keep practising. Once you have enough attempts in a theme, we'll identify an area to focus on.
                  </p>
                )}
              </div>
            </section>

            {/* Accuracy guide */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-bold">Accuracy tracker</h2>

              <div className="mt-4 flex items-end justify-between gap-3">
                <p className="text-sm text-gray-400">Overall success rate</p>
                <p className="text-2xl font-extrabold text-lime-300">{accuracy}%</p>
              </div>

              <div
                className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Overall success rate"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={accuracy}
              >
                <div
                  className="h-full rounded-full bg-lime-300 transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Accuracy reflects recorded attempts, not your chess rating. Review mistakes as well as correct answers
                to keep learning.
              </p>
            </section>
          </aside>
        </div>

        {/* Detailed progress
        <section className="mt-8">
          <ProgressOverview />
        </section> */}

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-gray-500">
          Tactic Lab · Keep learning, one position at a time.
        </footer>
      </div>
    </main>
  );
};

export default StudentDashboard;
