import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import axios from "axios";

type Unit = "hour" | "day" | "week" | "month" | "year";

type Rental = {
  id: number;
  title: string;
  location_city?: string | null;
  location?: string | null;
  provider_type: "company" | "individual";
  price: number | string | null;
  price_unit: Unit | null;
  images?: string[];
  specs?: Record<string, string | number>;
  description?: string | null;
  // 👇 backend detail returns a units map; include it
  units?: Partial<Record<Unit, number>>;
};

export default function RentalDetail() {
  const { id } = useParams();
  const { t } = useTranslation("common");

  const [item, setItem] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // 👇 track selected unit; default after fetch
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const { data } = await api.get<Rental>(`/rentals/${id}`);
        if (!on) return;
        setItem(data);
        // default unit: prefer server price_unit, else best from units map
        const best =
          (data.price_unit as Unit | null) ??
          (["day", "week", "month", "hour", "year"] as Unit[]).find(
            (u) => (data.units ?? {})[u] != null
          ) ??
          null;
        setSelectedUnit(best);
      } catch {
        if (on) setErr(t("error.load.detail"));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [id, t]);

  const locationLabel = item?.location_city ?? item?.location ?? "";

  const mainImage = useMemo(
    () => item?.images?.[0] ?? "/placeholder-car.png",
    [item]
  );

  // price to display for the currently selected unit
  const displayPrice = useMemo(() => {
    if (!item) return 0;
    if (selectedUnit && item.units?.[selectedUnit] != null) {
      return Number(item.units[selectedUnit]);
    }
    return Number(item.price ?? 0);
  }, [item, selectedUnit]);

  async function book() {
    if (!item || !start || !end || !selectedUnit) {
      if (!selectedUnit) alert(t("rental.unit.required", { defaultValue: "Please choose a unit." }));
      return;
    }
    try {
      setPosting(true); setResultUrl(null);
      const { data } = await api.post("/rentals/bookings", {
        rentalId: item.id,
        startAt: new Date(start).toISOString(),
        endAt: new Date(end).toISOString(),
        unit: selectedUnit,              // ✅ REQUIRED
        notes: notes || undefined,
      });
      setResultUrl(data.contractUrl);
      alert(t("rental.book.success", { defaultValue: "Booking created. Contract ready." }));
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        alert(e.response?.data?.message || t("rental.book.fail", { defaultValue: "Booking failed." }));
      } else {
        alert(t("rental.book.fail", { defaultValue: "Booking failed." }));
      }
    } finally {
      setPosting(false);
    }
  }

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
                {locationLabel} · {item.provider_type}
              </div>
              <div className="text-3xl font-bold mt-3">
                €{Number(displayPrice).toFixed(2)}{" "}
                {selectedUnit ? `/ ${t(`rental.unit.${selectedUnit}`, { defaultValue: selectedUnit })}` : null}
              </div>

              {item.specs && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6">
                  {Object.entries(item.specs).map(([k, v]) => (
                    <div key={k} className="text-sm">
                      <span className="opacity-70">{k}</span>: <span className="font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Booking */}
              <div className="border rounded-lg p-4 mt-6">
                <h2 className="font-semibold mb-2">{t("rental.book.title", { defaultValue: "Book this car" })}</h2>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <input type="datetime-local" className="border rounded px-3 py-2" value={start} onChange={(e)=>setStart(e.target.value)} />
                  <input type="datetime-local" className="border rounded px-3 py-2" value={end} onChange={(e)=>setEnd(e.target.value)} />
                </div>

                {/* Unit selector */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <select
                    className="border rounded px-3 py-2"
                    value={selectedUnit ?? ""}
                    onChange={(e) => setSelectedUnit(e.target.value as Unit)}
                  >
                    <option value="" disabled>
                      {t("rental.unit.choose", { defaultValue: "Choose unit" })}
                    </option>
                    {(["hour","day","week","month","year"] as Unit[]).map((u) =>
                      item.units?.[u] != null ? (
                        <option key={u} value={u}>
                          {t(`rental.unit.${u}`, { defaultValue: u })} — €
                          {Number(item.units?.[u]).toFixed(2)}
                        </option>
                      ) : null
                    )}
                  </select>

                  <input
                    className="border rounded px-3 py-2 sm:col-span-2"
                    placeholder={t("bookings.notes")}
                    value={notes}
                    onChange={(e)=>setNotes(e.target.value)}
                  />
                </div>

                <button className="btn-primary mt-3" disabled={!start || !end || posting || !selectedUnit} onClick={book}>
                  {posting ? t("saving") : t("rental.book.cta", { defaultValue: "Create booking & PDF contract" })}
                </button>

                {resultUrl && (
                  <div className="mt-3">
                    <a className="btn-outline" href={resultUrl} target="_blank" rel="noreferrer">
                      {t("rental.book.download", { defaultValue: "Download contract (PDF)" })}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {item.description && (
            <div className="mt-10">
              <h2 className="font-semibold mb-2">{t("rental.description", { defaultValue: "Description" })}</h2>
              <p className="opacity-90">{item.description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
