import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import type { AxiosError } from "axios";

type Part = {
  id: number;
  owner_user_id: number | null;
  category: "tires" | "brakes" | "batteries" | "oils" | "accessories";
  name: string;
  price: number | string;
  stock: number;
  is_active: boolean;
  image_url?: string | null;
  description?: string | null;
};

type Page<T> = { data: T[]; current_page: number; last_page: number };

const CATS: Part["category"][] = ["tires", "brakes", "batteries", "oils", "accessories"];

export default function PartsManager() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [resp, setResp] = useState<Page<Part> | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Partial<Part>>({
    category: "tires",
    price: 0,
    stock: 0,
    is_active: true,
  });
  const [editing, setEditing] = useState<Part | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load(p = 1) {
    setLoading(true);
    try {
      const { data } = await api.get<Page<Part>>("/partner/parts", {
        params: { q: q || undefined, category: category || undefined, page: p },
      });
      setResp(data);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPart() {
    setErr(null);
    try {
      const payload = {
        category: form.category,
        name: form.name,
        price: Number(form.price ?? 0),
        stock: Number(form.stock ?? 0),
        image_url: form.image_url || undefined,
        description: form.description || undefined,
        is_active: !!form.is_active,
      };
      await api.post("/partner/parts", payload);
      setForm({
        category: "tires",
        price: 0,
        stock: 0,
        is_active: true,
        name: "",
        image_url: "",
        description: "",
      });
      await load(1);
    } catch (error: unknown) {
      const ax = error as AxiosError<{ message?: string }>;
      setErr(ax.response?.data?.message ?? "Failed to create part");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setErr(null);
    try {
      const payload = {
        category: editing.category,
        name: editing.name,
        price: Number(editing.price),
        stock: editing.stock,
        image_url: editing.image_url || null,
        description: editing.description || null,
        is_active: editing.is_active,
      };
      await api.patch(`/partner/parts/${editing.id}`, payload);
      setEditing(null);
      await load(page);
    } catch (error: unknown) {
      const ax = error as AxiosError<{ message?: string }>;
      setErr(ax.response?.data?.message ?? "Update failed");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this part?")) return;
    try {
      await api.delete(`/partner/parts/${id}`);
      await load(page);
    } catch (error: unknown) {
      const ax = error as AxiosError<{ message?: string }>;
      setErr(ax.response?.data?.message ?? "Delete failed");
    }
  }

  const list = useMemo(() => resp?.data ?? [], [resp]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Parts (Your Catalog)</h1>

      {/* Create */}
      <div className="rounded-xl border p-4 mb-6">
        <div className="text-sm font-semibold mb-2">Add new part</div>
        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
        <div className="grid sm:grid-cols-6 gap-2">
          <select
            className="border rounded px-3 py-2"
            value={String(form.category)}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Part["category"] }))}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="border rounded px-3 py-2 sm:col-span-2"
            placeholder="Name"
            value={form.name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Price €"
            type="number"
            step="0.01"
            value={Number(form.price ?? 0)}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.valueAsNumber }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Stock"
            type="number"
            value={Number(form.stock ?? 0)}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.valueAsNumber }))}
          />
          <input
            className="border rounded px-3 py-2 sm:col-span-2"
            placeholder="Image URL (optional)"
            value={form.image_url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2 sm:col-span-3"
            placeholder="Description (optional)"
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            <span className="text-sm">Active</span>
          </label>
          <button className="btn-primary sm:col-span-2" onClick={createPart}>
            Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select className="border rounded px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          {CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search name/desc"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-outline" onClick={() => load(1)}>
          Apply
        </button>
      </div>

      {/* List */}
      {loading && <div>Loading…</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <div key={p.id} className="border rounded-lg p-3">
            {p.image_url && <img src={p.image_url} className="w-full h-32 object-cover rounded mb-2" alt="" />}
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm capitalize opacity-80">{p.category}</div>
            <div className="mt-1 font-semibold">€{Number(p.price).toFixed(2)}</div>
            <div className="text-xs opacity-70">
              Stock: {p.stock} · {p.is_active ? "Active" : "Inactive"}
            </div>

            {!editing || editing.id !== p.id ? (
              <div className="mt-3 flex gap-2">
                <button className="btn-outline flex-1" onClick={() => setEditing(p)}>
                  Edit
                </button>
                <button className="btn-outline" onClick={() => remove(p.id)}>
                  Delete
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing!, name: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="border rounded px-3 py-2"
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing!, category: e.target.value as Part["category"] })
                    }
                  >
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    className="border rounded px-3 py-2"
                    type="number"
                    step="0.01"
                    value={Number(editing.price)}
                    onChange={(e) => setEditing({ ...editing!, price: e.target.valueAsNumber })}
                  />
                  <input
                    className="border rounded px-3 py-2"
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing!, stock: e.target.valueAsNumber })}
                  />
                </div>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Image URL"
                  value={editing.image_url ?? ""}
                  onChange={(e) => setEditing({ ...editing!, image_url: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Description"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing!, description: e.target.value })}
                />
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing!, is_active: e.target.checked })}
                  />
                  <span className="text-sm">Active</span>
                </label>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={saveEdit}>
                    Save
                  </button>
                  <button className="btn-outline" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
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
