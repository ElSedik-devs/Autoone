import { useState, type FormEvent } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const initialEmail = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      await api.post("/auth/reset", {
        email, token, password, password_confirmation: confirm,
      });
      setMsg("Password reset. Redirecting to login…");
      setTimeout(() => nav("/login", { replace: true }), 800);
    } catch  {
      setMsg("Reset failed. Check the link or try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-4">Reset password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "…" : "Reset"}
        </button>
      </form>
      {msg && <div className="text-sm mt-3 opacity-80">{msg}</div>}

      <div className="text-sm mt-3">
        <Link className="underline" to="/login">Back to Login</Link>
      </div>
    </div>
  );
}
