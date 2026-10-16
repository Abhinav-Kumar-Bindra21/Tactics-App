import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch users from the backend
  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await api.get("/admin/users");
        setUsers(response.data.users);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // Activate or deactivate a user
  async function handleToggleStatus(registeredUser) {
    const nextStatus = !registeredUser.isActive;

    setUpdatingUserId(registeredUser._id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.patch(`/admin/users/${registeredUser._id}/status`, { isActive: nextStatus });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === registeredUser._id
            ? {
                ...user,
                isActive: response.data.user.isActive,
              }
            : user,
        ),
      );

      setSuccessMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to update user status. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // Filter users by name, email, and role
  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((registeredUser) => {
      const matchesSearch =
        registeredUser.name.toLowerCase().includes(query) || registeredUser.email.toLowerCase().includes(query);

      const matchesRole = selectedRole === "all" || registeredUser.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10">
          <div>
            <p className="text-sm font-semibold text-lime-400">TACTIC LAB</p>
            <h1 className="mt-1 text-2xl font-bold">User Management</h1>
          </div>

          <Link
            to="/admin/dashboard"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <section>
          <p className="text-gray-400">Platform administration</p>

          <h2 className="mt-2 text-3xl font-extrabold">Registered Users</h2>

          <p className="mt-3 text-gray-400">View the accounts registered on Tactic Lab.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">All Users</h3>
              <p className="mt-1 text-sm text-gray-400">Account details from MongoDB</p>
            </div>

            <div className="rounded-xl border border-white/10 px-4 py-3">
              <span className="text-sm text-gray-400">{loading ? "Total users: " : "Matching users: "}</span>
              <span className="font-bold text-lime-400">{loading ? "…" : filteredUsers.length}</span>
            </div>
          </div>

          {/* Search and role filter */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="user-search" className="mb-2 block text-sm font-medium text-gray-300">
                Search users
              </label>

              <input
                id="user-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="role-filter" className="mb-2 block text-sm font-medium text-gray-300">
                Filter by role
              </label>

              <select
                id="role-filter"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white focus:border-lime-400 focus:outline-none"
              >
                <option value="all">All roles</option>
                <option value="student">Students</option>
                <option value="coach">Coaches</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Success message */}
          {successMessage && (
            <p role="status" className="mt-4 text-sm text-lime-400">
              {successMessage}
            </p>
          )}

          {/* Loading and error states */}
          {loading && <p className="mt-6 text-gray-400">Loading users…</p>}

          {!loading && error && (
            <p role="alert" className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && users.length === 0 && <p className="mt-6 text-gray-400">No registered users found.</p>}

          {!loading && !error && users.length > 0 && filteredUsers.length === 0 && (
            <p className="mt-6 text-gray-400">No users match your search and role filter.</p>
          )}

          {/* Users table */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Registered</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((registeredUser) => (
                    <tr key={registeredUser._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-4 font-medium">{registeredUser.name}</td>

                      <td className="px-4 py-4 text-gray-300">{registeredUser.email}</td>

                      <td className="px-4 py-4 capitalize">{registeredUser.role}</td>

                      <td className="px-4 py-4">
                        <span className={registeredUser.isActive ? "text-lime-400" : "text-red-300"}>
                          {registeredUser.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-400">
                        {registeredUser.createdAt ? new Date(registeredUser.createdAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={updatingUserId === registeredUser._id}
                          onClick={() => handleToggleStatus(registeredUser)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            registeredUser.isActive
                              ? "border border-red-400/30 text-red-300 hover:bg-red-400/10"
                              : "border border-lime-400/30 text-lime-300 hover:bg-lime-400/10"
                          }`}
                        >
                          {updatingUserId === registeredUser._id
                            ? "Updating..."
                            : registeredUser.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserManagement;
