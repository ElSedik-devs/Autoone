import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../store";

export default function RoleRedirect() {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "partner") return <Navigate to="/partner" replace />;
  return <Navigate to="/home" replace />; // regular user portal home
}
