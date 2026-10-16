import { useState } from "react";
import api from "../../api/axios";

const themes = ["Knight Forks", "Pins", "Skewers", "Checkmate", "Discovered Attacks", "Deflection"];

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const initialForm = {
  title: "",
  fen: "",
  theme: "Checkmate",
  difficulty: "Beginner",
  description: "",
  hint: "",
  solutionText: "",
};

export default function CoachPuzzleSubmission() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const solutions = form.solutionText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/));

    if (solutions.length === 0) {
      setError("Enter at least one solution line.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/puzzles/coach-submissions", {
        title: form.title,
        fen: form.fen,
        theme: form.theme,
        difficulty: form.difficulty,
        description: form.description,
        hint: form.hint,
        solutions,
      });

      setMessage(response.data.message || "Puzzle submitted for admin review.");
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Coach workspace</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Submit a chess puzzle</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Submit your tactical puzzle for admin review. Approved puzzles are intended for your students, not the shared
          puzzle library.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        {message && (
          <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="title">
            Puzzle title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={updateField}
            maxLength={120}
            required
            className={inputClass}
            placeholder="e.g. Find the winning combination"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="fen">
            Starting position (FEN)
          </label>
          <textarea
            id="fen"
            name="fen"
            value={form.fen}
            onChange={updateField}
            required
            rows={3}
            className={inputClass}
            placeholder="Paste the complete FEN position"
          />
          <p className="mt-1 text-xs text-slate-500">Use the complete FEN, including the side to move.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="theme">
              Tactical theme
            </label>
            <select id="theme" name="theme" value={form.theme} onChange={updateField} className={inputClass}>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="difficulty">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={updateField}
              className={inputClass}
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="description">
            Puzzle instructions
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={updateField}
            maxLength={1000}
            required
            rows={3}
            className={inputClass}
            placeholder="Explain what the student should find."
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="hint">
            Hint (optional)
          </label>
          <textarea
            id="hint"
            name="hint"
            value={form.hint}
            onChange={updateField}
            maxLength={500}
            rows={2}
            className={inputClass}
            placeholder="Give the student a useful clue."
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="solutionText">
            Solution lines
          </label>
          <textarea
            id="solutionText"
            name="solutionText"
            value={form.solutionText}
            onChange={updateField}
            required
            rows={4}
            className={inputClass}
            placeholder={"One line per variation, e.g.\nQh6+ Kg8 Qg7#"}
          />
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Enter SAN moves separated by spaces. Put each accepted variation on a separate line.
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Your puzzle will be submitted as pending. The admin controls approval and publication.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </section>
  );
}
