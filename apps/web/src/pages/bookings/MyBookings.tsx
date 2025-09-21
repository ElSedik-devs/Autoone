import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { fmtMoney, fmtDateTime } from "../../lib/format";
import { useTranslation } from "react-i18next";

type Booking = {
  id: number;
  datetime: string; // ISO
  status: "pending" | "confirmed" | "rejected";
  notes?: string | null;
  service: {
    id: number;
    title: string;
    price: string;
    workshop: { id: number; name: string };
  };
};

export default function MyBookings() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get<Booking[]>("/bookings/me");
        if (mounted) setItems(data);
      } catch {
        if (mounted) setErr(t("error.load.bookings", { defaultValue: "Failed to load your bookings" }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link className="btn-outline" to="/home">← {t("nav.backHome", { defaultValue: "Back to Home" })}</Link>
      </div>

      <h1 className="text-2xl font-semibold mb-4">{t("bookings.mine.title", { defaultValue: "My Bookings" })}</h1>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{b.service.title}</div>
              <span className="text-sm opacity-80">{fmtMoney(b.service.price)}</span>
            </div>

            <div className="opacity-80 text-sm">
              {t("workshops.label", { defaultValue: "Workshop" })}:{" "}
              <Link className="underline" to={`/workshops/${b.service.workshop.id}`}>
                {b.service.workshop.name}
              </Link>
            </div>

            <div className="opacity-80 text-sm">
              {t("when", { defaultValue: "When" })}: {fmtDateTime(b.datetime)}
            </div>

            <div className="mt-2">
              <StatusBadge status={b.status} />
            </div>

            {b.notes && (
              <div className="text-sm mt-2 opacity-80">
                {t("notes", { defaultValue: "Notes" })}: {b.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="opacity-70">{t("bookings.mine.none", { defaultValue: "You have no bookings yet." })}</div>
      )}
    </div>
  );
}
