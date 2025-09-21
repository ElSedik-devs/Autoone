import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Row = {
  id: number; qty: number; unit_price: number|string; total_price: number|string;
  status: string; created_at: string;
  part: { id:number; name:string; image_url?:string|null };
};

export default function MyPartOrders() {
  const { t } = useTranslation("common");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get<Row[]>("/part-orders/me");
      setRows(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("parts.myOrders", { defaultValue: "My Parts Orders" })}</h1>

      {loading && <div>{t("loading", { defaultValue: "Loading…" })}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(o => (
          <div key={o.id} className="border rounded-lg p-4">
            {o.part.image_url && <img src={o.part.image_url} className="w-full h-28 object-cover rounded mb-2" alt="" />}
            <div className="font-semibold">{o.part.name}</div>
            <div className="text-sm">
              {t("parts.qty", { defaultValue: "Quantity" })}: {o.qty}
              {" · "}€{Number(o.unit_price).toFixed(2)} {t("each", { defaultValue: "each" })}
            </div>
            <div className="font-semibold mt-1">
              {t("total", { defaultValue: "Total" })}: €{Number(o.total_price).toFixed(2)}
            </div>
            <div className="mt-1"><span className="px-2 py-0.5 text-xs border rounded">{o.status}</span></div>
            <div className="text-xs opacity-70 mt-1">{new Date(o.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="opacity-70">{t("parts.noneOrders", { defaultValue: "No orders yet." })}</div>
      )}
    </div>
  );
}
