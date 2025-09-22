// apps/web/src/pages/public/DemoWorkshopDetail.tsx
import { Link, useParams } from "react-router-dom";
import { DEMO_WORKSHOPS, type DemoService } from "../../demo/demoData";
import ServiceInfoCard from "../../components/service/ServiceInfoCard";
import type { ServiceInfo } from "../../types";

function toServiceInfo(wid: number, s: DemoService): ServiceInfo {
  return {
    id: s.id,
    workshop_id: wid,
    title: s.title,
    title_i18n: s.title_i18n,
    // ServiceInfo expects string (API style); demo has number -> stringify
    price: s.price.toFixed(2),

    // optional info fields (keep undefined/null as provided)
    summary: s.summary,
    duration_min: s.duration_min ?? undefined,
    included: s.included,
    excluded: s.excluded,
    preparation: s.preparation,
    policy: s.policy,
    faqs: s.faqs,
    notes: s.notes,
  };
}

export default function DemoWorkshopDetail() {
  const { id } = useParams<{ id: string }>();
  const w = DEMO_WORKSHOPS.find((x) => String(x.id) === String(id));
  if (!w) return <div className="p-6">Not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link
          className="btn-outline"
          to={w.type === "carwash" ? "/demo/carwash" : "/demo/workshops"}
        >
          Back to list
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">{w.name}</h1>
      <div className="opacity-80 mt-1">
        ⭐ {w.rating.toFixed(1)} ·{" "}
        {w.price_min != null && w.price_max != null ? `€${w.price_min}–${w.price_max}` : "—"}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-3">Services</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {w.services.map((s) => (
          <div key={s.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{s.title}</div>
              <div className="opacity-80">€{s.price.toFixed(2)}</div>
            </div>
            <ServiceInfoCard s={toServiceInfo(w.id, s)} />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link className="btn-primary" to="/login">
          Book this service (Login)
        </Link>
      </div>
    </div>
  );
}
