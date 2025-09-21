// apps/web/src/pages/admin/Dashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import { fmtMoney, fmtDateTime } from "../../lib/format";
import { Link } from "react-router-dom";

type Kpis = {
  users: number;
  partners: number;
  partnersPending: number;
  workshops: number;
  services: number;
  bookings: { total: number; pending: number; confirmed: number; rejected: number };
};

type Booking = {
  id: number;
  datetime: string;
  status: "pending" | "confirmed" | "rejected";
  user: { name: string; email: string };
  service: { title: string; price: string; workshop: { name: string } };
};

function KpiCard({
  title,
  value,
  accent = "blue",
  sub,
  cta,
}: {
  title: string;
  value: string | number;
  accent?: "blue" | "yellow";
  sub?: string;
  cta?: React.ReactNode;
}) {
  const accentClass =
    accent === "blue"
      ? "border-t-4 border-[#0052CC]"
      : "border-t-4 border-[#FFCC00]";
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${accentClass}`}>
      <div className="text-sm opacity-70">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-neutral-900">{value}</div>
      {sub ? <div className="mt-1 text-xs opacity-70">{sub}</div> : null}
      {cta ? <div className="mt-3">{cta}</div> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [{ data: k }, { data: b }] = await Promise.all([
        api.get<Kpis>("/admin/kpis"),
        api.get<Booking[]>("/admin/bookings"),
      ]);
      setKpis(k);
      setItems(b);
    } catch {
      setErr("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard title="Users" value={kpis?.users ?? "—"} />
        <KpiCard title="Partners" value={kpis?.partners ?? "—"} />
        <KpiCard title="Workshops" value={kpis?.workshops ?? "—"} />
        <KpiCard title="Services" value={kpis?.services ?? "—"} />
        <KpiCard
          title="Bookings"
          value={kpis?.bookings.total ?? "—"}
          sub={`pending ${kpis?.bookings.pending ?? 0} · confirmed ${kpis?.bookings.confirmed ?? 0} · rejected ${kpis?.bookings.rejected ?? 0}`}
          accent="blue"
        />

        {/* Pending partners quick access (yellow highlight) */}
        <KpiCard
          title="Pending partners"
          value={kpis?.partnersPending ?? "—"}
          accent="yellow"
          cta={
            <Link to="/admin/partners" className="btn-primary">
              Review
            </Link>
          }
        />
      </div>

      {/* Bookings table */}
      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="text-neutral-600">
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Workshop</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">{fmtDateTime(b.datetime)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {b.user.name} ({b.user.email})
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{b.service.workshop.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{b.service.title}</td>
                <td className="px-4 py-2 whitespace-nowrap">{fmtMoney(b.service.price)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-4 py-3 opacity-70" colSpan={6}>
                  No bookings.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td className="px-4 py-3 opacity-70" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
