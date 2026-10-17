import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

function ProtectedRoute({ allowedRoles, requireApprovedCoach = false }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div className="min-h-screen bg-gray-950 p-8 text-white">Checking your login session...</div>;
  }

  // The user must be logged in.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check whether the user's role is permitted.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Only approved coaches can access protected coach pages.
  if (requireApprovedCoach && user.role === "coach" && user.coachApprovalStatus !== "approved") {
    return <Navigate to="/coach/pending-approval" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
