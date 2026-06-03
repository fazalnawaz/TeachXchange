import { Navigate } from "react-router-dom";

/**
 * Guards admin-only routes. Requires a token AND the "admin" role
 * (role is stored in localStorage at login).
 */
export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
