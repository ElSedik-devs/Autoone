// apps/web/src/types.ts
export type FAQ = { q: string; a: string };

export type ServiceInfo = {
  id: number;
  workshop_id: number;
  title: string;
  title_i18n?: string | null;
  price: number | string;

  // info template (all optional)
  summary?: string | null;
  duration_min?: number | null;
  included?: string[] | null;
  excluded?: string[] | null;
  preparation?: string[] | null;
  policy?: { cancellation?: string; warranty_days?: number | null } | null;
  faqs?: FAQ[] | null;
  notes?: string | null;

  created_at?: string;
  updated_at?: string;
};
