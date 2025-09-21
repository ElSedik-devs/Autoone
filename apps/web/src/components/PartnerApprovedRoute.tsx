// apps/web/src/components/PartnerApprovedRoute.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";

export default function PartnerApprovedRoute({ children }: { children: ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);
  const nav = useNavigate();

  useEffect(() => {
    if (user?.role === "partner" && user?.partner_status !== "approved") {
      nav("/partner/pending", { replace: true });
    }
  }, [user, nav]);

  return <>{children}</>;
}
