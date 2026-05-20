import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/testimonials";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import DataTable from "../../components/admin/DataTable";
import Modal from "../../components/admin/Modal";
import { adminFetch, type Testimonial } from "../../utils/api";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL ? process.env.API_URL : "";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Testimonials — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const testimonials = await adminFetch<Testimonial[]>("/api/admin/testimonials", request);
  return { testimonials: testimonials ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  const body = {
    name: form.get("name"),
    role: form.get("role"),
    text: form.get("text"),
    avatar: form.get("avatar"),
    sort_order: Number(form.get("sort_order") ?? 0),
    active: form.get("active") === "true",
  };

  if (intent === "create") {
    const res = await fetch(`${API_BASE}/api/admin/testimonials`, {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Failed to create testimonial." };
    return redirect(".");
  }

  if (intent === "update") {
    const res = await fetch(`${API_BASE}/api/admin/testimonials/${form.get("id")}`, {
      method: "PUT",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Failed to update testimonial." };
    return redirect(".");
  }

  if (intent === "delete") {
    await fetch(`${API_BASE}/api/admin/testimonials/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  return null;
}

export default function AdminTestimonials() {
  const { testimonials } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
        <button
          onClick={() => { setEditRow(null); setModalOpen(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
        >
          + Add
        </button>
      </div>

      {actionData?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <DataTable
        columns={[
          { header: "Name", render: (t) => <span className="font-medium">{t.name}</span> },
          { header: "Role", render: (t) => t.role },
          { header: "Avatar", render: (t) => <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{t.avatar}</span> },
          { header: "Status", render: (t) => (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {t.active ? "Active" : "Hidden"}
            </span>
          )},
        ]}
        rows={testimonials}
        keyFn={(t) => t.id}
        onEdit={(t) => { setEditRow(t); setModalOpen(true); }}
        onDelete={(t) => setDeleteId(t.id)}
        emptyMessage="No testimonials yet."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editRow ? "Edit Testimonial" : "Add Testimonial"}>
        <Form method="post" onSubmit={() => setModalOpen(false)} className="space-y-4">
          <input type="hidden" name="_intent" value={editRow ? "update" : "create"} />
          {editRow && <input type="hidden" name="id" value={editRow.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" required defaultValue={editRow?.name ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (2 chars)</label>
              <input name="avatar" required maxLength={4} defaultValue={editRow?.avatar ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Description</label>
            <input name="role" required defaultValue={editRow?.role ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
            <textarea name="text" required rows={3} defaultValue={editRow?.text ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={editRow?.sort_order ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visible</label>
              <select name="active" defaultValue={String(editRow?.active ?? true)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editRow ? "Update" : "Create"}
          </button>
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Delete this testimonial?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          const form = document.createElement("form");
          form.method = "post";
          [["_intent", "delete"], ["id", String(deleteId)]].forEach(([n, v]) => {
            const i = document.createElement("input"); i.name = n; i.value = v; form.appendChild(i);
          });
          document.body.appendChild(form);
          form.submit();
          setDeleteId(null);
        }}
      />
    </div>
  );
}
