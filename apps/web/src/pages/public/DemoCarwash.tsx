import { Link } from "react-router-dom";
import { DEMO_WORKSHOPS } from "../../demo/demoData";

export default function DemoCarwash() {
  const items = DEMO_WORKSHOPS.filter(w => w.type === "carwash");
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Car Wash</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(w => (
          <Link key={w.id} to={`/demo/workshops/${w.id}`} className="border rounded-lg p-4 hover:shadow">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold">{w.name}</h2>
              <span className="text-sm">⭐ {w.rating.toFixed(1)}</span>
            </div>
            <div className="text-sm opacity-80">
              {w.price_min != null && w.price_max != null ? `€${w.price_min}–${w.price_max}` : "—"}
            </div>
            <div className="text-sm opacity-80">Services: {w.services.length}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
