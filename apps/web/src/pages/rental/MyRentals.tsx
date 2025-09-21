import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Row = {
  id: number;
  rental_id: number;
  rental: { title?: string | null; location_city?: string | null; thumbnail?: string | null };
  start_date: string | null;
  end_date: string | null;
  unit: "hour" | "day" | "week" | "month" | "year";
  total_price: number;
  status: string;
  contractUrl?: string | null;
};

export default function MyRentals() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const { data } = await api.get<Row[]>("/rental-bookings/me");
        setItems(data);
      } catch {
        setErr(t("error.load.rentals", { defaultValue: "Failed to load your rentals." }));
      } finally { setLoading(false); }
    })();
  }, [t]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("rental.my", { defaultValue: "My Rentals" })}</h1>

      {loading && <div>{t("loading", { defaultValue: "Loading…" })}</div>}
      {err && <div className="text-red-600 mb-3">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(b => (
          <div key={b.id} className="border rounded-lg p-4">
            {b.rental.thumbnail && (
              <img src={b.rental.thumbnail} alt="" className="w-full h-32 object-cover rounded mb-3" />
            )}
            <Link to={`/rental/${b.rental_id}`} className="font-semibold hover:underline">
              {b.rental.title ?? t("rental.unknown", { defaultValue: "Rental" })}
            </Link>
            <div className="text-sm opacity-80">{b.rental.location_city ?? "—"}</div>

            <div className="mt-2 text-sm">
              <div>
                {new Date(b.start_date ?? "").toLocaleString()} → {new Date(b.end_date ?? "").toLocaleString()}
              </div>
              <div>
                {t("rental.unitLabel", { defaultValue: "Unit" })}: {b.unit}
              </div>
              <div>
                {t("total", { defaultValue: "Total" })}: €{Number(b.total_price).toFixed(2)}
              </div>
              <div className="mt-1">
                <span className="rounded px-2 py-0.5 text-xs border">{b.status}</span>
              </div>
            </div>

            {b.contractUrl && (
              <a className="btn-outline mt-3 inline-block" href={b.contractUrl} target="_blank" rel="noreferrer">
                {t("rental.download", { defaultValue: "Download contract (PDF)" })}
              </a>
            )}
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="opacity-70">{t("rental.none", { defaultValue: "No rental bookings yet." })}</div>
      )}
    </div>
  );
}
