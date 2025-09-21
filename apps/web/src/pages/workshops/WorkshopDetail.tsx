// apps/web/src/pages/workshops/WorkshopDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Service = {
  id: number;
  workshop_id: number;
  title: string;
  title_i18n?: string;
  price: string;
};

type WorkshopDetailT = {
  id: number;
  name: string;
  rating: number;
  price_min: string | null;
  price_max: string | null;
  services: Service[];
};

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("common");

  const [data, setData] = useState<WorkshopDetailT | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState<number | null>(null);
  const [datetime, setDatetime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get<WorkshopDetailT>(`/workshops/${id}`);
        if (mounted) setData(data);
      } catch {
        if (mounted) setErr(t("error.load.workshop"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, i18n.language, t]);

  const selected = useMemo(
    () => data?.services.find((s) => s.id === serviceId) ?? null,
    [data, serviceId]
  );

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !datetime) return;

    setSubmitting(true);
    setOkMsg(null);
    setErr(null);
    try {
      const iso = new Date(datetime).toISOString();
      await api.post("/bookings", {
        serviceId,
        datetime: iso,
        notes: notes || undefined,
      });
      setOkMsg(t("workshop.book.ok"));
      setDatetime("");
      setNotes("");
    } catch {
      setErr(t("error.create.booking"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6">{t("loading", { defaultValue: "Loading…" })}</div>;
  if (err)
    return (
      <div className="p-6">
        <div className="text-red-600 mb-3">{err}</div>
        <Link className="btn-outline" to="/workshops">
          {t("workshop.back")}
        </Link>
      </div>
    );
  if (!data) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link className="btn-outline" to="/workshops">
          {t("workshop.back")}
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">{data.name}</h1>
      <div className="opacity-80 mt-1">
        ⭐ {data.rating.toFixed(1)} · {t("workshops.price")}{" "}
        {data.price_min ?? "—"}
        {data.price_min && data.price_max ? `–${data.price_max}` : ""}
      </div>

      {/* Services */}
      <h2 className="text-xl font-semibold mt-6 mb-3">{t("workshop.services")}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {data.services.map((s) => {
          const active = serviceId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={`text-left border rounded-lg p-4 hover:shadow transition
                ${active ? "ring-2 ring-[#0052CC]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{s.title_i18n ?? s.title}</div>
                <div className="opacity-80">€{Number(s.price).toFixed(2)}</div>
              </div>
              {active && (
                <div className="text-xs mt-2 text-[#0052CC]">
                  {t("workshop.book.selectedService")}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking form */}
      <h2 className="text-xl font-semibold mt-6 mb-3">{t("workshop.book.title")}</h2>
      <form onSubmit={submitBooking} className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">{t("workshop.book.selectedService")}</label>
          <input
            className="w-full border rounded px-3 py-2 bg-gray-50"
            value={selected ? (selected.title_i18n ?? selected.title) : ""}
            readOnly
            placeholder={t("workshop.book.selectedService")}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">{t("workshop.book.datetime")}</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-3 py-2"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">{t("workshop.book.notes")}</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("workshop.book.notes")}
          />
        </div>

        {okMsg && <div className="text-green-700 text-sm">{okMsg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}

        <button className="btn-primary" disabled={!serviceId || !datetime || submitting}>
          {submitting ? "…" : t("workshop.book.bookNow")}
        </button>
      </form>

      <div className="mt-6">
        <Link className="btn-outline" to="/bookings">
          {t("workshop.book.goToBookings", { defaultValue: t("workshop.goToBookings") })}
        </Link>
      </div>
    </div>
  );
}
