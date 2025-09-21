import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null); setDevUrl(null);
    try {
      const { data } = await api.post("/auth/forgot", { email });
      setMsg(data?.message ?? "If an account exists, a reset link has been sent.");
      if (data?.dev?.url) setDevUrl(data.dev.url);
    } catch {
      setMsg("If an account exists, a reset link has been sent.");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-4">Forgot password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "…" : "Send reset link"}
        </button>
      </form>

      {msg && <div className="text-sm mt-3 opacity-80">{msg}</div>}

      {devUrl && (
        <div className="text-sm mt-2">
          Dev link:{" "}
          <a className="underline" href={devUrl}>
            Open reset page
          </a>
        </div>
      )}

      <div className="text-sm mt-3">
        <Link className="underline" to="/login">Back to Login</Link>
      </div>
    </div>
  );
}
