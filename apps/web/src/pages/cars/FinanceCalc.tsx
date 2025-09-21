import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function monthlyPayment(price: number, down: number, aprPct: number, months: number): number {
  const principal = Math.max(0, price - down);
  const r = aprPct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  const num = principal * r * Math.pow(1 + r, months);
  const den = Math.pow(1 + r, months) - 1;
  return num / den;
}

export default function FinanceCalc({ price }: { price: number }) {
  const { t } = useTranslation("common");
  const [down, setDown] = useState(0);
  const [apr, setApr] = useState(6.5);
  const [term, setTerm] = useState(60);

  const perMonth = useMemo(() => monthlyPayment(price, down, apr, term), [price, down, apr, term]);

  return (
    <div className="border rounded-lg p-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">{t("cars.finance.down")}</label>
          <input type="number" className="w-full border rounded px-3 py-2" min={0} max={price}
                 value={down} onChange={(e)=>setDown(Number(e.target.value))}/>
        </div>
        <div>
          <label className="block text-sm mb-1">{t("cars.finance.apr")}</label>
          <input type="number" className="w-full border rounded px-3 py-2" min={0} step="0.1"
                 value={apr} onChange={(e)=>setApr(Number(e.target.value))}/>
        </div>
        <div>
          <label className="block text-sm mb-1">{t("cars.finance.term")}</label>
          <select className="w-full border rounded px-3 py-2" value={term} onChange={(e)=>setTerm(Number(e.target.value))}>
            {[24,36,48,60,72].map(m => <option key={m} value={m}>{m} {t("cars.finance.months")}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 text-lg">
        {t("cars.finance.result")}: <span className="font-semibold">€{perMonth.toFixed(2)}</span> / {t("cars.finance.mo")}
      </div>
      <div className="opacity-70 text-sm mt-1">{t("cars.finance.disclaimer")}</div>
    </div>
  );
}
