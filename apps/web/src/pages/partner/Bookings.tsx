import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Status = "pending" | "confirmed" | "rejected";
type Booking = {
  id: number;
  datetime: string; // ISO
  status: Status;
  notes?: string | null;
  user: { id: number; name: string; email: string };
  service: {
    id: number;
    title: string;
    price: string;
    workshop: { id: number; name: string };
  };
};

const fmt = (iso: string) => new Date(iso).toLocaleString();

export default function PartnerBookings() {
  const { t } = useTranslation("common");

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [status, setStatus] = useState<"all" | Status>("all");
  const [from, setFrom] = useState<string>(""); // yyyy-mm-dd
  const [to, setTo] = useState<string>("");     // yyyy-mm-dd
  const [q, setQ] = useState<string>("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<Booking[]>("/partner/bookings");
      setItems(data);
    } catch {
      setErr("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: number, next: Exclude<Status, "pending">) {
    try {
      await api.patch(`/partner/bookings/${id}`, { status: next });
      // optimistic local update
      setItems(prev => prev.map(b => (b.id === id ? { ...b, status: next } : b)));
    } catch {
      alert("Failed to update status");
    }
  }

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs   = to   ? new Date(to   + "T23:59:59").getTime() : null;
    const needle = q.trim().toLowerCase();

    return items.filter(b => {
      if (status !== "all" && b.status !== status) return false;

      const ts = new Date(b.datetime).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs   !== null && ts > toTs)   return false;

      if (needle) {
        const hay =
          (b.user.name + " " + b.user.email + " " + b.service.title + " " + b.service.workshop.name)
            .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [items, status, from, to, q]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t("partner.bookings.title", { defaultValue: "Bookings" })}</h1>
        <button className="btn-outline" onClick={load}>
          {t("btn.reload", { defaultValue: "Reload" })}
        </button>
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}

      {/* Filters */}
      <div className="border rounded-lg p-4 mb-4 grid gap-3 md:grid-cols-5">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | Status)}
        >
          <option value="all">{t("filters.status.all", { defaultValue: "All statuses" })}</option>
          <option value="pending">{t("status.pending", { defaultValue: "Pending" })}</option>
          <option value="confirmed">{t("status.confirmed", { defaultValue: "Confirmed" })}</option>
          <option value="rejected">{t("status.rejected", { defaultValue: "Rejected" })}</option>
        </select>

        <input
          className="border rounded px-3 py-2"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder={t("filters.from", { defaultValue: "From date" })}
        />
        <input
          className="border rounded px-3 py-2"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={t("filters.to", { defaultValue: "To date" })}
        />

        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder={t("filters.search.placeholder", { defaultValue: "Search name/email/workshop/service…" })}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <div>Loading…</div>}

      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{b.service.title}</div>
              <div className="text-sm opacity-80">{b.service.workshop.name}</div>
            </div>

            <div className="text-sm opacity-80">When: {fmt(b.datetime)}</div>
            <div className="text-sm opacity-80">Customer: {b.user.name} ({b.user.email})</div>
            {b.notes && <div className="text-sm opacity-80">Notes: {b.notes}</div>}

            <div className="mt-3 flex items-center gap-2">
              <span className={
                "inline-block text-xs px-2 py-1 rounded " +
                (b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                 b.status === "confirmed" ? "bg-green-100 text-green-800" :
                 "bg-red-100 text-red-800")
              }>
                {t(`status.${b.status}`, { defaultValue: b.status })}
              </span>

              {b.status === "pending" && (
                <>
                  <button className="btn-primary" onClick={() => updateStatus(b.id, "confirmed")}>
                    {t("btn.confirm", { defaultValue: "Confirm" })}
                  </button>
                  <button className="btn-outline" onClick={() => updateStatus(b.id, "rejected")}>
                    {t("btn.reject", { defaultValue: "Reject" })}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="opacity-70">No bookings match your filters.</div>
      )}
    </div>
  );
}
