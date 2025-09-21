import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Region = "europe" | "china" | "usa";
type Row = {
  id: number; region: Region; make: string; model: string;
  year_from?: number|null; year_to?: number|null;
  base_price: string | number; image_url?: string|null;
};

export default function ImportsList() {
  const { t } = useTranslation("common");
  const [params, setParams] = useSearchParams();
  const [region, setRegion] = useState<Region>((params.get("region") as Region) || "europe");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(r?: Region, term?: string) {
    setLoading(true);
    const { data } = await api.get<Row[]>("/import/listings", {
      params: { region: r ?? region, q: term?.trim() || undefined }
    });
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { void load(region, q); /* eslint-disable-next-line */ }, []);

  function apply() {
    const r = region;
    const term = q.trim();
    const next = new URLSearchParams();
    next.set("region", r);
    if (term) next.set("q", term);
    setParams(next);
    void load(r, term);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("import.title", { defaultValue: "Car Import" })}</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["europe","china","usa"] as Region[]).map(r => (
          <button
            key={r}
            className={`px-3 py-1.5 rounded border ${region===r ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => setRegion(r)}
          >
            {r === "europe" ? "Europe" : r === "china" ? "China" : "USA"}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder={t("import.search", { defaultValue: "Search brand or model…" })}
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <button className="btn-primary" onClick={apply}>{t("search", { defaultValue: "Search" })}</button>
      </div>

      {loading && <div>{t("loading", { defaultValue: "Loading…" })}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => (
          <Link
            key={it.id}
            to={`/import/new?region=${it.region}&make=${encodeURIComponent(it.make)}&model=${encodeURIComponent(it.model)}&price=${it.base_price}`}
            className="border rounded-lg p-3 hover:shadow transition"
          >
            {it.image_url && <img src={it.image_url} className="w-full h-40 object-cover rounded mb-2" alt="" />}
            <div className="font-semibold">{it.make} {it.model}</div>
            <div className="text-sm opacity-80">
              {it.year_from ?? "—"}–{it.year_to ?? "—"} · €{Number(it.base_price).toFixed(2)} · {it.region}
            </div>
          </Link>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="opacity-70">{t("import.none", { defaultValue: "No results." })}</div>
      )}
    </div>
  );
}
