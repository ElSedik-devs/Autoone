import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

type Workshop = {
  id: number;
  name: string;
  rating: number;
  price_min: string | null;
  price_max: string | null;
  services_count: number;
  lat?: number | string | null;  
  lng?: number | string | null;   
};


export default function WorkshopsList() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  // view mode
  const [mode, setMode] = useState<"list" | "map">("list");

async function load(extra?: Record<string, unknown>) {
  setLoading(true);
  setErr(null);
  try {
    const { data } = await api.get<Workshop[]>("/workshops", {
      params: { type: "workshop", ...(extra || {}) },
    });
    setItems(data);
  } catch {
    setErr(t("error.load.workshops", { defaultValue: "Failed to load workshops" }));
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { load(); }, []);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    load({
      q: search || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
    });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t("workshops.title")}</h1>
        <div className="inline-flex rounded-md overflow-hidden border">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm ${mode === "list" ? "bg-primary text-white" : "bg-white"}`}
            onClick={() => setMode("list")}
          >
            {t("workshops.view.list", { defaultValue: "List" })}
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm ${mode === "map" ? "bg-primary text-white" : "bg-white"}`}
            onClick={() => setMode("map")}
          >
            {t("workshops.view.map", { defaultValue: "Map" })}
          </button>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="mb-4 grid gap-2 sm:grid-cols-5">
        <input
          className="border rounded px-3 py-2"
          placeholder={t("workshops.search.placeholder", { defaultValue: "Search" })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          type="number" step="0.01" min="0"
          placeholder={t("workshops.filter.minPrice", { defaultValue: "Min price" })}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          type="number" step="0.01" min="0"
          placeholder={t("workshops.filter.maxPrice", { defaultValue: "Max price" })}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          type="number" step="0.1" min="0" max="5"
          placeholder={t("workshops.filter.minRating", { defaultValue: "Min rating" })}
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        />
        <button className="btn-primary">{t("workshops.filter.apply", { defaultValue: "Apply" })}</button>
      </form>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

      {mode === "list" ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((w) => (
              <Link
                key={w.id}
                to={`/workshops/${w.id}`}
                className="border rounded-lg p-4 hover:shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold">{w.name}</h2>
                  <span className="text-sm">⭐ {w.rating.toFixed(1)}</span>
                </div>
                <div className="text-sm opacity-80">
                  {w.price_min && w.price_max ? (
                    <span>
                      {t("workshops.price")}: {w.price_min}–{w.price_max}
                    </span>
                  ) : (
                    <span>{t("workshops.price")}: —</span>
                  )}
                </div>
                <div className="text-sm opacity-80">
                  {t("workshops.services")}: {w.services_count}
                </div>
              </Link>
            ))}
          </div>
          {items.length === 0 && !loading && (
            <div className="opacity-70">{t("workshops.none")}</div>
          )}
        </>
      ) : (
        <div className="h-[60vh] w-full border rounded-lg overflow-hidden">
          <WorkshopsMap workshops={items} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Map ---------------- */

function WorkshopsMap({ workshops }: { workshops: Workshop[] }) {
  const points = useMemo(
  () =>
    workshops.flatMap((w) => {
      if (w.lat == null || w.lng == null) return [];
      const lat = Number(w.lat);
      const lng = Number(w.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
      return [{ id: w.id, name: w.name, rating: w.rating, lat, lng }];
    }),
  [workshops]
);


  // default center Berlin
  const center: [number, number] =
    points.length ? [points[0].lat, points[0].lng] : [52.520008, 13.404954];

  return (
    <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers points={points} />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          <Popup>
            <div className="space-y-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm">⭐ {p.rating.toFixed(1)}</div>
              <Link className="text-blue-600 underline text-sm" to={`/workshops/${p.id}`}>
                View details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function FitToMarkers({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, map]);
  return null;
}
