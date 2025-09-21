// apps/web/src/pages/partner/Reports.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

/** Types that match the API */
type MonthRow = { month: string; total: number };
type TopRow = { title: string; cnt: number };

function BarChart({
  rows,
  title,
  formatMoney,
}: {
  rows: MonthRow[];
  title: string;
  formatMoney: (n: number) => string;
}) {
  const max = rows.length ? Math.max(...rows.map((r) => r.total)) : 0;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="font-semibold mb-2">{title}</div>
      {!rows.length ? (
        <div className="opacity-70 text-sm">—</div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const pct = max > 0 ? (r.total / max) * 100 : 0;
            return (
              <div key={r.month} className="flex items-center gap-3">
                <div className="w-20 text-xs tabular-nums opacity-70">{r.month}</div>
                <div className="flex-1 h-3 bg-gray-100 rounded">
                  <div className="h-3 rounded bg-[#0052CC]" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-28 text-right text-sm">{formatMoney(r.total)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  const { t, i18n } = useTranslation("common");

  const [months, setMonths] = useState<MonthRow[]>([]);
  const [top, setTop] = useState<TopRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const formatMoney = useMemo(() => {
    // EUR by default; adjust if your backend returns a currency
    const nf = new Intl.NumberFormat(i18n.language || "en", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    });
    return (n: number) => nf.format(n);
  }, [i18n.language]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const m = await api.get<MonthRow[]>("/partner/revenue-monthly");
        setMonths(Array.isArray(m.data) ? m.data.slice(-6) : []);

        const tsv = await api.get<TopRow[]>("/partner/top-services");
        setTop(Array.isArray(tsv.data) ? tsv.data : []);
      } catch {
        setErr(t("partner.reports.error"));
        setMonths([]);
        setTop([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("partner.reports.title")}</h1>
      {err && <div className="text-red-600 mb-3 text-sm">{err}</div>}

      <BarChart
        rows={months}
        title={t("partner.reports.monthlyRevenue")}
        formatMoney={formatMoney}
      />

      <div className="border rounded-lg p-4 mt-6 bg-white shadow-sm">
        <div className="font-semibold mb-2">{t("partner.reports.topServices")}</div>
        {loading && <div>{t("loading")}</div>}
        {!loading && top.length === 0 && (
          <div className="opacity-70 text-sm">—</div>
        )}
        <div className="divide-y">
          {top.map((r) => (
            <div key={r.title} className="py-2 flex items-center justify-between">
              <div>{r.title}</div>
              <div className="text-sm opacity-70">
                {r.cnt} {t("partner.reports.bookings")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
