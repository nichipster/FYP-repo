import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/settings";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Modal from "../../components/admin/Modal";
import { adminFetch, type SiteSettingRecord } from "../../utils/api";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL ? process.env.API_URL : "";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Settings — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const settings = await adminFetch<SiteSettingRecord[]>("/api/admin/settings", request);
  return { settings: settings ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  if (intent === "create") {
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
      method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ key: form.get("key"), value: form.get("value"), description: form.get("description") }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: (err as any).detail ?? "Failed to create setting." };
    }
    return redirect(".");
  }

  if (intent === "update") {
    const res = await fetch(`${API_BASE}/api/admin/settings/${form.get("key")}`, {
      method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ value: form.get("value"), description: form.get("description") }),
    });
    if (!res.ok) return { error: "Failed to update setting." };
    return redirect(".");
  }

  if (intent === "delete") {
    await fetch(`${API_BASE}/api/admin/settings/${form.get("key")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  return null;
}

export default function AdminSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<SiteSettingRecord | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button
          onClick={() => { setEditRow(null); setModalOpen(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
        >
          + Add Setting
        </button>
      </div>

      {actionData?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <div className="space-y-3">
        {settings.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">No settings yet.</div>
        )}
        {settings.map((s) => (
          <div key={s.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">{s.key}</p>
              <p className="text-sm text-gray-800 truncate">{s.value}</p>
              {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setEditRow(s); setModalOpen(true); }}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteKey(s.key)}
                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editRow ? `Edit: ${editRow.key}` : "Add Setting"}>
        <Form method="post" onSubmit={() => setModalOpen(false)} className="space-y-4">
          <input type="hidden" name="_intent" value={editRow ? "update" : "create"} />
          {editRow && <input type="hidden" name="key" value={editRow.key} />}

          {!editRow && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input name="key" required placeholder="apk_url" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <textarea name="value" required rows={3} defaultValue={editRow?.value ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input name="description" defaultValue={editRow?.description ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editRow ? "Update" : "Create"}
          </button>
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteKey !== null}
        message={`Delete setting "${deleteKey}"?`}
        onCancel={() => setDeleteKey(null)}
        onConfirm={() => {
          const form = document.createElement("form");
          form.method = "post";
          [["_intent", "delete"], ["key", String(deleteKey)]].forEach(([n, v]) => {
            const i = document.createElement("input"); i.name = n; i.value = v; form.appendChild(i);
          });
          document.body.appendChild(form);
          form.submit();
          setDeleteKey(null);
        }}
      />
    </div>
  );
}
