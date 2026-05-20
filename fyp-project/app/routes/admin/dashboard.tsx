import type { Route } from "./+types/dashboard";
import { adminFetch, type DashboardStats } from "../../utils/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const stats = await adminFetch<DashboardStats>("/api/admin/dashboard", request);
  return { stats };
}

const statCards = [
  { key: "faqs" as const, label: "FAQ Items", color: "bg-emerald-50 text-emerald-700" },
  { key: "plans" as const, label: "Plans", color: "bg-blue-50 text-blue-700" },
  { key: "testimonials" as const, label: "Testimonials", color: "bg-purple-50 text-purple-700" },
  { key: "team_members" as const, label: "Team Members", color: "bg-orange-50 text-orange-700" },
  { key: "meals" as const, label: "Sample Meals", color: "bg-pink-50 text-pink-700" },
  { key: "settings" as const, label: "Site Settings", color: "bg-gray-50 text-gray-700" },
];

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { stats } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(({ key, label, color }) => (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className={`text-4xl font-extrabold ${color.split(" ")[1]}`}>
                {stats[key]}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-sm text-yellow-700">
          Could not load stats — backend may be unavailable.
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Links</h2>
        <p className="text-sm text-gray-500">
          Use the sidebar to manage FAQs, subscription plans, testimonials, team members, sample meals, and site settings.
          All changes are reflected on the public website immediately.
        </p>
      </div>
    </div>
  );
}
