import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Region = "europe" | "china" | "usa";
type Estimate = { base:number; shipping:number; customs:number; handling:number; vat:number; total:number };

export default function ImportOrderForm() {
  const { t } = useTranslation("common");
  const [sp] = useSearchParams();
  const nav = useNavigate();

  const [region, setRegion] = useState<Region>((sp.get("region") as Region) || "europe");
  const [make, setMake]     = useState(sp.get("make")  ?? "");
  const [model, setModel]   = useState(sp.get("model") ?? "");
  const [year, setYear]     = useState<string>("");
  const [vin, setVin]       = useState("");
  const [dest, setDest]     = useState("DE");
  const [notes, setNotes]   = useState("");
  const [price, setPrice]   = useState<number>(Number(sp.get("price") ?? 0) || 0);

  const [est, setEst]       = useState<Estimate | null>(null);
  const [posting, setPosting]= useState(false);
  const [loadingEst, setLoadingEst]= useState(false);

  async function calc() {
    if (!price || price <= 0) { setEst(null); return; }
    setLoadingEst(true);
    const { data } = await api.post<Estimate & { region:string; total:number }>("/import/calc", {
      region, purchasePrice: price, destinationCountry: dest
    });
    setEst({
      base: data.base,
      shipping: data.shipping,
      customs: data.customs,
      handling: data.handling,
      vat: data.vat,
      total: data.total,
    });
    setLoadingEst(false);
  }

  useEffect(() => { void calc(); /* eslint-disable-next-line */ }, [region, price, dest]);

  async function submit() {
    if (!est) return;
    setPosting(true);
    try {
      const payload = {
        region, make, model,
        year: year ? Number(year) : undefined,
        vin: vin || undefined,
        destinationCountry: dest,
        notes: notes || undefined,
        purchasePrice: price,
        estimate: est,
      };
      await api.post("/import/orders", payload);
      alert(t("import.success", { defaultValue: "Import request submitted." }));
      nav("/my-imports");
    } catch {
      alert(t("import.fail", { defaultValue: "Failed to submit request." }));
    } finally {
      setPosting(false);
    }
  }

  const currency = (n:number) => `€${n.toFixed(2)}`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("import.new", { defaultValue: "New Import Request" })}</h1>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          {t("import.region", { defaultValue: "Region" })}
          <select className="mt-1 border rounded px-2 py-2 w-full" value={region} onChange={(e)=>setRegion(e.target.value as Region)}>
            <option value="europe">Europe</option>
            <option value="china">China</option>
            <option value="usa">USA</option>
          </select>
        </label>

        <label className="text-sm">
          {t("import.dest", { defaultValue: "Destination" })}
          <input className="mt-1 border rounded px-2 py-2 w-full" value={dest} onChange={(e)=>setDest(e.target.value.toUpperCase())} />
        </label>

        <label className="text-sm">
          {t("import.make", { defaultValue: "Make" })}
          <input className="mt-1 border rounded px-2 py-2 w-full" value={make} onChange={(e)=>setMake(e.target.value)} />
        </label>

        <label className="text-sm">
          {t("import.model", { defaultValue: "Model" })}
          <input className="mt-1 border rounded px-2 py-2 w-full" value={model} onChange={(e)=>setModel(e.target.value)} />
        </label>

        <label className="text-sm">
          {t("import.year", { defaultValue: "Year" })}
          <input className="mt-1 border rounded px-2 py-2 w-full" type="number" min={1980} max={2100} value={year} onChange={(e)=>setYear(e.target.value)} />
        </label>

        <label className="text-sm">
          VIN ({t("optional", { defaultValue: "optional" })})
          <input className="mt-1 border rounded px-2 py-2 w-full" value={vin} onChange={(e)=>setVin(e.target.value)} />
        </label>

        <label className="text-sm sm:col-span-2">
          {t("import.purchase", { defaultValue: "Purchase price (€)" })}
          <input className="mt-1 border rounded px-2 py-2 w-full" type="number" min={0} value={price} onChange={(e)=>setPrice(Number(e.target.value || 0))} />
        </label>

        <label className="text-sm sm:col-span-2">
          {t("notes", { defaultValue: "Notes" })}
          <textarea className="mt-1 border rounded px-2 py-2 w-full" rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
        </label>
      </div>

      <div className="border rounded p-4 mt-4">
        <div className="font-semibold mb-2">{t("import.est", { defaultValue: "Estimated cost" })}</div>
        {loadingEst && <div>{t("loading", { defaultValue: "Loading…" })}</div>}
        {est && (
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div>Base: {currency(est.base)}</div>
            <div>Shipping: {currency(est.shipping)}</div>
            <div>Customs: {currency(est.customs)}</div>
            <div>Handling: {currency(est.handling)}</div>
            <div>VAT: {currency(est.vat)}</div>
            <div className="font-semibold">Total: {currency(est.total)}</div>
          </div>
        )}
        {!loadingEst && !est && <div className="opacity-70">{t("import.enterPrice", { defaultValue: "Enter a purchase price to estimate." })}</div>}
      </div>

      <button className="btn-primary mt-4" disabled={!est || posting || !make || !model} onClick={submit}>
        {t("import.submit", { defaultValue: "Submit request" })}
      </button>
    </div>
  );
}
