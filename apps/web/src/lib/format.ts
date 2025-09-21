import i18n from "../i18n";

export function fmtMoney(
  value: string | number,
  currency: string = "EUR"
): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat(i18n.language || "en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDateTime(iso: string): string {
  // rely on current language; use user’s local timezone
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(i18n.language || "en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
