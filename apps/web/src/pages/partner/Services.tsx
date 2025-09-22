import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

/* ---------------- Types ---------------- */

type Workshop = { id: number; name: string };
type Lang = "en" | "de" | "ar";

type Translations = Partial<Record<Lang, string>>;
type FAQ = { q: string; a: string };
type PolicyObj = { cancellation?: string; warranty_days?: number | null };

type Service = {
  id: number;
  workshop_id: number;
  title: string;
  price: string; // API returns string
  workshop: Workshop;
  title_translations?: Translations | null;

  // info fields (nullable from API)
  summary?: string | null;
  duration_min?: number | null;
  included?: string[] | null;
  excluded?: string[] | null;
  preparation?: string[] | null;
  policy?: PolicyObj | null;
  faqs?: FAQ[] | null;
  notes?: string | null;
};

type CreateServicePayload = {
  workshop_id: number;
  title: string;
  price: number;
  title_translations?: Translations;

  summary?: string;
  duration_min?: number;
  included?: string[];
  excluded?: string[];
  preparation?: string[];
  policy?: PolicyObj;
  faqs?: FAQ[];
  notes?: string;
};

type UpdateServicePayload = {
  title?: string;
  price?: number;
  title_translations?: Translations | null;

  summary?: string | null;
  duration_min?: number | null;
  included?: string[] | null;
  excluded?: string[] | null;
  preparation?: string[] | null;
  policy?: PolicyObj | null;
  faqs?: FAQ[] | null;
  notes?: string | null;
};

/* ---------------- Helpers ---------------- */

function normLang(code?: string): Lang {
  if (!code) return "en";
  if (code.startsWith("ar")) return "ar";
  if (code.startsWith("de")) return "de";
  return "en";
}

const splitLines = (s: string): string[] =>
  s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

/* ---------------- Component ---------------- */

