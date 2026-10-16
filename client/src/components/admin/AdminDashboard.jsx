import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function AdminDashboard() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  const sections = [
    {
      title: "User Management",
      description: "View and manage student accounts.",
      icon: "👥",
      status: "Active",
      path: "/admin/users",
      action: "Manage users",
    },
    {
      title: "Coach Management",
      description: "Manage coach accounts and access.",
      icon: "♟️",
      status: "Active",
      path: "/admin/coaches",
      action: "Manage coaches",
    },
    {
      title: "Puzzle Library",
      description: "Create, view, and manage published chess puzzles.",
      icon: "🧩",
      status: "Active",
      path: "/admin/puzzles",
      action: "Manage puzzles",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10">
          <div>
            <p className="text-sm font-semibold text-lime-400">TACTIC LAB</p>
            <h1 className="mt-1 text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-lime-400/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <section>
          <p className="text-gray-400">Platform administration</p>

          <h2 className="mt-2 text-3xl font-extrabold">Welcome, {user?.name || "Admin"}</h2>

          <p className="mt-3 max-w-2xl text-gray-400">
            Manage Tactic Lab users, coaches, and training content from one place.
          </p>
        </section>

        <section aria-label="Admin management sections" className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.title}
              to={section.path}
              aria-label={`Open ${section.title}`}
              className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-200 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {section.icon}
                </span>

                <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
                  {section.status}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold transition group-hover:text-lime-300">{section.title}</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">{section.description}</p>

              <p className="mt-4 text-sm font-semibold text-lime-400">
                {section.action} <span aria-hidden="true">→</span>
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Signed in as</p>

          <p className="mt-2 font-semibold">{user?.email || "Email unavailable"}</p>

          <p className="mt-1 text-sm text-lime-400">Role: {user?.role || "Admin"}</p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
