import { useTranslation } from "react-i18next";

type Status = "pending" | "confirmed" | "rejected";

export default function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation("common");
  const color =
    status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "confirmed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <span className={`inline-block text-xs px-2 py-1 rounded ${color}`}>
      {t(`status.${status}`)}
    </span>
  );
}
