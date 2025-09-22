// apps/web/src/components/service/ServiceInfoCard.tsx
import type { ServiceInfo } from "../../types";
import { useTranslation } from "react-i18next";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 mb-4">
      <h4 className="font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

function BulletList({ items }: { items?: (string | null)[] | null }) {
  if (!items || items.length === 0) return null;
  const filtered = items.filter(Boolean) as string[];
  if (!filtered.length) return null;
  return (
    <ul className="list-disc pl-5 space-y-1">
      {filtered.map((s, i) => <li key={i}>{s}</li>)}
    </ul>
  );
}

export default function ServiceInfoCard({ s }: { s: ServiceInfo }) {
  const { t } = useTranslation("common");
  const has =
    !!s.summary || !!s.duration_min || s?.included?.length || s?.excluded?.length ||
    s?.preparation?.length || s?.faqs?.length || s?.policy || s?.notes;

  if (!has) return null;

  return (
    <div className="mt-6 max-w-2xl">
      {s.summary && (
        <Section title={t("service.about", { defaultValue: "About this service" })}>
          <p>{s.summary}</p>
        </Section>
      )}

      {(s.included?.length || s.excluded?.length) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Section title={t("service.included", { defaultValue: "What’s included" })}>
            <BulletList items={s.included} />
          </Section>
          <Section title={t("service.excluded", { defaultValue: "What’s not included" })}>
            <BulletList items={s.excluded} />
          </Section>
        </div>
      )}

      {(s.duration_min || s.preparation?.length) && (
        <Section title={t("service.prep_duration", { defaultValue: "Preparation & duration" })}>
          {s.duration_min ? (
            <p className="mb-2">
              {t("service.duration_est", { defaultValue: "Estimated duration: ~{{min}} min", min: s.duration_min })}
            </p>
          ) : null}
          <BulletList items={s.preparation} />
        </Section>
      )}

      {(s.policy?.cancellation || s.policy?.warranty_days) && (
        <Section title={t("service.policies", { defaultValue: "Policies" })}>
          {s.policy?.cancellation ? (
            <p className="mb-2">
              <strong>{t("service.cancellation", { defaultValue: "Cancellation" })}:</strong> {s.policy.cancellation}
            </p>
          ) : null}
          {s.policy?.warranty_days ? (
            <p>
              <strong>{t("service.warranty", { defaultValue: "Warranty" })}:</strong> {s.policy.warranty_days}{" "}
              {t("common.days", { defaultValue: "days" })}
            </p>
          ) : null}
        </Section>
      )}

      {s.faqs?.length ? (
        <Section title={t("service.faqs", { defaultValue: "FAQs" })}>
          <div className="space-y-3">
            {s.faqs.map((f, i) => (
              <div key={i}>
                <p className="font-medium">Q: {f.q}</p>
                <p className="text-gray-700">A: {f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {s.notes && (
        <Section title={t("service.notes", { defaultValue: "Notes" })}>
          <p>{s.notes}</p>
        </Section>
      )}
    </div>
  );
}
