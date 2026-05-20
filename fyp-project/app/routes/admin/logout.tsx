import { redirect } from "react-router";
import type { Route } from "./+types/logout";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL
    ? process.env.API_URL
    : "";

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie },
  }).catch(() => null);

  const headers = new Headers();
  headers.append("Set-Cookie", "admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict");
  throw redirect("/admin/login", { headers });
}

export async function loader() {
  throw redirect("/admin/login");
}

export default function Logout() {
  return null;
}
