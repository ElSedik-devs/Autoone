// apps/web/src/pages/carwash/Detail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import type { ServiceInfo } from "../../types";
import ServiceInfoCard from "../../components/service/ServiceInfoCard";

type Workshop = {
  id: number;
  name: string;
  rating: number;
  price_min: string | null;
  price_max: string | null;
  services: ServiceInfo[];
};

export default function CarWashDetail() {
  const { t, i18n } = useTranslation("common");
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // booking state
  const [selected, setSelected] = useState<number | null>(null);
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");

  // currently selected service object (with info template fields)
  const selectedService = useMemo(
    () => item?.services.find((s) => s.id === selected) ?? null,
    [item, selected]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get<Workshop>(`/workshops/${id}`);
        if (!mounted) return;
        setItem(data);
        // preselect first service to show the info card immediately
        if (data.services?.length && !selected) {
          setSelected(data.services[0].id);
        }
      } catch {
        if (mounted) setErr(t("error.load.detail", { defaultValue: "Failed to load details" }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // include language so backend i18n (Accept-Language) reflects selected locale
  }, [id, i18n.language, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = useMemo(() => !!selected && !!when, [selected, when]);

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !when) return;

    // input type="datetime-local" returns local datetime; convert to ISO
    const iso = new Date(when).toISOString();

    await api.post("/bookings", {
      serviceId: selected,
      datetime: iso,
      notes: note || undefined,
    });

    nav("/bookings");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link className="btn-outline" to="/car-wash">
          ← {t("common.backToList", { defaultValue: "Back to list" })}
        </Link>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 mb-2">{err}</div>}
      {!item ? null : (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">{item.name}</h1>
            <div className="opacity-80 mt-1">
              {t("workshops.price", { defaultValue: "Price" })}:{" "}
              {item.price_min ?? "—"}–{item.price_max ?? "—"} · ⭐ {item.rating.toFixed(1)}
            </div>
          </div>

          <h2 className="font-semibold mb-2">
            {t("workshops.services", { defaultValue: "Services" })}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {item.services.map((s) => (
              <button
                key={s.id}
                type="button"
                className={
                  "border rounded-lg p-3 flex items-center justify-between hover:shadow " +
                  (selected === s.id ? "ring-2 ring-primary" : "")
                }
                onClick={() => setSelected(s.id)}
              >
                <div className="font-medium">{s.title_i18n ?? s.title}</div>
                <div className="opacity-80 text-sm">€{Number(s.price).toFixed(2)}</div>
              </button>
            ))}
          </div>

          {/* Service Info (DB-driven, hides empty sections automatically) */}
          {selectedService && <ServiceInfoCard s={selectedService} />}

          <div className="border rounded-lg p-4 mt-6">
            <h3 className="font-semibold mb-3">
              {t("workshops.book.title", { defaultValue: "Book this service" })}
            </h3>
            <form onSubmit={book} className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2 bg-gray-50"
                placeholder={t("workshops.book.selected", { defaultValue: "Selected service" })}
                value={selectedService ? (selectedService.title_i18n ?? selectedService.title) : ""}
                readOnly
              />
              <input
                className="w-full border rounded px-3 py-2"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder={t("workshops.book.notes", { defaultValue: "Notes (optional)" })}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <button className="btn-primary" disabled={!canSubmit}>
                  {t("workshops.book.cta", { defaultValue: "Book now" })}
                </button>
                <Link className="btn-outline" to="/bookings">
                  {t("home.quick.bookings", { defaultValue: "Go to my bookings" })}
                </Link>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
