import { useMemo, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TacticsSection from "./components/TacticsSection";
import PuzzleTrainer from "./components/PuzzleTrainer";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";

import puzzles from "./data/puzzles";
import { Route, Routes } from "react-router-dom";
import StudentDashboard from "./components/student/StudentDashboard";
import AuthPage from "./components/AuthPage";

function HomePage() {
  const [selectedTheme, setSelectedTheme] = useState("All");
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  const [progress, setProgress] = useState({
    attempts: 0,
    correctSubmissions: 0,
    solvedPuzzleIds: [],
    streak: 0,
  });

  const availablePuzzles = useMemo(() => {
    if (selectedTheme === "All") {
      return puzzles;
    }

    return puzzles.filter((puzzle) => puzzle.theme.toLowerCase() === selectedTheme.toLowerCase());
  }, [selectedTheme]);

  const currentPuzzle = availablePuzzles[puzzleIndex];

  function selectTheme(theme) {
    setSelectedTheme(theme);
    setPuzzleIndex(0);
  }

  function goToNextPuzzle() {
    setPuzzleIndex((index) => Math.min(index + 1, availablePuzzles.length - 1));
  }

  function handlePuzzleAttempt({ puzzleId, correct }) {
    setProgress((previous) => {
      const alreadySolved = previous.solvedPuzzleIds.includes(puzzleId);

      return {
        attempts: previous.attempts + 1,
        correctSubmissions: previous.correctSubmissions + (correct ? 1 : 0),
        solvedPuzzleIds: correct && !alreadySolved ? [...previous.solvedPuzzleIds, puzzleId] : previous.solvedPuzzleIds,
        streak: correct ? previous.streak + 1 : 0,
      };
    });
  }

  const successRate = progress.attempts === 0 ? 0 : Math.round((progress.correctSubmissions / progress.attempts) * 100);

  const themes = ["All", "Knight Forks", "Pins", "Skewers", "Checkmate", "Discovered Attacks", "Deflection"];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main>
        <Hero />

        <TacticsSection />

        <section className="px-5 py-10 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold tracking-[0.25em] text-lime-300">YOUR PERFORMANCE</p>

            <h2 className="mt-3 text-3xl font-extrabold text-white">Progress dashboard</h2>

            <p className="mt-2 text-gray-400">Track your training during this session.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Attempts</p>
                <p className="mt-2 text-3xl font-bold">{progress.attempts}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Puzzles solved</p>
                <p className="mt-2 text-3xl font-bold">{progress.solvedPuzzleIds.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Success rate</p>
                <p className="mt-2 text-3xl font-bold">{successRate}%</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Current streak</p>
                <p className="mt-2 text-3xl font-bold">{progress.streak}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="training" className="px-5 py-16 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold tracking-[0.25em] text-lime-300">PRACTICE</p>

            <h2 className="mt-3 text-3xl font-extrabold">Chess puzzle trainer</h2>

            <p className="mt-2 text-gray-400">Choose a tactical theme and work through the puzzles.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {themes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => selectTheme(theme)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedTheme === theme
                      ? "bg-lime-400 text-gray-950"
                      : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            {currentPuzzle ? (
              <div className="mt-8">
                <PuzzleTrainer
                  key={currentPuzzle.id}
                  puzzle={currentPuzzle}
                  onNext={goToNextPuzzle}
                  puzzleNumber={puzzleIndex + 1}
                  totalPuzzles={availablePuzzles.length}
                  onAttempt={handlePuzzleAttempt}
                />
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-bold">No puzzles available yet</h3>

                <p className="mt-2 text-gray-400">
                  We haven't added puzzles for this theme yet. Choose another theme or select All.
                </p>
              </div>
            )}
          </div>
        </section>

        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="login" element={<AuthPage />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
    </Routes>
  );
}

export default App;
