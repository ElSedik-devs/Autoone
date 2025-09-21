import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Car = {
  id: number;
  title: string;
  price: number | string;            // ← backend sends decimal as string
  year: number;
  mileage_km?: number | null;
  fuel: "petrol" | "diesel" | "hybrid" | "ev";
  condition: "new" | "used";
  thumbnail_url?: string | null;
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CarsList() {
  const { t } = useTranslation("common");
  const q = useQuery();
  const nav = useNavigate();
  const [items, setItems] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [term, setTerm] = useState(q.get("q") ?? "");
  const [cond, setCond] = useState(q.get("condition") ?? "all");
  const [fuel, setFuel] = useState(q.get("fuel") ?? "all");
  const [min, setMin] = useState(q.get("minPrice") ?? "");
  const [max, setMax] = useState(q.get("maxPrice") ?? "");

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (term) p.set("q", term);
    if (cond !== "all") p.set("condition", cond);
    if (fuel !== "all") p.set("fuel", fuel);
    if (min) p.set("minPrice", min);
    if (max) p.set("maxPrice", max);
    nav({ pathname: "/cars", search: p.toString() });
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const params = Object.fromEntries(Array.from(q.entries()));
        const { data } = await api.get<Car[]>("/cars", { params });
        if (mounted) setItems(data);
      } catch {
        if (mounted) setErr(t("error.load.list"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [q, t]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{t("cars.title")}</h1>

      <form onSubmit={applyFilters} className="grid md:grid-cols-6 gap-3 mb-6">
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder={t("cars.search")} value={term} onChange={(e)=>setTerm(e.target.value)} />
        <select className="border rounded px-3 py-2" value={cond} onChange={(e)=>setCond(e.target.value)}>
          <option value="all">{t("cars.condition.all")}</option>
          <option value="new">{t("cars.condition.new")}</option>
          <option value="used">{t("cars.condition.used")}</option>
        </select>
        <select className="border rounded px-3 py-2" value={fuel} onChange={(e)=>setFuel(e.target.value)}>
          <option value="all">{t("cars.fuel.all")}</option>
          <option value="petrol">{t("cars.fuel.petrol")}</option>
          <option value="diesel">{t("cars.fuel.diesel")}</option>
          <option value="hybrid">{t("cars.fuel.hybrid")}</option>
          <option value="ev">{t("cars.fuel.ev")}</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder={t("filters.minPrice")} value={min} onChange={(e)=>setMin(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder={t("filters.maxPrice")} value={max} onChange={(e)=>setMax(e.target.value)} />
        <button className="btn-primary md:col-span-6 md:justify-self-start">{t("filters.apply")}</button>
      </form>

      {loading && <div>{t("loading")}</div>}
      {err && <div className="text-red-600">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(car => {
          const price = Number(car.price); // ← normalize
          return (
            <Link to={`/cars/${car.id}`} key={car.id} className="border rounded-lg p-4 hover:shadow">
              <div className="flex gap-3">
                <img src={car.thumbnail_url || "/placeholder-car.png"} alt="" className="w-28 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{car.title}</div>
                  <div className="text-sm opacity-80">
                    {car.year} · {t(`cars.fuel.${car.fuel}`)} · {t(`cars.condition.${car.condition}`)}
                  </div>
                  <div className="mt-1 font-medium">€{price.toFixed(2)}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && items.length === 0 && <div className="opacity-70 mt-6">{t("empty")}</div>}
    </div>
  );
}