export default function PartnerServices() {
  const { i18n } = useTranslation("common");
  const currentLang = normLang(i18n.language);

  // lists
  const [items, setItems] = useState<Service[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // create form (basic)
  const [newWorkshopId, setNewWorkshopId] = useState<number | "">("");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // create: translations
  const [showTranslations, setShowTranslations] = useState(false);
  const [tEn, setTEn] = useState("");
  const [tDe, setTDe] = useState("");
  const [tAr, setTAr] = useState("");

  // create: details
  const [showDetails, setShowDetails] = useState(false);
  const [cSummary, setCSummary] = useState("");
  const [cDuration, setCDuration] = useState<string>("");
  const [cIncluded, setCIncluded] = useState("");
  const [cExcluded, setCExcluded] = useState("");
  const [cPreparation, setCPreparation] = useState("");
  const [cPolicyCancel, setCPolicyCancel] = useState("");
  const [cPolicyWarranty, setCPolicyWarranty] = useState<string>("");
  const [cNotes, setCNotes] = useState("");
  const [cFaqs, setCFaqs] = useState<FAQ[]>([{ q: "", a: "" }]);

  // edit state (basic)
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // edit: translations
  const [eShowTranslations, setEShowTranslations] = useState(false);
  const [eEn, setEEn] = useState("");
  const [eDe, setEDe] = useState("");
  const [eAr, setEAr] = useState("");

  // edit: details
  const [eShowDetails, setEShowDetails] = useState(false);
  const [eSummary, setESummary] = useState("");
  const [eDuration, setEDuration] = useState<string>("");
  const [eIncluded, setEIncluded] = useState("");
  const [eExcluded, setEExcluded] = useState("");
  const [ePreparation, setEPreparation] = useState("");
  const [ePolicyCancel, setEPolicyCancel] = useState("");
  const [ePolicyWarranty, setEPolicyWarranty] = useState<string>("");
  const [eNotes, setENotes] = useState("");
  const [eFaqs, setEFaqs] = useState<FAQ[]>([]);

  /* ------------- Load ------------- */
  async function load() {
    setLoading(true);
    setErr(null);
    try {
      // load workshops (owned by partner) + existing services
      const [svcRes, wsRes] = await Promise.all([
        api.get<Service[]>("/partner/services"),
        api.get<Workshop[]>("/partner/workshops"),
      ]);

      setItems(svcRes.data);
      setWorkshops(wsRes.data);

      if (newWorkshopId === "" && wsRes.data.length > 0) {
        setNewWorkshopId(wsRes.data[0].id);
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

  /* ------------- Create ------------- */
  function buildCreatePayload(): CreateServicePayload {
    const payload: CreateServicePayload = {
      workshop_id: Number(newWorkshopId),
      title: newTitle.trim(),
      price: Number(newPrice || 0),
    };

    if (showTranslations) {
      const tr: Translations = {};
      if (tEn.trim()) tr.en = tEn.trim();
      if (tDe.trim()) tr.de = tDe.trim();
      if (tAr.trim()) tr.ar = tAr.trim();
      if (Object.keys(tr).length > 0) payload.title_translations = tr;
    }

    if (showDetails) {
      if (cSummary.trim()) payload.summary = cSummary.trim();
      if (cDuration) payload.duration_min = Number(cDuration);

      const inc = splitLines(cIncluded);
      const exc = splitLines(cExcluded);
      const prep = splitLines(cPreparation);
      if (inc.length) payload.included = inc;
      if (exc.length) payload.excluded = exc;
      if (prep.length) payload.preparation = prep;

      const policy: PolicyObj = {};
      if (cPolicyCancel.trim()) policy.cancellation = cPolicyCancel.trim();
      if (cPolicyWarranty) policy.warranty_days = Number(cPolicyWarranty);
      if (Object.keys(policy).length) payload.policy = policy;

      const faqs: FAQ[] = cFaqs
        .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
        .filter((f) => f.q || f.a);
      if (faqs.length) payload.faqs = faqs;

      if (cNotes.trim()) payload.notes = cNotes.trim();
    }

    return payload;
  }

  async function addService(e: FormEvent) {
    e.preventDefault();
    if (newWorkshopId === "") return;

    const payload = buildCreatePayload();

    try {
      const { data } = await api.post<Service>("/partner/services", payload);
      setItems((prev) => [data, ...prev]);

      // reset form
      setNewTitle("");
      setNewPrice("");
      setShowTranslations(false);
      setTEn(""); setTDe(""); setTAr("");

      setShowDetails(false);
      setCSummary(""); setCDuration("");
      setCIncluded(""); setCExcluded(""); setCPreparation("");
      setCPolicyCancel(""); setCPolicyWarranty("");
      setCNotes("");
      setCFaqs([{ q: "", a: "" }]);
    } catch {
      alert("Failed to create service");
    }
  }

  /* ------------- Edit ------------- */
  function displayLabel(s: Service): string {
    const tr = s.title_translations?.[currentLang];
    return tr && tr.trim().length > 0 ? tr : s.title;
  }

  function beginEdit(s: Service) {
    setEditId(s.id);
    setEditTitle(s.title);
    setEditPrice(s.price);

    const hasTr = !!s.title_translations;
    setEShowTranslations(hasTr);
    setEEn(s.title_translations?.en ?? "");
    setEDe(s.title_translations?.de ?? "");
    setEAr(s.title_translations?.ar ?? "");

    // prefill details
    setEShowDetails(
      !!(
        s.summary ||
        s.duration_min ||
        (s.included && s.included.length) ||
        (s.excluded && s.excluded.length) ||
        (s.preparation && s.preparation.length) ||
        s.policy ||
        (s.faqs && s.faqs.length) ||
        s.notes
      )
    );
    setESummary(s.summary ?? "");
    setEDuration(s.duration_min ? String(s.duration_min) : "");
    setEIncluded((s.included ?? []).join("\n"));
    setEExcluded((s.excluded ?? []).join("\n"));
    setEPreparation((s.preparation ?? []).join("\n"));
    setEPolicyCancel(s.policy?.cancellation ?? "");
    setEPolicyWarranty(
      s.policy?.warranty_days != null ? String(s.policy?.warranty_days) : ""
    );
    setENotes(s.notes ?? "");
    setEFaqs(s.faqs && s.faqs.length ? s.faqs : [{ q: "", a: "" }]);
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditPrice("");
    setEShowTranslations(false);
    setEEn(""); setEDe(""); setEAr("");

    setEShowDetails(false);
    setESummary(""); setEDuration("");
    setEIncluded(""); setEExcluded(""); setEPreparation("");
    setEPolicyCancel(""); setEPolicyWarranty("");
    setENotes("");
    setEFaqs([{ q: "", a: "" }]);
  }

  async function saveEdit(id: number) {
    const payload: UpdateServicePayload = {
      title: editTitle.trim(),
      price: Number(editPrice || 0),
    };

    if (eShowTranslations) {
      const tr: Translations = {};
      if (eEn.trim()) tr.en = eEn.trim();
      if (eDe.trim()) tr.de = eDe.trim();
      if (eAr.trim()) tr.ar = eAr.trim();
      payload.title_translations = tr;
    } else {
      payload.title_translations = null; // explicit clear
    }

    if (eShowDetails) {
      payload.summary = eSummary.trim() !== "" ? eSummary.trim() : null;
      payload.duration_min = eDuration ? Number(eDuration) : null;

      const inc = splitLines(eIncluded);
      const exc = splitLines(eExcluded);
      const prep = splitLines(ePreparation);
      payload.included = inc.length ? inc : [];
      payload.excluded = exc.length ? exc : [];
      payload.preparation = prep.length ? prep : [];

      const policy: PolicyObj = {};
      if (ePolicyCancel.trim()) policy.cancellation = ePolicyCancel.trim();
      if (ePolicyWarranty) policy.warranty_days = Number(ePolicyWarranty);
      payload.policy = Object.keys(policy).length ? policy : null;

      const faqs: FAQ[] = eFaqs
        .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
        .filter((f) => f.q || f.a);
      payload.faqs = faqs.length ? faqs : null;

      payload.notes = eNotes.trim() ? eNotes.trim() : null;
    } else {
      // clear all details
      payload.summary = null;
      payload.duration_min = null;
      payload.included = null;
      payload.excluded = null;
      payload.preparation = null;
      payload.policy = null;
      payload.faqs = null;
      payload.notes = null;
    }

    try {
      const { data } = await api.patch<Service>(`/partner/services/${id}`, payload);
      setItems((prev) => prev.map((s) => (s.id === id ? data : s)));
      cancelEdit();
    } catch {
      alert("Failed to save changes");
    }
  }

  /* ------------- Delete ------------- */
  async function remove(id: number) {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/partner/services/${id}`);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  /* ------------- UI ------------- */

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
            {workshops.length === 0 ? (
              <option value="">No workshops found</option>
            ) : (
              workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))
            )}
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

        {/* translations toggle */}
        <div className="mt-3 flex flex-col gap-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTranslations}
              onChange={(e) => setShowTranslations(e.target.checked)}
            />
            <span>Add title translations (optional)</span>
          </label>

          {showTranslations && (
            <div className="grid sm:grid-cols-3 gap-3">
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
        </div>

        {/* details toggle */}
        <div className="mt-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
            />
            <span>Add details (optional)</span>
          </label>
        </div>

        {showDetails && (
          <div className="mt-3 grid gap-3">
            <textarea
              className="border rounded px-3 py-2"
              placeholder="Summary / description"
              rows={2}
              value={cSummary}
              onChange={(e) => setCSummary(e.target.value)}
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className="border rounded px-3 py-2"
                type="number"
                min="1"
                max="600"
                placeholder="Duration (min)"
                value={cDuration}
                onChange={(e) => setCDuration(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Warranty days (optional)"
                type="number"
                min="0"
                value={cPolicyWarranty}
                onChange={(e) => setCPolicyWarranty(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Cancellation policy (optional)"
                value={cPolicyCancel}
                onChange={(e) => setCPolicyCancel(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <textarea
                className="border rounded px-3 py-2"
                placeholder={"Included (one per line)"}
                rows={4}
                value={cIncluded}
                onChange={(e) => setCIncluded(e.target.value)}
              />
              <textarea
                className="border rounded px-3 py-2"
                placeholder={"Not included (one per line)"}
                rows={4}
                value={cExcluded}
                onChange={(e) => setCExcluded(e.target.value)}
              />
              <textarea
                className="border rounded px-3 py-2"
                placeholder={"Preparation (one per line)"}
                rows={4}
                value={cPreparation}
                onChange={(e) => setCPreparation(e.target.value)}
              />
            </div>

            {/* FAQs */}
            <div className="border rounded-lg p-3">
              <div className="font-medium mb-2">FAQs</div>
              <div className="space-y-2">
                {cFaqs.map((f, idx) => (
                  <div key={idx} className="grid sm:grid-cols-2 gap-2">
                    <input
                      className="border rounded px-3 py-2"
                      placeholder={`Q${idx + 1}`}
                      value={f.q}
                      onChange={(e) =>
                        setCFaqs((arr) => {
                          const next = [...arr];
                          next[idx] = { ...next[idx], q: e.target.value };
                          return next;
                        })
                      }
                    />
                    <input
                      className="border rounded px-3 py-2"
                      placeholder={`A${idx + 1}`}
                      value={f.a}
                      onChange={(e) =>
                        setCFaqs((arr) => {
                          const next = [...arr];
                          next[idx] = { ...next[idx], a: e.target.value };
                          return next;
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setCFaqs((arr) => [...arr, { q: "", a: "" }])}
                >
                  + Add FAQ
                </button>
                {cFaqs.length > 1 && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setCFaqs((arr) => arr.slice(0, -1))}
                  >
                    − Remove last
                  </button>
                )}
              </div>
            </div>

            <textarea
              className="border rounded px-3 py-2"
              placeholder="Notes (optional)"
              rows={2}
              value={cNotes}
              onChange={(e) => setCNotes(e.target.value)}
            />
          </div>
        )}

        <button
          className="btn-primary mt-4"
          disabled={workshops.length === 0 || newWorkshopId === ""}
        >
          Add Service
        </button>
      </form>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 mb-2">{err}</div>}

      <div className="divide-y border rounded-lg">
        {items.map((s) => (
          <div
            key={s.id}
            className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6"
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

            {/* edit translations + details */}
            {editId === s.id && (
              <div className="flex-1 space-y-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={eShowTranslations}
                    onChange={(e) => setEShowTranslations(e.target.checked)}
                  />
                  <span>Title translations</span>
                </label>

                {eShowTranslations && (
                  <div className="grid sm:grid-cols-3 gap-3">
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

                <label className="inline-flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={eShowDetails}
                    onChange={(e) => setEShowDetails(e.target.checked)}
                  />
                  <span>Service details</span>
                </label>

                {eShowDetails && (
                  <div className="grid gap-3">
                    <textarea
                      className="border rounded px-3 py-2"
                      placeholder="Summary / description"
                      rows={2}
                      value={eSummary}
                      onChange={(e) => setESummary(e.target.value)}
                    />
                    <div className="grid sm:grid-cols-3 gap-3">
                      <input
                        className="border rounded px-3 py-2"
                        type="number"
                        min="1"
                        max="600"
                        placeholder="Duration (min)"
                        value={eDuration}
                        onChange={(e) => setEDuration(e.target.value)}
                      />
                      <input
                        className="border rounded px-3 py-2"
                        placeholder="Warranty days (optional)"
                        type="number"
                        min="0"
                        value={ePolicyWarranty}
                        onChange={(e) => setEPolicyWarranty(e.target.value)}
                      />
                      <input
                        className="border rounded px-3 py-2"
                        placeholder="Cancellation policy (optional)"
                        value={ePolicyCancel}
                        onChange={(e) => setEPolicyCancel(e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <textarea
                        className="border rounded px-3 py-2"
                        placeholder={"Included (one per line)"}
                        rows={4}
                        value={eIncluded}
                        onChange={(e) => setEIncluded(e.target.value)}
                      />
                      <textarea
                        className="border rounded px-3 py-2"
                        placeholder={"Not included (one per line)"}
                        rows={4}
                        value={eExcluded}
                        onChange={(e) => setEExcluded(e.target.value)}
                      />
                      <textarea
                        className="border rounded px-3 py-2"
                        placeholder={"Preparation (one per line)"}
                        rows={4}
                        value={ePreparation}
                        onChange={(e) => setEPreparation(e.target.value)}
                      />
                    </div>

                    {/* FAQs */}
                    <div className="border rounded-lg p-3">
                      <div className="font-medium mb-2">FAQs</div>
                      <div className="space-y-2">
                        {eFaqs.map((f, idx) => (
                          <div key={idx} className="grid sm:grid-cols-2 gap-2">
                            <input
                              className="border rounded px-3 py-2"
                              placeholder={`Q${idx + 1}`}
                              value={f.q}
                              onChange={(e) =>
                                setEFaqs((arr) => {
                                  const next = [...arr];
                                  next[idx] = { ...next[idx], q: e.target.value };
                                  return next;
                                })
                              }
                            />
                            <input
                              className="border rounded px-3 py-2"
                              placeholder={`A${idx + 1}`}
                              value={f.a}
                              onChange={(e) =>
                                setEFaqs((arr) => {
                                  const next = [...arr];
                                  next[idx] = { ...next[idx], a: e.target.value };
                                  return next;
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => setEFaqs((arr) => [...arr, { q: "", a: "" }])}
                        >
                          + Add FAQ
                        </button>
                        {eFaqs.length > 1 && (
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => setEFaqs((arr) => arr.slice(0, -1))}
                          >
                            − Remove last
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      className="border rounded px-3 py-2"
                      placeholder="Notes (optional)"
                      rows={2}
                      value={eNotes}
                      onChange={(e) => setENotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="sm:ml-auto flex items-center gap-2">
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
