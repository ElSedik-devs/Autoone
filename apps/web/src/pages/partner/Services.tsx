import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Workshop = { id: number; name: string };
type Lang = "en" | "de" | "ar";
type Service = {
  id: number;
  workshop_id: number;
  title: string;
  price: string; // API returns string
  workshop: Workshop;
  title_translations?: Partial<Record<Lang, string>> | null;
};

function normLang(code?: string): Lang {
  if (!code) return "en";
  if (code.startsWith("ar")) return "ar";
  if (code.startsWith("de")) return "de";
  return "en";
}

export default function PartnerServices() {
  const { i18n } = useTranslation("common");
  const currentLang = normLang(i18n.language);

  // list state
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // create form state
  const [newWorkshopId, setNewWorkshopId] = useState<number | "">("");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [showTranslations, setShowTranslations] = useState(false);
  const [tEn, setTEn] = useState("");
  const [tDe, setTDe] = useState("");
  const [tAr, setTAr] = useState("");

  // edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [eShowTranslations, setEShowTranslations] = useState(false);
  const [eEn, setEEn] = useState("");
  const [eDe, setEDe] = useState("");
  const [eAr, setEAr] = useState("");

  const workshops = useMemo<Workshop[]>(() => {
    const map = new Map<number, Workshop>();
    for (const s of items) map.set(s.workshop.id, s.workshop);
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  function displayLabel(s: Service): string {
    const tr = s.title_translations?.[currentLang];
    return tr && tr.trim().length > 0 ? tr : s.title;
    }

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<Service[]>("/partner/services");
      setItems(data);
      if (newWorkshopId === "" && data.length > 0) {
        setNewWorkshopId(data[0].workshop.id);
      }
    } catch {
      setErr("Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- create --------
  async function addService(e: FormEvent) {
    e.preventDefault();
    if (newWorkshopId === "") return;

    const payload: {
      workshop_id: number;
      title: string;
      price: number;
      title_translations?: Partial<Record<Lang, string>>;
    } = {
      workshop_id: Number(newWorkshopId),
      title: newTitle.trim(),
      price: Number(newPrice || 0),
    };

    if (showTranslations) {
      const tr: Partial<Record<Lang, string>> = {};
      if (tEn.trim()) tr.en = tEn.trim();
      if (tDe.trim()) tr.de = tDe.trim();
      if (tAr.trim()) tr.ar = tAr.trim();
      if (Object.keys(tr).length > 0) payload.title_translations = tr;
    }

    try {
      const { data } = await api.post<Service>("/partner/services", payload);
      setItems((prev) => [data, ...prev]);
      // reset form
      setNewTitle("");
      setNewPrice("");
      setShowTranslations(false);
      setTEn("");
      setTDe("");
      setTAr("");
    } catch {
      alert("Failed to create service");
    }
  }

  // -------- edit --------
  function beginEdit(s: Service) {
    setEditId(s.id);
    setEditTitle(s.title);
    setEditPrice(s.price);
    const hasTr = !!s.title_translations;
    setEShowTranslations(hasTr);
    setEEn(s.title_translations?.en ?? "");
    setEDe(s.title_translations?.de ?? "");
    setEAr(s.title_translations?.ar ?? "");
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditPrice("");
    setEShowTranslations(false);
    setEEn("");
    setEDe("");
    setEAr("");
  }

  async function saveEdit(id: number) {
    const payload: {
      title?: string;
      price?: number;
      title_translations?: Partial<Record<Lang, string>>;
    } = {
      title: editTitle.trim(),
      price: Number(editPrice || 0),
    };

    if (eShowTranslations) {
      const tr: Partial<Record<Lang, string>> = {};
      if (eEn.trim()) tr.en = eEn.trim();
      if (eDe.trim()) tr.de = eDe.trim();
      if (eAr.trim()) tr.ar = eAr.trim();
      payload.title_translations = tr;
    }

    try {
      const { data } = await api.patch<Service>(`/partner/services/${id}`, payload);
      setItems((prev) => prev.map((s) => (s.id === id ? data : s)));
      cancelEdit();
    } catch {
      alert("Failed to save changes");
    }
  }

  // -------- delete --------
  async function remove(id: number) {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/partner/services/${id}`);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Services</h1>

      {/* create form */}
      <form onSubmit={addService} className="border rounded-lg p-4 mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            className="border rounded px-3 py-2"
            value={newWorkshopId}
            onChange={(e) => setNewWorkshopId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <input
            className="border rounded px-3 py-2"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Price"
            type="number"
            step="0.01"
            min="0"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
        </div>

        <div className="mt-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTranslations}
              onChange={(e) => setShowTranslations(e.target.checked)}
            />
            <span>Add title translations (optional)</span>
          </label>
        </div>

        {showTranslations && (
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Title (English)"
              value={tEn}
              onChange={(e) => setTEn(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Titel (Deutsch)"
              value={tDe}
              onChange={(e) => setTDe(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="العنوان (عربي)"
              dir="rtl"
              value={tAr}
              onChange={(e) => setTAr(e.target.value)}
            />
          </div>
        )}

        <button className="btn-primary mt-3">Add Service</button>
      </form>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 mb-2">{err}</div>}

      <div className="divide-y border rounded-lg">
        {items.map((s) => (
          <div
            key={s.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
          >
            <div className="sm:w-64">
              <div className="text-sm opacity-70">{s.workshop.name}</div>

              {editId === s.id ? (
                <input
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <div className="font-medium">{displayLabel(s)}</div>
              )}
            </div>

            <div className="sm:w-32">
              {editId === s.id ? (
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              ) : (
                <div className="opacity-80">{Number(s.price).toFixed(2)}</div>
              )}
            </div>

            {/* edit translations */}
            {editId === s.id && (
              <div className="flex-1">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={eShowTranslations}
                    onChange={(e) => setEShowTranslations(e.target.checked)}
                  />
                  <span>Title translations</span>
                </label>

                {eShowTranslations && (
                  <div className="grid sm:grid-cols-3 gap-3 mt-2">
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Title (English)"
                      value={eEn}
                      onChange={(e) => setEEn(e.target.value)}
                    />
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Titel (Deutsch)"
                      value={eDe}
                      onChange={(e) => setEDe(e.target.value)}
                    />
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="العنوان (عربي)"
                      dir="rtl"
                      value={eAr}
                      onChange={(e) => setEAr(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {editId === s.id ? (
                <>
                  <button
                    className="btn-primary"
                    onClick={() => saveEdit(s.id)}
                    type="button"
                  >
                    Save
                  </button>
                  <button className="btn-outline" onClick={cancelEdit} type="button">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-outline" onClick={() => beginEdit(s)} type="button">
                    Edit
                  </button>
                  <button className="btn-outline" onClick={() => remove(s.id)} type="button">
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="opacity-70 mt-3">No services yet.</div>
      )}
    </div>
  );
}
