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

const themeIcons = {
  "Knight Forks": "♘",
  Pins: "♜",
  Skewers: "♝",
  Checkmate: "♚",
  "Discovered Attacks": "♞",
  Deflection: "♛",
};

export default function CoachPuzzleSubmission() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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

      const response = await api.post("/coach/puzzles", {
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
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-200";

  const sectionClass = "rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm sm:p-6";
  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-lg shadow-indigo-600/20">
              ♞
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">Tactic Lab</p>
              <p className="mt-1 text-sm text-slate-500">Coach workspace</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">Puzzle submission</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Create a tactical challenge for your students. Submit your puzzle for admin review before it becomes
                available.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Requires approval
            </div>
          </div>
        </header>

        {/* Submission status */}
        {message && (
          <div
            role="status"
            className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span className="text-lg">✓</span>
            <div>
              <p className="font-semibold">Submission response</p>
              <p className="mt-1">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="text-lg">!</span>
            <div>
              <p className="font-semibold">Unable to submit</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Puzzle details */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 font-bold text-indigo-300">
                01
              </div>

              <div>
                <h2 className="font-bold text-slate-50">Puzzle details</h2>
                <p className="mt-1 text-sm text-slate-500">Give your puzzle a clear title and starting position.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass} htmlFor="title">
                  Puzzle title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  maxLength={120}
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="e.g. Find the winning combination"
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">{form.title.length}/120 characters</p>
              </div>

              <div>
                <label className={labelClass} htmlFor="fen">
                  Starting position (FEN) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="fen"
                  name="fen"
                  value={form.fen}
                  onChange={updateField}
                  required
                  disabled={loading}
                  rows={3}
                  className={`${inputClass} resize-y font-mono text-xs leading-6`}
                  placeholder="Paste the complete FEN position..."
                />
                <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <span className="font-bold text-indigo-500">i</span>
                  Include the active color, castling rights, en passant square, halfmove clock, and fullmove number.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Classification */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 font-bold text-indigo-300">
                02
              </div>

              <div>
                <h2 className="font-bold text-slate-50">Tactical classification</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Help students practise the right skill at the right level.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="theme">
                  Tactical theme
                </label>

                <select
                  id="theme"
                  name="theme"
                  value={form.theme}
                  onChange={updateField}
                  disabled={loading}
                  className={inputClass}
                >
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>
                      {themeIcons[theme]} {theme}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="difficulty">
                  Difficulty level
                </label>

                <select
                  id="difficulty"
                  name="difficulty"
                  value={form.difficulty}
                  onChange={updateField}
                  disabled={loading}
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

            <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-50">Selected category</p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-3xl text-slate-50">{themeIcons[form.theme]}</span>

                <div>
                  <p className="font-semibold text-slate-50">{form.theme}</p>
                  <p className="mt-0.5 text-sm text-slate-50">{form.difficulty} level</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Learning content */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 font-bold text-indigo-300">
                03
              </div>

              <div>
                <h2 className="font-bold text-slate-50">Student instructions</h2>
                <p className="mt-1 text-sm text-slate-500">Explain the challenge and optionally provide a hint.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass} htmlFor="description">
                  Puzzle instructions <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength={1000}
                  required
                  disabled={loading}
                  rows={3}
                  className={`${inputClass} resize-y`}
                  placeholder="e.g. Find the best move for White."
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">{form.description.length}/1000 characters</p>
              </div>

              <div>
                <label className={labelClass} htmlFor="hint">
                  Hint <span className="font-normal text-slate-400">(optional)</span>
                </label>

                <textarea
                  id="hint"
                  name="hint"
                  value={form.hint}
                  onChange={updateField}
                  maxLength={500}
                  disabled={loading}
                  rows={2}
                  className={`${inputClass} resize-y`}
                  placeholder="Give the student a clue without revealing the answer."
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">{form.hint.length}/500 characters</p>
              </div>
            </div>
          </section>

          {/* Section 4: Solutions */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 font-bold text-indigo-300">
                04
              </div>

              <div>
                <h2 className="font-bold text-slate-50">Accepted solutions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the correct move sequences in standard algebraic notation (SAN).
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="solutionText">
                Solution variations <span className="text-red-500">*</span>
              </label>

              <textarea
                id="solutionText"
                name="solutionText"
                value={form.solutionText}
                onChange={updateField}
                required
                disabled={loading}
                rows={5}
                className={`${inputClass} resize-y font-mono text-sm leading-7`}
                placeholder={"Qh6+ Kg8 Qg7#\nAlternative line here"}
              />

              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-semibold text-slate-50">How to enter solutions</p>

                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-100">
                  <li>• Use SAN moves separated by spaces.</li>
                  <li>• Put each accepted variation on a new line.</li>
                  <li>• Include the full sequence, not only the final move.</li>
                </ul>

                <div className={`${inputClass} mt-3`}>Qh6+ Kg8 Qg7#</div>
              </div>
            </div>
          </section>

          {/* Review notice and actions */}
          <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <div className="flex items-start gap-3 border-b border-slate-800 p-5 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <span className="text-lg">⌛</span>
              </div>

              <div>
                <h2 className="font-semibold text-slate-50">Admin review required</h2>
                <p className="mt-1 text-sm leading-6 text-slate-100">
                  Your puzzle will be submitted for review. The admin controls approval and publication. Submission does
                  not guarantee approval.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-xs leading-5 text-slate-50">
                Fields marked <span className="text-red-500">*</span> are required.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting puzzle...
                  </>
                ) : (
                  <>
                    Submit for review
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </form>

        <footer className="py-6 text-center text-xs text-slate-400">
          Tactic Lab · Build better chess habits, one puzzle at a time.
        </footer>
      </div>
    </main>
  );
}
