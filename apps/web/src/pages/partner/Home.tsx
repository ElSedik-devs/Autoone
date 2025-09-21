// apps/web/src/pages/partner/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type KPIs = { bookingCount:number; revenue:number; avgRating:number|null };

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: "blue" | "yellow" }) {
  const ring =
    accent === "blue" ? "ring-2 ring-[#0052CC]" :
    accent === "yellow" ? "ring-2 ring-[#FFCC00]" : "";
  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm ${ring}`}>
      <div className="opacity-70 text-sm">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function ActionCard({ to, icon, title, desc }: { to: string; icon: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm hover:shadow transition"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFCC00]/25 text-xl" aria-hidden>{icon}</span>
      <div>
        <div className="font-semibold group-hover:text-[#0052CC]">{title}</div>
        <div className="text-sm opacity-70">{desc}</div>
      </div>
      <span className="ml-auto hidden sm:inline opacity-50 group-hover:opacity-100" aria-hidden>→</span>
    </Link>
  );
}

export default function PartnerHome() {
  const { t } = useTranslation("common");
  const [data,setData] = useState<KPIs|null>(null);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const { data } = await api.get<KPIs>("/partner/kpis"); setData(data); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("partner.home.title")}</h1>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label={t("partner.home.kpis.avgRating")}
          value={loading ? "…" : (data?.avgRating ?? 0)}
          accent="blue"
        />
        <KpiCard
          label={t("partner.home.kpis.revenue")}
          value={loading ? "…" : `€${(data?.revenue ?? 0).toFixed(2)}`}
          accent="yellow"
        />
        <KpiCard
          label={t("partner.home.kpis.bookings")}
          value={loading ? "…" : (data?.bookingCount ?? 0)}
          accent="blue"
        />
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          to="/partner/reports"
          icon="📈"
          title={t("partner.home.cards.reports.title")}
          desc={t("partner.home.cards.reports.desc")}
        />
        <ActionCard
          to="/partner/services"
          icon="🛠️"
          title={t("partner.home.cards.services.title")}
          desc={t("partner.home.cards.services.desc")}
        />
        <ActionCard
          to="/partner/bookings"
          icon="📅"
          title={t("partner.home.cards.bookings.title")}
          desc={t("partner.home.cards.bookings.desc")}
        />
        <ActionCard
          to="/partner/parts/orders"
          icon="📦"
          title={t("partner.home.cards.orders.title")}
          desc={t("partner.home.cards.orders.desc")}
        />
        <ActionCard
          to="/partner/parts"
          icon="⚙️"
          title={t("partner.home.cards.parts.title")}
          desc={t("partner.home.cards.parts.desc")}
        />
        <div className="rounded-xl border p-4 bg-gray-50 text-center text-sm text-gray-500">
          ⏳ {t("partner.home.cards.comingSoon")}
        </div>
      </div>
    </div>
  );
}
