import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const initialFormData = {
  title: "",
  fen: "",
  theme: "Checkmate",
  difficulty: "Beginner",
  description: "",
  hint: "",
  solutions: "",
};

function PuzzleLibrary() {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingPuzzles, setPendingPuzzles] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  async function loadPuzzles() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/puzzles");
      setPuzzles(response.data.puzzles ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load the puzzle library.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPendingPuzzles() {
    try {
      setPendingLoading(true);

      const response = await api.get("/admin/puzzles/pending");
      setPendingPuzzles(response.data.puzzles ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pending coach puzzles.");
    } finally {
      setPendingLoading(false);
    }
  }

  useEffect(() => {
    loadPuzzles();
    loadPendingPuzzles();
  }, []);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreatePuzzle(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const solutionMoves = formData.solutions.trim().split(/\s+/).filter(Boolean);

    if (solutionMoves.length === 0) {
      setError("Enter at least one solution move.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/admin/puzzles", {
        title: formData.title.trim(),
        fen: formData.fen.trim(),
        theme: formData.theme,
        difficulty: formData.difficulty,
        description: formData.description.trim(),
        hint: formData.hint.trim(),
        solutions: [solutionMoves],
      });

      setFormData({ ...initialFormData });
      setShowForm(false);
      setSuccessMessage(
        `${response.data.message || "Puzzle created successfully."} ${
          response.data.puzzle?.puzzleId ? `Puzzle ID: ${response.data.puzzle.puzzleId}` : ""
        }`.trim(),
      );

      await loadPuzzles();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create the puzzle.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePuzzle(puzzle) {
    const confirmed = window.confirm(`Delete "${puzzle.title}" (${puzzle.puzzleId})?\n\nThis action cannot be undone.`);

    if (!confirmed) return;

    setError("");
    setSuccessMessage("");
    setDeletingId(puzzle._id);

    try {
      const response = await api.delete(`/admin/puzzles/${puzzle._id}`);

      setPuzzles((current) => current.filter((item) => item._id !== puzzle._id));

      setSuccessMessage(response.data.message || "Puzzle deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete the puzzle.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReviewPuzzle(puzzle, decision) {
    const reviewNote = (reviewNotes[puzzle.puzzleId] || "").trim();

    if (decision === "reject" && !reviewNote) {
      setError("Please enter a reason before rejecting this puzzle.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setReviewingId(puzzle.puzzleId);

    try {
      const response = await api.patch(`/admin/puzzles/${puzzle.puzzleId}/review`, { decision, reviewNote });

      setSuccessMessage(
        response.data.message || `Puzzle ${decision === "approve" ? "approved" : "rejected"} successfully.`,
      );

      setReviewNotes((current) => {
        const next = { ...current };
        delete next[puzzle.puzzleId];
        return next;
      });

      await Promise.all([loadPuzzles(), loadPendingPuzzles()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to review this puzzle.");
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10">
          <div>
            <p className="text-sm font-semibold text-lime-400">TACTIC LAB</p>
            <h1 className="mt-1 text-2xl font-bold">Puzzle Library</h1>
          </div>

          <Link
            to="/admin/dashboard"
            className="shrink-0 rounded-xl border border-white/15 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        {/* Pending coach submissions */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Pending Coach Puzzles</h2>
              <p className="mt-2 text-sm text-gray-400">Review submissions before making them available to students.</p>
            </div>

            <span className="rounded-xl border border-white/10 px-4 py-2 text-sm">
              Pending: <strong>{pendingPuzzles.length}</strong>
            </span>
          </div>

          {pendingLoading ? (
            <p className="mt-6 text-gray-400">Loading pending puzzles...</p>
          ) : pendingPuzzles.length === 0 ? (
            <p className="mt-6 rounded-xl bg-gray-900 p-5 text-gray-400">No coach puzzles are waiting for review.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {pendingPuzzles.map((puzzle) => (
                <article key={puzzle._id} className="rounded-xl border border-white/10 bg-gray-900 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{puzzle.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        ID: {puzzle.puzzleId} · {puzzle.theme} · {puzzle.difficulty}
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-sm text-yellow-300">
                      Pending review
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-300">
                    Submitted by: {puzzle.coachId?.name || puzzle.createdBy?.name || "Unknown coach"}
                  </p>

                  {puzzle.description && <p className="mt-3 whitespace-pre-wrap text-gray-300">{puzzle.description}</p>}

                  {puzzle.fen && (
                    <details className="mt-3 text-sm text-gray-400">
                      <summary className="cursor-pointer">View FEN position</summary>
                      <p className="mt-2 break-all">{puzzle.fen}</p>
                    </details>
                  )}

                  <label htmlFor={`review-note-${puzzle.puzzleId}`} className="mt-5 block text-sm text-gray-300">
                    Review note / rejection reason
                  </label>
                  <textarea
                    id={`review-note-${puzzle.puzzleId}`}
                    value={reviewNotes[puzzle.puzzleId] || ""}
                    onChange={(event) =>
                      setReviewNotes((current) => ({
                        ...current,
                        [puzzle.puzzleId]: event.target.value,
                      }))
                    }
                    maxLength={1000}
                    rows={2}
                    placeholder="Required if rejecting this puzzle"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-lime-400"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={reviewingId !== null}
                      onClick={() => handleReviewPuzzle(puzzle, "approve")}
                      className="rounded-xl bg-lime-400 px-4 py-2 font-semibold text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingId === puzzle.puzzleId ? "Processing..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={reviewingId !== null}
                      onClick={() => handleReviewPuzzle(puzzle, "reject")}
                      className="rounded-xl border border-red-400/30 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingId === puzzle.puzzleId ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">Manage Puzzles</h2>
            <p className="mt-2 text-gray-400">View and manage puzzles stored in Tactic Lab.</p>
          </div>

          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
            Total puzzles: <strong className="text-white">{puzzles.length}</strong>
          </span>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setSuccessMessage("");
            }}
            className="rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition hover:bg-lime-300"
          >
            {showForm ? "Cancel" : "+ Add Puzzle"}
          </button>
        </div>

        {successMessage && (
          <p role="status" className="mt-5 rounded-xl bg-lime-400/10 p-4 text-lime-300">
            {successMessage}
          </p>
        )}

        {error && (
          <div role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-red-300">
            {error}
            <button
              type="button"
              onClick={() => {
                loadPuzzles();
                loadPendingPuzzles();
              }}
              className="ml-3 font-semibold underline"
            >
              Retry loading
            </button>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleCreatePuzzle}
            className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="text-xl font-bold">Create a Puzzle</h3>
            <p className="text-sm text-gray-400">The puzzle ID will be generated automatically.</p>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm text-gray-300">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter puzzle title"
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="fen" className="mb-2 block text-sm text-gray-300">
                  FEN Position
                </label>
                <textarea
                  id="fen"
                  name="fen"
                  value={formData.fen}
                  onChange={handleFormChange}
                  required
                  rows={2}
                  placeholder="Paste the chess position in FEN notation"
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label htmlFor="theme" className="mb-2 block text-sm text-gray-300">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white"
                >
                  {["Knight Forks", "Pins", "Skewers", "Checkmate", "Discovered Attacks", "Deflection"].map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="mb-2 block text-sm text-gray-300">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white"
                >
                  {["Beginner", "Intermediate", "Advanced"].map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              {[
                {
                  name: "description",
                  label: "Description",
                  placeholder: "Describe the puzzle",
                  rows: 3,
                  required: true,
                  maxLength: 1000,
                },
                {
                  name: "hint",
                  label: "Hint",
                  placeholder: "Optional hint",
                  rows: 3,
                  required: false,
                  maxLength: 500,
                },
                {
                  name: "solutions",
                  label: "Solution moves (SAN)",
                  placeholder: "Example: Qh6+ Kg8 Qg7#",
                  rows: 2,
                  required: true,
                },
              ].map((field) => (
                <div key={field.name} className="md:col-span-2">
                  <label htmlFor={field.name} className="mb-2 block text-sm text-gray-300">
                    {field.label}
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleFormChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    maxLength={field.maxLength}
                    rows={field.rows}
                    className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Puzzle"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="py-10 text-gray-400">Loading puzzles...</p>
        ) : puzzles.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="font-semibold">No puzzles found</h3>
            <p className="mt-2 text-sm text-gray-400">Add your first puzzle using the button above.</p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-5 py-4">Puzzle</th>
                  <th className="px-5 py-4">Theme</th>
                  <th className="px-5 py-4">Difficulty</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {puzzles.map((puzzle) => {
                  const isApproved = puzzle.status === "approved" || (!puzzle.status && puzzle.isPublished);

                  const statusClass = isApproved
                    ? "bg-lime-400/10 text-lime-300"
                    : puzzle.status === "rejected"
                      ? "bg-red-400/10 text-red-300"
                      : "bg-yellow-400/10 text-yellow-300";

                  return (
                    <tr key={puzzle._id} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-medium">{puzzle.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{puzzle.puzzleId}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-300">{puzzle.theme}</td>
                      <td className="px-5 py-4 text-gray-300">{puzzle.difficulty}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 ${statusClass}`}>
                          {puzzle.status ?? (puzzle.isPublished ? "Published" : "Draft")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDeletePuzzle(puzzle)}
                          disabled={deletingId !== null}
                          className="rounded-lg border border-red-400/30 px-3 py-2 font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === puzzle._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default PuzzleLibrary;
