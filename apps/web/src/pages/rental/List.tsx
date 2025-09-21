import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Rental = {
  id: number;
  title: string;
  location_city: string;
  provider_type: "company" | "individual";
  price: number | string;
  price_unit: "hour" | "day" | "week" | "month" | "year";
  images?: string[] | null;
  rating?: number | null;
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function RentalList() {
  const { t } = useTranslation("common");
  const q = useQuery();
  const nav = useNavigate();

  const [items, setItems] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [term, setTerm] = useState(q.get("q") ?? "");
  const [provider, setProvider] = useState(q.get("providerType") ?? "all");
  const [unit, setUnit] = useState(q.get("unit") ?? "all");
  const [start, setStart] = useState(q.get("start") ?? "");
  const [end, setEnd] = useState(q.get("end") ?? "");

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (term) p.set("q", term);
    if (provider !== "all") p.set("providerType", provider);
    if (unit !== "all") p.set("unit", unit);
    if (start) p.set("start", start);
    if (end) p.set("end", end);
    nav({ pathname: "/rental", search: p.toString() });
  }

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const params = Object.fromEntries(Array.from(q.entries()));
        const { data } = await api.get<Rental[]>("/rentals", { params });
        if (on) setItems(data);
      } catch {
        if (on) setErr(t("error.load.list"));
      } finally { if (on) setLoading(false); }
    })();
    return () => { on = false; };
  }, [q, t]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{t("rental.title", { defaultValue: "Car Rental" })}</h1>

      <form onSubmit={apply} className="grid md:grid-cols-6 gap-3 mb-6">
        <input className="border rounded px-3 py-2 md:col-span-2"
          placeholder={t("rental.search", { defaultValue: "City or car…" })}
          value={term} onChange={(e)=>setTerm(e.target.value)} />
        <select className="border rounded px-3 py-2" value={provider} onChange={(e)=>setProvider(e.target.value)}>
          <option value="all">{t("rental.provider.all", { defaultValue: "Company & Individual" })}</option>
          <option value="company">{t("rental.provider.company", { defaultValue: "Company" })}</option>
          <option value="individual">{t("rental.provider.individual", { defaultValue: "Individual" })}</option>
        </select>
        <select className="border rounded px-3 py-2" value={unit} onChange={(e)=>setUnit(e.target.value)}>
          <option value="all">{t("rental.unit.any", { defaultValue: "Any unit" })}</option>
          {["hour","day","week","month","year"].map(u => <option key={u} value={u}>{t(`rental.unit.${u}`, { defaultValue: u })}</option>)}
        </select>
        <input type="datetime-local" className="border rounded px-3 py-2" value={start} onChange={(e)=>setStart(e.target.value)} />
        <input type="datetime-local" className="border rounded px-3 py-2" value={end} onChange={(e)=>setEnd(e.target.value)} />
        <button className="btn-primary md:col-span-6 md:justify-self-start">{t("filters.apply")}</button>
      </form>

      {loading && <div>{t("loading")}</div>}
      {err && <div className="text-red-600">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(r => {
          const price = Number(r.price);
          const img = r.images?.[0] ?? "/placeholder-car.png";
          return (
            <Link key={r.id} to={`/rental/${r.id}`} className="border rounded-lg p-4 hover:shadow">
              <div className="flex gap-3">
                <img src={img} alt="" className="w-28 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm opacity-80">{r.location_city} · {r.provider_type}</div>
                  <div className="mt-1 font-medium">€{price.toFixed(2)}/{t(`rental.unit.${r.price_unit}`, { defaultValue: r.price_unit })}</div>
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
