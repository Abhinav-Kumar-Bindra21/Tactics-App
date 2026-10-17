import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function CoachPendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isRejected = user?.coachApprovalStatus === "rejected";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-bold">
          {isRejected ? "Coach Application Rejected" : "Coach Application Pending"}
        </h1>

        <p className="mt-4 text-gray-300">Welcome, {user?.name}. Your coach registration has been received.</p>

        {isRejected ? (
          <p className="mt-3 text-red-400">
            Your coach application was rejected. Please contact the administrator for more information.
          </p>
        ) : (
          <p className="mt-3 text-gray-400">
            An administrator must approve your account before you can access coach features. Please check back later.
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-lime-400 px-5 py-3 font-bold text-gray-950 hover:bg-lime-300"
        >
          Log out
        </button>
      </section>
    </main>
  );
}

export default CoachPendingApproval;
