import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Item = {
  id: number;
  name: string;
  rating: number;
  price_min: string | null;
  price_max: string | null;
  services_count: number;
};

export default function CarWashList() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  async function load(search?: string) {
    setLoading(true); setErr(null);
    try {
      const { data } = await api.get<Item[]>("/workshops", {
        params: { type: "carwash", q: search || undefined },
      });
      setItems(data);
    } catch {
      setErr(t("error.load.carwash", { defaultValue: "Failed to load car wash providers" }));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(q || undefined); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const nextQ = q.trim();
    setParams(nextQ ? { q: nextQ } : {});
    load(nextQ);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("carwash.title", { defaultValue: "Car Wash" })}</h1>

      <form onSubmit={onSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder={t("carwash.search.placeholder", { defaultValue: "Search car wash…" })}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary">{t("carwash.search", { defaultValue: "Search" })}</button>
      </form>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(i => (
          <Link key={i.id} to={`/car-wash/${i.id}`} className="border rounded-lg p-4 hover:shadow">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold">{i.name}</h2>
              <span className="text-sm">⭐ {i.rating.toFixed(1)}</span>
            </div>
            <div className="text-sm opacity-80">
              {t("workshops.services", { defaultValue: "Services" })}: {i.services_count}
            </div>
            <div className="text-sm opacity-80">
              {t("workshops.price", { defaultValue: "Price" })}: {i.price_min && i.price_max ? `${i.price_min}–${i.price_max}` : "—"}
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="opacity-70">{t("carwash.none", { defaultValue: "No car wash providers." })}</div>
      )}
    </div>
  );
}
