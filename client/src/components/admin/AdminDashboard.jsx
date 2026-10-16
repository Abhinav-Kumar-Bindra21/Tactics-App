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
    },
    {
      title: "Coach Management",
      description: "Manage coach accounts and access.",
      icon: "♟️",
      status: "Coming next",
      path: null,
    },
    {
      title: "Puzzle Library",
      description: "Review and manage published puzzles.",
      icon: "🧩",
      status: "Coming later",
      path: null,
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
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
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

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const cardContent = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {section.icon}
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
                    {section.status}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">{section.title}</h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">{section.description}</p>

                {section.path && <p className="mt-4 text-sm font-semibold text-lime-400">Manage users →</p>}
              </>
            );

            const cardClassName =
              "block rounded-2xl border border-white/10 bg-white/5 p-6 transition " +
              (section.path
                ? "cursor-pointer hover:border-lime-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
                : "");

            return section.path ? (
              <Link
                key={section.title}
                to={section.path}
                className={cardClassName}
                aria-label={`Open ${section.title}`}
              >
                {cardContent}
              </Link>
            ) : (
              <article key={section.title} className={cardClassName}>
                {cardContent}
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Signed in as</p>

          <p className="mt-2 font-semibold">{user?.email}</p>

          <p className="mt-1 text-sm text-lime-400">Role: {user?.role}</p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
