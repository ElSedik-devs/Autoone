import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  // filters
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  async function load(params?: Record<string, unknown>) {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<Item[]>("/workshops", {
        params: { type: "carwash", ...(params || {}) },
      });
      setItems(data);
    } catch {
      setErr(t("error.load.workshops", { defaultValue: "Failed to load car washes" }));
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    load({
      q: search || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
    });
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {t("carwash.title", { defaultValue: "Car Wash" })}
      </h1>

      <form onSubmit={applyFilters} className="mb-4 grid gap-2 sm:grid-cols-5">
        <input
          className="border rounded px-3 py-2"
          placeholder={t("carwash.search.placeholder", { defaultValue: "Search car wash" })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2" type="number" step="0.01" min="0"
          placeholder={t("filters.minPrice", { defaultValue: "Min price" })}
          value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2" type="number" step="0.01" min="0"
          placeholder={t("filters.maxPrice", { defaultValue: "Max price" })}
          value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2" type="number" step="0.1" min="0" max="5"
          placeholder={t("filters.minRating", { defaultValue: "Min rating" })}
          value={minRating} onChange={(e) => setMinRating(e.target.value)}
        />
        <button className="btn-primary">{t("filters.apply", { defaultValue: "Apply" })}</button>
      </form>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((w) => (
          <Link key={w.id} to={`/carwash/${w.id}`} className="border rounded-lg p-4 hover:shadow">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold">{w.name}</h2>
              <span className="text-sm">⭐ {w.rating.toFixed(1)}</span>
            </div>
            <div className="text-sm opacity-80">
              {t("workshops.price", { defaultValue: "Price" })}:{" "}
              {w.price_min && w.price_max ? `${w.price_min}–${w.price_max}` : "—"}
            </div>
            <div className="text-sm opacity-80">
              {t("workshops.services", { defaultValue: "Services" })}: {w.services_count}
            </div>
          </Link>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="opacity-70">
          {t("carwash.none", { defaultValue: "No car washes found." })}
        </div>
      )}
    </div>
  );
}
