import { redirect, Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL
    ? process.env.API_URL
    : "";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin Login — NutriTrack" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const username = form.get("username") as string;
  const password = form.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return { error: "Invalid username or password." };
    }

    // Forward Set-Cookie from the backend response to the browser
    const setCookie = res.headers.get("set-cookie");
    const headers = new Headers();
    if (setCookie) headers.append("Set-Cookie", setCookie);

    throw redirect("/admin/dashboard", { headers });
  } catch (e) {
    if (e instanceof Response) throw e;
    return { error: "Could not reach the server. Try again." };
  }
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-green-500 font-bold text-3xl">NutriTrack</span>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h1>

          {actionData?.error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
