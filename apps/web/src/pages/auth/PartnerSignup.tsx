import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useDispatch } from "react-redux";
import { setAuth } from "../../features/auth/authSlice";
import type { AppDispatch } from "../../store";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError, type AxiosError } from "axios";
import { useTranslation } from "react-i18next";

function getAxiosErrorMessage(e: unknown, fallback = "Signup failed"): string {
  if (e instanceof Error && typeof e.message === "string") return e.message;
  if (isAxiosError(e)) {
    const ax = e as AxiosError<unknown>;
    const data = ax.response?.data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message;
      if (d.errors && typeof d.errors === "object") {
        const first = Object.values(d.errors as Record<string, unknown[]>)[0];
        if (Array.isArray(first) && typeof first[0] === "string") return first[0];
      }
    }
  }
  return fallback;
}

type BusinessType = "workshop" | "carwash" | "rental" | "parts";

export default function PartnerSignup() {
  const { t } = useTranslation("common");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("workshop");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
    //   const preferred_language =
    //     i18n.language?.startsWith("ar") ? "ar" :
    //     i18n.language?.startsWith("de") ? "de" : "en";

      const { data } = await api.post("/auth/register-partner", {
        name,
        email,
        password,
        business_type: businessType,
        company_name: companyName,
        phone: phone || undefined,
        // preferred_language
      });

      dispatch(setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
      }));

      nav("/partner", { replace: true });
    } catch (e: unknown) {
      setErr(getAxiosErrorMessage(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-4">
        {t("auth.partner.signup.title", { defaultValue: "Create Partner Account" })}
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={t("profile.name", { defaultValue: "Name" })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={t("profile.company", { defaultValue: "Company name" })}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          autoComplete="organization"
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value as BusinessType)}
        >
          <option value="workshop">{t("business.workshop", { defaultValue: "Workshop" })}</option>
          <option value="carwash">{t("business.carwash", { defaultValue: "Car Wash" })}</option>
          <option value="rental">{t("business.rental", { defaultValue: "Rental" })}</option>
          <option value="parts">{t("business.parts", { defaultValue: "Spare Parts" })}</option>
        </select>
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
          placeholder={t("profile.phone", { defaultValue: "Phone (optional)" })}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder={t("auth.password", { defaultValue: "Password" })}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "…" : t("auth.signup.submit", { defaultValue: "Sign up" })}
        </button>
      </form>

      <div className="text-sm mt-3">
        {t("auth.signup.haveAccount", { defaultValue: "Already have an account?" })}{" "}
        <Link className="underline" to="/login">{t("btn.login", { defaultValue: "Login" })}</Link>
      </div>
    </div>
  );
}
