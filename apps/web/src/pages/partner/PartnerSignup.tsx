// apps/web/src/pages/partner/PartnerSignup.tsx
import { useState } from "react";
import { api } from "../../lib/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";

type Biz = "workshop" | "carwash" | "rental" | "parts";

export default function PartnerSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<Biz>("workshop");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const { data } = await api.post("/auth/partner-register", {
        name,
        email,
        password,
        business_type: type,
        company_name: company,
        phone: phone || undefined,
      });

      // ✅ No import needed — dispatch by action type created by createSlice
      dispatch({
        type: "auth/loginSuccess",
        payload: { token: data.token as string, user: data.user },
      });

      nav("/partner", { replace: true });
    } catch (error: unknown) {
      const ax = error as AxiosError<{ message?: string }>;
      const msg = ax.response?.data?.message ?? "Registration failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Register as Partner</h1>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Company name" value={company} onChange={(e)=>setCompany(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Phone (optional)" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <select className="w-full border rounded px-3 py-2" value={type} onChange={(e)=>setType(e.target.value as Biz)}>
          <option value="workshop">Workshop</option>
          <option value="carwash">Car Wash</option>
          <option value="rental">Rental Company</option>
          <option value="parts">Spare Parts Seller</option>
        </select>

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>

        <div className="text-sm opacity-80">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </div>
      </form>
    </div>
  );
}
