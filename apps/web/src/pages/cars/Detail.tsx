import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import FinanceCalc from "./FinanceCalc";

type Car = {
  id: number;
  title: string;
  price: number | string;      // ← normalize
  year: number;
  mileage_km?: number | null;
  fuel: "petrol" | "diesel" | "hybrid" | "ev";
  condition: "new" | "used";
  images?: string[];
  specs?: Record<string, string | number>;
  description?: string | null;
};

export default function CarDetail() {
  const { id } = useParams();
  const { t } = useTranslation("common");
  const [item, setItem] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const { data } = await api.get<Car>(`/cars/${id}`);
        if (mounted) setItem(data);
      } catch {
        if (mounted) setErr(t("error.load.detail"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, t]);

  const mainImage = useMemo(() => item?.images?.[0] || "/placeholder-car.png", [item]);
  const priceNum = Number(item?.price ?? 0);

  return (
    <div className="container py-8">
      {loading && <div>{t("loading")}</div>}
      {err && <div className="text-red-600">{err}</div>}
      {!item ? null : (
        <>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <img src={mainImage} alt="" className="w-full rounded" />
              {item.images && item.images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {item.images.slice(1).map((src, i) => (
                    <img key={i} src={src} alt="" className="w-28 h-20 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold">{item.title}</h1>
              <div className="opacity-80 mt-1">
                {item.year} · {t(`cars.fuel.${item.fuel}`)} · {t(`cars.condition.${item.condition}`)}
                {item.mileage_km ? ` · ${item.mileage_km.toLocaleString()} km` : ""}
              </div>
              <div className="text-3xl font-bold mt-3">€{priceNum.toFixed(2)}</div>

              {item.specs && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6">
                  {Object.entries(item.specs).map(([k, v]) => (
                    <div key={k} className="text-sm">
                      <span className="opacity-70">{k}</span>: <span className="font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <h2 className="font-semibold mb-2">{t("cars.finance.title")}</h2>
                <FinanceCalc price={priceNum} />
              </div>
            </div>
          </div>

          {item.description && (
            <div className="mt-10">
              <h2 className="font-semibold mb-2">{t("cars.description")}</h2>
              <p className="opacity-90">{item.description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
