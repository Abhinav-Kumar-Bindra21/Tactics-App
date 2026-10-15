import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useAuth } from "../context/authContext";

function AuthPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      // Get a CSRF token and cookie before authentication.
      await api.get("/auth/csrf");

      if (mode === "signup") {
        await api.post("/auth/register", {
          name,
          email,
          password,
        });

        toast.success("Account created successfully! Please log in.");

        setMode("login");
        setPassword("");
        return;
      }

      await api.post("/auth/login", {
        email,
        password,
      });

      await refreshUser();

      toast.success("Login successful! Welcome to Tactic Lab.");

      navigate("/student/dashboard", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  function switchMode(nextMode) {
    if (loading) return;

    setMode(nextMode);
    setPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>

        <p className="mt-2 text-gray-400">
          {mode === "login" ? "Log in to continue your chess training." : "Join Tactic Lab and improve your tactics."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-black/20 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            disabled={loading}
            className={`rounded-md px-4 py-2 font-semibold ${
              mode === "login" ? "bg-lime-400 text-gray-950" : "text-gray-300"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => switchMode("signup")}
            disabled={loading}
            className={`rounded-md px-4 py-2 font-semibold ${
              mode === "signup" ? "bg-lime-400 text-gray-950" : "text-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-3 outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-3 outline-none focus:border-lime-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lime-400 px-4 py-3 font-bold text-gray-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          <button type="button" onClick={() => navigate("/")} className="underline hover:text-white">
            Back to home
          </button>
        </p>
      </section>
    </main>
  );
}

export default AuthPage;
