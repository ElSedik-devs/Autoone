import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { add } from "../../features/cart/cartSlice";

type Part = {
  id: number; category: "tires"|"brakes"|"batteries"|"oils"|"accessories";
  name: string; price: number|string; stock: number; image_url?: string|null;
};
type Page<T> = { data: T[]; current_page: number; last_page: number };

export default function PartsList() {
  const { t } = useTranslation("common");
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [category, setCategory] = useState<string>(params.get("category") || "");
  const [q, setQ] = useState(params.get("q") || "");
  const [min, setMin] = useState(params.get("min") || "");
  const [max, setMax] = useState(params.get("max") || "");

  // NEW:
  const [model, setModel] = useState(params.get("model") || "");
  const [vin, setVin]     = useState(params.get("vin") || "");

  const [page, setPage] = useState<number>(Number(params.get("page") || 1));
  const [resp, setResp] = useState<Page<Part> | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(toPage = 1) {
    setLoading(true);
    const { data } = await api.get<Page<Part>>("/parts", {
      params: {
        category: category || undefined,
        q: q.trim() || undefined,
        min: min || undefined,
        max: max || undefined,
        model: model.trim() || undefined,  // NEW
        vin: vin.trim() || undefined,      // NEW
        page: toPage,
      }
    });
    setResp(data);
    setLoading(false);
  }

  useEffect(() => { void load(page); /* eslint-disable-next-line */ }, []);

  function applyFilters() {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (q.trim()) next.set("q", q.trim());
    if (min) next.set("min", min);
    if (max) next.set("max", max);
    if (model.trim()) next.set("model", model.trim());
    if (vin.trim()) next.set("vin", vin.trim());
    next.set("page", "1");
    setParams(next); setPage(1); void load(1);
  }

  function addToCart(p: Part) {
    dispatch(add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url, qty: 1 }));
     alert(t("parts.added", { defaultValue: "Added to cart." }));
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("parts.title", { defaultValue: "Spare Parts" })}</h1>

      <div className="grid sm:grid-cols-6 gap-2 mb-3">
        <select className="border rounded px-2 py-2" value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="">{t("parts.all", { defaultValue: "All categories" })}</option>
          <option value="tires">Tires</option><option value="brakes">Brakes</option>
          <option value="batteries">Batteries</option><option value="oils">Oils</option>
          <option value="accessories">Accessories</option>
        </select>
        <input className="border rounded px-2 py-2" placeholder={t("search", { defaultValue: "Search" })} value={q} onChange={(e)=>setQ(e.target.value)} />
        <input className="border rounded px-2 py-2" placeholder={t("parts.min", { defaultValue: "Min €" })} value={min} onChange={(e)=>setMin(e.target.value)} />
        <input className="border rounded px-2 py-2" placeholder={t("parts.max", { defaultValue: "Max €" })} value={max} onChange={(e)=>setMax(e.target.value)} />
        {/* NEW model/VIN filters */}
        <input className="border rounded px-2 py-2" placeholder={t("parts.model", { defaultValue: "Model (e.g., VW Golf)" })} value={model} onChange={(e)=>setModel(e.target.value)} />
        <input className="border rounded px-2 py-2" placeholder={t("parts.vin", { defaultValue: "VIN" })} value={vin} onChange={(e)=>setVin(e.target.value)} />
      </div>
      <div className="flex items-center gap-2 mb-6">
        <button className="btn-primary" onClick={applyFilters}>{t("apply", { defaultValue: "Apply" })}</button>
        <button className="btn-outline" onClick={()=>nav("/cart")}>🛒 {t("parts.cart", { defaultValue: "Cart" })}</button>
      </div>

      {loading && <div>{t("loading", { defaultValue: "Loading…" })}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resp?.data.map(p => (
          <div key={p.id} className="border rounded-lg p-3 hover:shadow transition">
            <Link to={`/parts/${p.id}`}>
              {p.image_url && <img src={p.image_url} className="w-full h-40 object-cover rounded mb-2" alt="" />}
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm opacity-80 capitalize">{p.category}</div>
              <div className="mt-1 font-semibold">€{Number(p.price).toFixed(2)}</div>
              <div className="text-xs opacity-70">{t("parts.stock", { defaultValue: "In stock" })}: {p.stock}</div>
            </Link>
            <div className="mt-3 flex gap-2">
              <button className="btn-outline flex-1" onClick={()=>addToCart(p)}>{t("parts.add", { defaultValue: "Add to cart" })}</button>
              <Link to="/cart" className="btn-primary">{t("parts.gotoCart", { defaultValue: "Go to cart" })}</Link>
            </div>
          </div>
        ))}
      </div>

      {resp && resp.last_page > 1 && (
        <div className="mt-6 flex gap-2">
          <button className="btn-outline" disabled={page<=1} onClick={()=>{const n=page-1; setPage(n); void load(n);}}>
            {t("prev",{defaultValue:"Prev"})}
          </button>
          <div className="px-3 py-1 border rounded">{page} / {resp.last_page}</div>
          <button className="btn-outline" disabled={page>=resp.last_page} onClick={()=>{const n=page+1; setPage(n); void load(n);}}>
            {t("next",{defaultValue:"Next"})}
          </button>
        </div>
      )}
    </div>
  );
}
