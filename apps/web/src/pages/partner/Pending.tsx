import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PartnerPending() {
  const { t } = useTranslation("common");
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">
        {t("partner.pending.title", { defaultValue: "Your partner account is under review" })}
      </h1>
      <p className="opacity-80 mb-6">
        {t("partner.pending.desc", { defaultValue: "We’ll notify you once an admin approves your account." })}
      </p>
    <Link to="/" className="btn-outline">
    {t("btn.backHome", { defaultValue: "Back to Home" })}
  </Link>
    </div>
  );
}
