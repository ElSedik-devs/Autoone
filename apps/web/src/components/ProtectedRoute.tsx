import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../store";
import type { ReactElement } from "react"; 

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;                       
  roles?: Array<"user" | "partner" | "admin">;
}) {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
