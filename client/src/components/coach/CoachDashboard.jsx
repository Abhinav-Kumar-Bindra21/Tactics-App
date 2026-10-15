import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

function CoachDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
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

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Puzzle Library</h2>
            <p className="mt-2 text-gray-400">Create, edit, and publish tactical puzzles for students.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">My Students</h2>
            <p className="mt-2 text-gray-400">Manage students and review their training progress.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Performance</h2>
            <p className="mt-2 text-gray-400">Identify tactical weaknesses and track student improvement.</p>
          </article>
        </section>
      </div>
    </main>
  );
}

export default CoachDashboard;
