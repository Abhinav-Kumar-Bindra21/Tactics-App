import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import CoachPuzzleSubmission from "../../components/coach/CoachPuzzleSubmission";
import MySubmissions from "../../components/coach/MySubmission";
import AddStudent from "../../components/coach/AddStudent";
import MyStudents from "../../components/coach/MyStudents";

function CoachDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function showDashboard() {
    setActiveView("dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-lime-300">TACTIC LAB</p>
            <h1 className="mt-2 text-3xl font-extrabold">Coach Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome, {user?.name || "Coach"}.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Log out
          </button>
        </header>

        {activeView !== "dashboard" && (
          <button
            type="button"
            onClick={showDashboard}
            className="mt-8 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            ← Back to dashboard
          </button>
        )}

        {activeView === "dashboard" && (
          <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveView("submit")}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-lime-300/50 hover:bg-white/10"
            >
              <h2 className="text-xl font-bold">Puzzle Library</h2>
              <p className="mt-2 text-gray-400">Submit tactical puzzles for admin review.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-lime-300">Submit a puzzle →</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("submissions")}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-lime-300/50 hover:bg-white/10"
            >
              <h2 className="text-xl font-bold">My Submissions</h2>
              <p className="mt-2 text-gray-400">Track pending, approved, and rejected puzzles.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-lime-300">View submissions →</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("addStudent")}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-lime-300/50 hover:bg-white/10"
            >
              <h2 className="text-xl font-bold">Add Student</h2>
              <p className="mt-2 text-gray-400">Register a student under your coaching account.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-lime-300">Register a student →</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("students")}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-lime-300/50 hover:bg-white/10"
            >
              <h2 className="text-xl font-bold">Get Students</h2>
              <p className="mt-2 text-gray-400">View students connected to your coaching account.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-lime-300">View students →</span>
            </button>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-bold">Performance</h2>
              <p className="mt-2 text-gray-400">Identify tactical weaknesses and track student improvement.</p>
              <p className="mt-4 text-xs text-gray-500">Performance tracking will be connected later.</p>
            </article>
          </section>
        )}

        {activeView === "submit" && (
          <section className="mt-8">
            <CoachPuzzleSubmission />
          </section>
        )}

        {activeView === "submissions" && (
          <section className="mt-8">
            <MySubmissions />
          </section>
        )}

        {activeView === "addStudent" && (
          <section className="mt-8">
            <AddStudent />
          </section>
        )}

        {activeView === "students" && (
          <section className="mt-8">
            <MyStudents />
          </section>
        )}
      </div>
    </main>
  );
}

export default CoachDashboard;
