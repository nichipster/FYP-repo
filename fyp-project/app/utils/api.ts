// SSR-safe typed fetch helpers.
// On the server (SSR loaders): uses API_URL env var to reach the backend container.
// On the browser: uses relative paths so the Vite proxy / express proxy handles routing.

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL
    ? process.env.API_URL
    : "";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function publicFetch<T>(path: string, request?: Request): Promise<T | null> {
  const headers: HeadersInit = {};
  if (request) {
    const cookie = request.headers.get("Cookie");
    if (cookie) headers["Cookie"] = cookie;
  }
  return apiFetch<T>(path, { headers });
}

export function adminFetch<T>(
  path: string,
  request: Request,
  init?: RequestInit
): Promise<T | null> {
  const cookie = request.headers.get("Cookie") ?? "";
  return apiFetch<T>(path, {
    ...init,
    headers: { ...init?.headers, Cookie: cookie },
  });
}

// ── Shared TypeScript types (mirror backend response shapes) ─────────────────

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface FaqGroup {
  category: string;
  category_id: number;
  items: FaqItem[];
}

export interface PlanFeature {
  id: number;
  label: string;
  included: boolean;
  sort_order: number;
}

export interface Plan {
  id: number;
  name: string;
  price_display: string;
  period: string;
  highlight: boolean;
  badge: string | null;
  sort_order: number;
  features: PlanFeature[];
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
  sort_order: number;
  active: boolean;
}

export interface TeamMember {
  id: number;
  initials: string;
  name: string;
  role: string;
  email: string;
  description: string;
  bg_color: string;
  sort_order: number;
}

export interface SampleMeal {
  id: number;
  name: string;
  cuisine: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji: string;
  tag: string;
  tag_color: string;
  sort_order: number;
}

export interface SiteSettings {
  apk_url?: string;
  video_url?: string;
  [key: string]: string | undefined;
}

export interface AdminUser {
  id: number;
  username: string;
}

export interface DashboardStats {
  faqs: number;
  plans: number;
  testimonials: number;
  team_members: number;
  meals: number;
  settings: number;
}

export interface SiteSettingRecord {
  id: number;
  key: string;
  value: string;
  description: string | null;
}
