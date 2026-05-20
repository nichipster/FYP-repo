import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminFetch, type AdminUser } from "../../utils/api";

export async function loader({ request }: Route.LoaderArgs) {
  const me = await adminFetch<AdminUser>("/api/admin/me", request);
  if (!me) {
    throw redirect("/admin/login");
  }
  return { admin: me };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("_intent") as string | null;

  if (intent === "logout") {
    const API_BASE =
      typeof process !== "undefined" && process.env?.API_URL
        ? process.env.API_URL
        : "";
    const cookie = request.headers.get("Cookie") ?? "";
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    }).catch(() => null);

    const headers = new Headers();
    headers.append("Set-Cookie", "admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict");
    throw redirect("/admin/login", { headers });
  }

  return null;
}

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
