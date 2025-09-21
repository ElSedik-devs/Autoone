import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";
import { useDispatch } from "react-redux";
import { setAuth } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError, type AxiosError } from "axios";
import type { AppDispatch } from "../store";
import { t } from "i18next";
export default function Login() {
  const [email, setEmail] = useState("admin@auto.one");
  const [password, setPassword] = useState("pass");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  function getAxiosErrorMessage(e: unknown): string {
    let msg = "Login failed";

    // Case 1: native JS error
    if (e instanceof Error && typeof e.message === "string") {
      msg = e.message;
    }

    // Case 2: Axios error
    if (isAxiosError(e)) {
      const ax = e as AxiosError<unknown>;
      const data = ax.response?.data;

      if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;

        if (typeof d.message === "string") {
          msg = d.message;
        } else if (
          d.error &&
          typeof d.error === "object" &&
          d.error !== null &&
          "message" in (d.error as Record<string, unknown>) &&
          typeof (d.error as Record<string, unknown>).message === "string"
        ) {
          msg = (d.error as Record<string, unknown>).message as string;
        }
      }
    }

    return msg;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      dispatch(
        setAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? null,
        })
      );
      const role = data.user.role as "user" | "partner" | "admin";
      if (role === "admin") nav("/admin", { replace: true });
      else if (role === "partner") nav("/partner", { replace: true });
      else nav("/", { replace: true });
    } catch (e: unknown) {
      setErr(getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function quick(role: "user" | "partner" | "admin") {
    const map = {
      user: "user@auto.one",
      partner: "partner@auto.one",
      admin: "admin@auto.one",
    } as const;
    setEmail(map[role]);
    setPassword("pass");
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          autoComplete="username"
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoComplete="current-password"
        />
        <div className="text-sm mt-3">
  <Link className="underline" to="/forgot">Forgot your password?</Link>
</div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={loading} className="btn-primary w-full">
  {loading ? "..." : "Login"}
</button>
      </form>
      <div className="text-sm mt-3">
  {t("auth.login.noAccount", { defaultValue: "No account?" })}{" "}
  <Link className="underline" to="/signup">{t("auth.signup.title", { defaultValue: "Create account" })}</Link>
    <div  >
  <span className="opacity-80">
    {t("auth.partner.ctaLabel", { defaultValue: "Want to list your services?" })}
  </span>{" "}
  <Link to="/partner/signup" className="underline">
    {t("auth.partner.become", { defaultValue: "Become a partner" })}
  </Link>
</div>
</div>

      <div className="flex items-center gap-2 mt-4 text-sm">
        Quick role:
        <button className="px-2 py-1 border rounded" onClick={() => quick("user")}>
          User
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => quick("partner")}>
          Partner
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => quick("admin")}>
          Admin
        </button>
      </div>
    </div>
  );
}
