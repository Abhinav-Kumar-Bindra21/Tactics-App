import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/coach/students");
      setStudents(response.data.students ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const viewProgress = async (student) => {
    setSelectedStudent(student);
    setProgress(null);
    setProgressError("");
    setProgressLoading(true);

    try {
      const response = await api.get(`/coach/students/${student._id}/progress`);
      setProgress(response.data);
    } catch (err) {
      setProgressError(err.response?.data?.message || "Unable to load student progress.");
    } finally {
      setProgressLoading(false);
    }
  };

  const closeProgress = () => {
    setSelectedStudent(null);
    setProgress(null);
    setProgressError("");
  };

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">My Students</h2>
          <p className="mt-1 text-sm text-gray-400">View your students and track their training progress.</p>
        </div>

        <button
          type="button"
          onClick={loadStudents}
          disabled={loading}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="mt-6 text-gray-400">Loading students...</p>}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-950/40 p-4 text-red-200">
          <p role="alert">{error}</p>
          <button type="button" onClick={loadStudents} className="mt-2 text-sm underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-semibold">No students yet</h3>
          <p className="mt-2 text-sm text-gray-400">Students connected to your coaching account will appear here.</p>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <article key={student._id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-bold text-white">{student.name}</h3>

              <p className="mt-2 break-all text-sm text-gray-400">{student.email}</p>

              <p className="mt-4 text-xs text-gray-500">
                Joined: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "Not available"}
              </p>

              <button
                type="button"
                onClick={() => viewProgress(student)}
                className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                View Progress
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{selectedStudent.name}'s Progress</h2>
              <p className="mt-1 text-sm text-gray-400">Training statistics and performance by tactical theme.</p>
            </div>

            <button
              type="button"
              onClick={closeProgress}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
            >
              Close
            </button>
          </div>

          {progressLoading && <p className="mt-6 text-gray-400">Loading progress...</p>}

          {!progressLoading && progressError && (
            <div className="mt-6 rounded-lg bg-red-950/40 p-4 text-red-200">
              <p role="alert">{progressError}</p>
              <button type="button" onClick={() => viewProgress(selectedStudent)} className="mt-2 text-sm underline">
                Try again
              </button>
            </div>
          )}

          {!progressLoading && !progressError && progress && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Attempts" value={progress.overview.totalAttempts} />
                <StatCard label="Correct Attempts" value={progress.overview.correctAttempts} />
                <StatCard label="Accuracy" value={`${progress.overview.accuracy}%`} />
                <StatCard
                  label="Average Time"
                  value={
                    progress.overview.averageDurationSeconds == null
                      ? "N/A"
                      : `${progress.overview.averageDurationSeconds}s`
                  }
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold">Performance by Theme</h3>

                {progress.themes.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-400">
                    No theme performance data is available yet. The student needs to complete some puzzle attempts
                    first.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {progress.themes.map((theme) => (
                      <div key={theme.theme} className="rounded-xl border border-white/10 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-semibold">{theme.theme}</h4>
                          <span className="text-sm font-semibold">{theme.accuracy}% accuracy</span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, theme.accuracy))}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-gray-400">
                          {theme.correctAttempts} correct out of {theme.totalAttempts} attempts
                        </p>

                        {theme.totalAttempts >= 5 && theme.accuracy < 50 && (
                          <p className="mt-2 text-sm text-amber-300">Potential area for extra practice</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default MyStudents;
