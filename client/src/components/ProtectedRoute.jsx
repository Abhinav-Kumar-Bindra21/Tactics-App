import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div className="min-h-screen bg-gray-950 p-8 text-white">Checking your login session...</div>;
  }

  // The user must be logged in.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If roles are specified, the user's role must be allowed.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
