// apps/web/src/pages/user/Home.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Tile({
  to,
  icon,
  title,
  desc
}: {
  to: string;
  icon: string;
  title: string;
  desc?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm
                 hover:shadow transition-shadow focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-lg text-2xl bg-[#FFCC00]/20"
        aria-hidden
      >
        {icon}
      </span>
      <div className="flex-1">
        <div className="font-semibold text-neutral-900 group-hover:text-[#0052CC]">
          {title}
        </div>
        {desc ? <div className="text-sm opacity-70">{desc}</div> : null}
      </div>
      <span className="hidden text-neutral-400 group-hover:text-[#0052CC] sm:inline" aria-hidden>
        →
      </span>
    </Link>
  );
}

function Chip({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm
                 bg-white hover:bg-gray-50 border-[#0052CC] text-[#0052CC]
                 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
    >
      {children}
    </Link>
  );
}

export default function UserHome() {
  const { t } = useTranslation("common");

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Hero */}
      <header className="mb-6 text-center sm:text-left">
        <h1 className="text-3xl font-semibold mb-1">
          {t("home.title")}
        </h1>
        <p className="text-neutral-600">
          {t("home.subtitle")}
        </p>
      </header>

      {/* Search */}
      <div className="mb-6 flex items-center gap-3">
        <button className="btn-primary order-2 sm:order-1">
          {t("btn.search")}
        </button>
        <input
          className="order-1 sm:order-2 flex-1 rounded-md border px-4 py-2.5 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
          placeholder={t("home.search.placeholder")}
          aria-label={t("home.search.aria", { defaultValue: t("btn.search") })}
        />
      </div>

      {/* Categories */}
      <section aria-labelledby="cats" className="mb-8">
        <h2 id="cats" className="sr-only">{t("home.categories", { defaultValue: "Service categories" })}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Tile
            to="/workshops"
            icon="🛠️"
            title={t("cats.workshops")}
            desc={t("home.workshops.desc", { defaultValue: "Oil change, tires, repairs…" })}
          />
          <Tile
            to="/car-wash"
            icon="🧽"
            title={t("cats.wash")}
            desc={t("home.carwash.desc", { defaultValue: "Exterior, interior, polishing" })}
          />
          <Tile
            to="/cars"
            icon="🚗"
            title={t("cats.buy")}
            desc={t("home.buy.desc", { defaultValue: "New & used, filters & finance" })}
          />
          <Tile
            to="/rental"
            icon="🛞"
            title={t("cats.rental")}
            desc={t("home.rental.desc", { defaultValue: "Search by date & location" })}
          />
          <Tile
            to="/import"
            icon="🚚"
            title={t("cats.import")}
            desc={t("home.import.desc", { defaultValue: "Estimate total cost & order" })}
          />
          <Tile
            to="/parts"
            icon="🧩"
            title={t("cats.parts")}
            desc={t("home.parts.desc", { defaultValue: "Browse parts & checkout" })}
          />
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {t("home.quick.title", { defaultValue: "Quick Links" })}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Chip to="/bookings">📅 {t("home.quick.bookings")}</Chip>
          <Chip to="/car-wash">🧽 {t("home.quick.carwash", { defaultValue: t("cats.wash") })}</Chip>
          <Chip to="/my-rentals">🧾 {t("home.quick.rentals", { defaultValue: "My Rentals" })}</Chip>
          <Chip to="/my-imports">📦 {t("home.quick.imports", { defaultValue: "My Imports" })}</Chip>
          <Chip to="/my-part-orders">🗂️ {t("home.quick.parts", { defaultValue: "My Parts Orders" })}</Chip>
        </div>
      </section>
    </div>
  );
}
