import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("team", "routes/team.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("tos", "routes/tos.tsx"),

  // Admin login sits outside the protected layout so it has no auth guard
  route("admin/login", "routes/admin/login.tsx"),
  route("admin/logout", "routes/admin/logout.tsx"),

  // Protected admin area — layout loader redirects to /admin/login if not authenticated
  layout("routes/admin/layout.tsx", [
    route("admin/dashboard",    "routes/admin/dashboard.tsx"),
    route("admin/faqs",         "routes/admin/faqs.tsx"),
    route("admin/plans",        "routes/admin/plans.tsx"),
    route("admin/testimonials", "routes/admin/testimonials.tsx"),
    route("admin/team",         "routes/admin/team.tsx"),
    route("admin/meals",        "routes/admin/meals.tsx"),
    route("admin/settings",     "routes/admin/settings.tsx"),
  ]),
] satisfies RouteConfig;
