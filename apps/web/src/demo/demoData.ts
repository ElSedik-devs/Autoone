// Tiny in-memory data just for demo pages (no API/auth)
export type DemoService = {
  id: number; title: string; price: number;
  title_i18n?: string;
  summary?: string;
  duration_min?: number | null;
  included?: string[];
  excluded?: string[];
  preparation?: string[];
  policy?: { cancellation?: string; warranty_days?: number | null } | null;
  faqs?: Array<{ q: string; a: string }>;
  notes?: string | null;
};

export type DemoWorkshop = {
  id: number;
  type: "workshop" | "carwash";
  name: string;
  rating: number;
  price_min?: number | null;
  price_max?: number | null;
  services: DemoService[];
};

export const DEMO_WORKSHOPS: DemoWorkshop[] = [
  {
    id: 1, type: "workshop", name: "FastFix Garage", rating: 4.6, price_min: 20, price_max: 120,
    services: [
      {
        id: 101, title: "Oil change", price: 40,
        summary: "Standard oil & filter replacement.",
        duration_min: 45,
        included: ["Engine oil", "Oil filter", "Multi-point check"],
        excluded: ["Synthetic oil surcharge"],
        preparation: ["Bring maintenance book"],
        policy: { cancellation: "Free up to 24h before", warranty_days: 30 },
        faqs: [{ q: "How long?", a: "About 45 minutes." }],
      },
      { id: 102, title: "Brake check", price: 60, summary: "Brake pads visual check & test drive." }
    ],
  },
  {
    id: 2, type: "carwash", name: "Sparkle Wash", rating: 4.5, price_min: 10, price_max: 80,
    services: [
      { id: 201, title: "Exterior wash", price: 15, summary: "Contactless exterior wash." },
      { id: 202, title: "Interior cleaning", price: 25, summary: "Vacuum & wipe surfaces." },
      { id: 203, title: "Polishing", price: 60, summary: "Full-body polish and wax." },
    ],
  },
];
