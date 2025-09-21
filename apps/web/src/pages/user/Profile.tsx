import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { setAuth } from "../../features/auth/authSlice";
import type { Lang } from "../../features/auth/authSlice";
import { useTranslation } from "react-i18next";

type Me = {
  id: number;
  name: string;
  email: string;
  role: "user" | "partner" | "admin";
  preferred_language?: Lang | null;
};

function detectLang(current: string | undefined): Lang {
  if (current?.startsWith("ar")) return "ar";
  if (current?.startsWith("de")) return "de";
  return "en";
}

function isLang(v: string): v is Lang {
  return v === "en" || v === "de" || v === "ar";
}

export default function Profile() {
  const { t, i18n } = useTranslation("common");
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState<string>(auth.user?.name ?? "");
  const [lang, setLang] = useState<Lang>(
    auth.user?.preferred_language ?? detectLang(i18n.language)
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // optional refresh from server
    (async () => {
      try {
        const { data } = await api.get<Me>("/me");
        setName(data.name);
        if (data.preferred_language) setLang(data.preferred_language);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const { data } = await api.put<Me>("/me", {
        name,
        preferred_language: lang,
      });

      // Build a typed user object (no any)
      const updatedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        preferred_language: data.preferred_language ?? null,
      };

      dispatch(
        setAuth({
          user: updatedUser,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        })
      );

      await i18n.changeLanguage(lang);
      setMsg(t("profile.saved", { defaultValue: "Saved" }));
    } catch {
      setMsg(t("profile.saveFail", { defaultValue: "Failed to save" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {t("profile.title", { defaultValue: "Profile" })}
      </h1>

      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">
            {t("profile.name", { defaultValue: "Name" })}
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            {t("profile.language", { defaultValue: "Preferred language" })}
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={lang}
            onChange={(e) => setLang(isLang(e.target.value) ? e.target.value : "en")}
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <button disabled={saving} className="btn-primary w-full">
          {saving ? "…" : t("btn.save", { defaultValue: "Save" })}
        </button>
        {msg && <div className="text-sm mt-1 opacity-80">{msg}</div>}
      </form>
    </div>
  );
}
