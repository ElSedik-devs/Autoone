// apps/web/src/pages/admin/Partners.tsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

type Partner = {
  id: number;
  name: string;
  email: string;
  company_name?: string | null;
  business_type?: string | null;
  phone?: string | null;
  partner_status: "pending" | "approved" | "rejected" | string;
};

export default function AdminPartners() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<Partner[]>("/admin/partners/pending");
      setItems(data);
    } catch {
      setErr(t("admin.partners.errorLoad", { defaultValue: "Failed to load pending partners" }));
    } finally {
      setLoading(false);
    }
  }

  async function act(id: number, action: "approve" | "reject") {
    try {
      setActingId(id);
      await api.patch(`/admin/partners/${id}/${action}`);
      // Optimistic: remove the row (it’s no longer pending)
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert(t("admin.partners.errorAction", { defaultValue: "Action failed" }));
    } finally {
      setActingId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {t("admin.partners.title", { defaultValue: "Pending Partners" })}
      </h1>

      {err && <div className="text-red-600 mb-3 text-sm">{err}</div>}

      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2">{t("admin.partners.name", { defaultValue: "Name" })}</th>
              <th className="px-4 py-2">{t("admin.partners.email", { defaultValue: "Email" })}</th>
              <th className="px-4 py-2">{t("admin.partners.company", { defaultValue: "Company" })}</th>
              <th className="px-4 py-2">{t("admin.partners.type", { defaultValue: "Type" })}</th>
              <th className="px-4 py-2">{t("admin.partners.phone", { defaultValue: "Phone" })}</th>
              <th className="px-4 py-2">{t("admin.partners.status", { defaultValue: "Status" })}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {/* Loading skeleton */}
            {loading && (
              <tr>
                <td className="px-4 py-3 opacity-70" colSpan={7}>
                  {t("loading", { defaultValue: "Loading…" })}
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading &&
              items.map((p) => {
                const busy = actingId === p.id;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.email}</td>
                    <td className="px-4 py-2">{p.company_name || "—"}</td>
                    <td className="px-4 py-2">{p.business_type || "—"}</td>
                    <td className="px-4 py-2">{p.phone || "—"}</td>
                    <td className="px-4 py-2">{p.partner_status}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="btn-primary disabled:opacity-60"
                        onClick={() => act(p.id, "approve")}
                        disabled={busy}
                      >
                        {busy ? t("admin.partners.working", { defaultValue: "Working…" }) : t("admin.partners.approve", { defaultValue: "Approve" })}
                      </button>
                      <button
                        className="btn-outline disabled:opacity-60"
                        onClick={() => act(p.id, "reject")}
                        disabled={busy}
                      >
                        {busy ? t("admin.partners.working", { defaultValue: "Working…" }) : t("admin.partners.reject", { defaultValue: "Reject" })}
                      </button>
                    </td>
                  </tr>
                );
              })}

            {/* Empty state */}
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-4 py-3 opacity-70" colSpan={7}>
                  {t("admin.partners.empty", { defaultValue: "No pending partners." })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
