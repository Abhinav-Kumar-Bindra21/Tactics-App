import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function CoachManagement() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingCoachId, setUpdatingCoachId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCoaches() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/coaches");
        setCoaches(response.data.coaches);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load coaches.");
      } finally {
        setLoading(false);
      }
    }

    loadCoaches();
  }, []);

  const filteredCoaches = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return coaches.filter(
      (coach) => coach.name.toLowerCase().includes(search) || coach.email.toLowerCase().includes(search),
    );
  }, [coaches, searchTerm]);

  async function handleToggleStatus(coach) {
    const nextStatus = !coach.isActive;

    try {
      setUpdatingCoachId(coach._id);
      setError("");
      setSuccessMessage("");

      const response = await api.patch(`/admin/users/${coach._id}/status`, { isActive: nextStatus });

      setCoaches((currentCoaches) =>
        currentCoaches.map((item) =>
          item._id === coach._id ? { ...item, isActive: response.data.user.isActive } : item,
        ),
      );

      setSuccessMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update coach status.");
    } finally {
      setUpdatingCoachId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
          <div>
            <p className="text-sm font-semibold text-lime-400">TACTIC LAB</p>
            <h1 className="mt-1 text-2xl font-bold">Coach Management</h1>
          </div>

          <Link to="/admin/dashboard" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div>
          <h2 className="text-3xl font-extrabold">Manage Coaches</h2>
          <p className="mt-2 text-gray-400">View coach accounts and manage their access to Tactic Lab.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <label htmlFor="coach-search" className="mb-2 block text-sm font-medium text-gray-300">
            Search coaches
          </label>

          <input
            id="coach-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
          />

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-400">
            <span>Total coaches: {coaches.length}</span>
            <span>Active: {coaches.filter((coach) => coach.isActive).length}</span>
            <span>Inactive: {coaches.filter((coach) => !coach.isActive).length}</span>
          </div>
        </div>

        {successMessage && (
          <p role="status" className="mt-5 rounded-xl bg-lime-400/10 p-4 text-lime-300">
            {successMessage}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-gray-400">Loading coaches...</p>
        ) : filteredCoaches.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 p-8 text-center">
            <p className="font-semibold">
              {coaches.length === 0 ? "No coach accounts found." : "No coaches match your search."}
            </p>
            <p className="mt-2 text-sm text-gray-400">Coaches with the coach role will appear here.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Registered</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredCoaches.map((coach) => (
                  <tr key={coach._id}>
                    <td className="px-5 py-4 font-medium">{coach.name}</td>
                    <td className="px-5 py-4 text-gray-300">{coach.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          coach.isActive
                            ? "rounded-full bg-lime-400/10 px-3 py-1 text-lime-300"
                            : "rounded-full bg-red-400/10 px-3 py-1 text-red-300"
                        }
                      >
                        {coach.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {coach.createdAt ? new Date(coach.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={updatingCoachId === coach._id}
                        onClick={() => handleToggleStatus(coach)}
                        className="rounded-lg border border-white/15 px-3 py-2 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingCoachId === coach._id ? "Updating..." : coach.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default CoachManagement;
