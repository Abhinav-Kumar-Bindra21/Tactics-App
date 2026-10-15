import { useEffect, useState } from "react";
import api from "../../api/axios.js";

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/puzzles/my-dashboard");
        setDashboard(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your dashboard. Please log in and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Student Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Total Attempts" value={dashboard.totalAttempts} />

        <StatCard title="Correct Attempts" value={dashboard.correctAttempts} />

        <StatCard title="Accuracy" value={`${dashboard.accuracy}%`} />

        <StatCard title="Repeated Mistakes" value={dashboard.repeatedMistakePuzzleCount} />
      </div>

      <section className="mt-6 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Weakest Tactical Theme</h2>

        <p className="mt-2">{dashboard.weakestTheme ? dashboard.weakestTheme.theme : "Not enough practice data yet"}</p>
      </section>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <section className="rounded-xl border p-5 shadow-sm">
      <h2 className="text-sm text-gray-500">{title}</h2>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </section>
  );
}

export default StudentDashboard;
