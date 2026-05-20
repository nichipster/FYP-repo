import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/team";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import DataTable from "../../components/admin/DataTable";
import Modal from "../../components/admin/Modal";
import { adminFetch, type TeamMember } from "../../utils/api";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL ? process.env.API_URL : "";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Team — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const members = await adminFetch<TeamMember[]>("/api/admin/team", request);
  return { members: members ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  const body = {
    initials: form.get("initials"),
    name: form.get("name"),
    role: form.get("role"),
    email: form.get("email"),
    description: form.get("description"),
    bg_color: form.get("bg_color"),
    sort_order: Number(form.get("sort_order") ?? 0),
  };

  if (intent === "create") {
    const res = await fetch(`${API_BASE}/api/admin/team`, {
      method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Failed to create team member." };
    return redirect(".");
  }

  if (intent === "update") {
    const res = await fetch(`${API_BASE}/api/admin/team/${form.get("id")}`, {
      method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Failed to update team member." };
    return redirect(".");
  }

  if (intent === "delete") {
    await fetch(`${API_BASE}/api/admin/team/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  return null;
}

const BG_OPTIONS = [
  "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500",
  "bg-indigo-500", "bg-purple-500", "bg-rose-500", "bg-orange-500",
];

export default function AdminTeam() {
  const { members } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <button
          onClick={() => { setEditRow(null); setModalOpen(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
        >
          + Add Member
        </button>
      </div>

      {actionData?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <DataTable
        columns={[
          { header: "Initials", render: (m) => (
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold ${m.bg_color}`}>{m.initials}</span>
          )},
          { header: "Name", render: (m) => <span className="font-medium">{m.name}</span> },
          { header: "Role", render: (m) => <span className="text-xs text-gray-500">{m.role}</span> },
          { header: "Email", render: (m) => m.email },
        ]}
        rows={members}
        keyFn={(m) => m.id}
        onEdit={(m) => { setEditRow(m); setModalOpen(true); }}
        onDelete={(m) => setDeleteId(m.id)}
        emptyMessage="No team members yet."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editRow ? "Edit Team Member" : "Add Team Member"}>
        <Form method="post" onSubmit={() => setModalOpen(false)} className="space-y-4">
          <input type="hidden" name="_intent" value={editRow ? "update" : "create"} />
          {editRow && <input type="hidden" name="id" value={editRow.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initials</label>
              <input name="initials" required maxLength={4} defaultValue={editRow?.initials ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={editRow?.sort_order ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" required defaultValue={editRow?.name ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input name="role" required defaultValue={editRow?.role ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required defaultValue={editRow?.email ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea name="description" required rows={3} defaultValue={editRow?.description ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Colour</label>
            <select name="bg_color" defaultValue={editRow?.bg_color ?? "bg-emerald-500"} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {BG_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editRow ? "Update" : "Create"}
          </button>
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Delete this team member?"
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
