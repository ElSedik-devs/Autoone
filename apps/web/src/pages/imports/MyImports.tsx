import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Row = {
  id: number;
  region: "europe"|"china"|"usa";
  make: string; model: string; year?: number|null; vin?: string|null;
  destination_country: string;
  purchase_price: number|string;
  estimate_breakdown: { base:number; shipping:number; customs:number; handling:number; vat:number; total:number };
  total_estimated: number|string;
  status: string;
  created_at: string;
};

export default function MyImports() {
  const { t } = useTranslation("common");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get<Row[]>("/import/orders/me");
      setRows(data);
      setLoading(false);
    })();
  }, []);

  const money = (n:number|string) => `€${Number(n).toFixed(2)}`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("import.my", { defaultValue: "My Imports" })}</h1>
      {loading && <div>{t("loading", { defaultValue: "Loading…" })}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(r => (
          <div key={r.id} className="border rounded-lg p-4">
            <div className="font-semibold">{r.make} {r.model} {r.year ? `(${r.year})` : ""}</div>
            <div className="text-sm opacity-80">{r.region.toUpperCase()} → {r.destination_country}</div>
            <div className="text-sm mt-1">
              {t("import.base", { defaultValue: "Base" })}: {money(r.estimate_breakdown.base)}<br/>
              {t("total", { defaultValue: "Total" })}: <strong>{money(r.total_estimated)}</strong>
            </div>
            <div className="mt-2"><span className="px-2 py-0.5 text-xs border rounded">{r.status}</span></div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="opacity-70">{t("import.noneMine", { defaultValue: "No import requests yet." })}</div>
      )}
    </div>
  );
}
