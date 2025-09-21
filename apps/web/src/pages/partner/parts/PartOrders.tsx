// apps/web/src/pages/partner/parts/PartOrders.tsx
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { AxiosError } from "axios";

type Row = {
  id: number;
  qty: number;
  unit_price: number | string;
  total_price: number | string;
  status: "submitted" | "processing" | "completed" | "cancelled";
  created_at: string;
  user: { id: number; name?: string; email: string };
  part: { id: number; name: string; image_url?: string | null };
};

type Page<T> = { data: T[]; current_page: number; last_page: number };

// What the backend might send on error
type ErrorPayload = { error?: string; message?: string };

function errorMessage(err: unknown, fallback = "Something went wrong") {
  const ax = err as AxiosError<ErrorPayload>;
  return ax.response?.data?.error ?? ax.response?.data?.message ?? ax.message ?? fallback;
}

export default function PartOrders() {
  const [resp, setResp] = useState<Page<Row> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(p = 1) {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<Page<Row>>("/partner/part-orders", { params: { page: p } });
      setResp(data);
      setPage(p);
    } catch (e) {
      setErr(errorMessage(e, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, []);

  async function updateStatus(id: number, status: Row["status"]) {
    try {
      await api.patch(`/partner/part-orders/${id}`, { status });
      await load(page);
    } catch (e) {
      alert(errorMessage(e, "Failed to update status"));
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Parts Orders</h1>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      {loading && <div>Loading…</div>}

      <div className="space-y-3">
        {resp?.data.map((o) => (
          <div key={o.id} className="border rounded-lg p-4 flex gap-3 items-center">
            {o.part?.image_url && (
              <img src={o.part.image_url} className="w-16 h-14 object-cover rounded" alt="" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{o.part?.name ?? "—"}</div>
              <div className="text-sm opacity-80">
                Buyer: {o.user?.name ? `${o.user.name} · ` : ""}
                {o.user?.email ?? "—"} · Qty {o.qty} · €{Number(o.unit_price).toFixed(2)} each
              </div>
              <div className="text-xs opacity-70">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="text-sm font-semibold mr-2">
              €{Number(o.total_price).toFixed(2)}
            </div>
            <select
              className="border rounded px-2 py-1"
              value={o.status}
              onChange={(e) => updateStatus(o.id, e.target.value as Row["status"])}
            >
              <option value="submitted">submitted</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        ))}
      </div>

      {!loading && resp && resp.data.length === 0 && (
        <div className="opacity-70 mt-3">No orders yet.</div>
      )}

      {resp && resp.last_page > 1 && (
        <div className="mt-6 flex gap-2">
          <button
            className="btn-outline"
            disabled={page <= 1}
            onClick={() => {
              const n = page - 1;
              setPage(n);
              void load(n);
            }}
          >
            Prev
          </button>
          <div className="px-3 py-1 border rounded">
            {page} / {resp.last_page}
          </div>
          <button
            className="btn-outline"
            disabled={page >= resp.last_page}
            onClick={() => {
              const n = page + 1;
              setPage(n);
              void load(n);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
