import { Link } from "react-router-dom";
import { DEMO_WORKSHOPS } from "../../demo/demoData";

export default function PublicHome() {
  const top = DEMO_WORKSHOPS.slice(0, 3);
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold">Welcome to AutoOne</h1>
        <p className="opacity-80 mt-2">Find workshops, car wash, rentals, imports and parts.</p>
        <div className="mt-4 flex gap-2 justify-center">
          <Link to="/login" className="btn-primary">Log in</Link>
          <Link to="/signup" className="btn-outline">Create account</Link>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Popular providers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {top.map(w => (
            <Link key={w.id} to={`/demo/workshops/${w.id}`} className="border rounded-lg p-4 hover:shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{w.name}</h3>
                <span className="text-sm">⭐ {w.rating.toFixed(1)}</span>
              </div>
              <div className="text-sm opacity-80">
                {w.price_min != null && w.price_max != null ? `€${w.price_min}–${w.price_max}` : "—"}
              </div>
              <div className="text-sm opacity-80 mt-1">{w.type === "carwash" ? "Car Wash" : "Workshop"}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/demo/workshops" className="border rounded-lg p-5 hover:shadow">
          <div className="font-semibold mb-1">Workshops & Maintenance</div>
          <div className="opacity-80 text-sm">Oil change, tires, repairs…</div>
        </Link>
        <Link to="/demo/carwash" className="border rounded-lg p-5 hover:shadow">
          <div className="font-semibold mb-1">Car Wash</div>
          <div className="opacity-80 text-sm">Exterior, interior, polishing</div>
        </Link>
        <div className="border rounded-lg p-5 opacity-60">
          <div className="font-semibold mb-1">Rentals</div>
          <div className="text-sm">Coming soon</div>
        </div>
        <div className="border rounded-lg p-5 opacity-60">
          <div className="font-semibold mb-1">Parts</div>
          <div className="text-sm">Coming soon</div>
        </div>
      </section>
    </div>
  );
}
