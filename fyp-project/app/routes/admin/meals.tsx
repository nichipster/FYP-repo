import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/meals";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import DataTable from "../../components/admin/DataTable";
import Modal from "../../components/admin/Modal";
import { adminFetch, type SampleMeal } from "../../utils/api";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL ? process.env.API_URL : "";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sample Meals — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const meals = await adminFetch<SampleMeal[]>("/api/admin/meals", request);
  return { meals: meals ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  const body = {
    name: form.get("name"),
    cuisine: form.get("cuisine"),
    calories: Number(form.get("calories")),
    protein: Number(form.get("protein")),
    carbs: Number(form.get("carbs")),
    fat: Number(form.get("fat")),
    emoji: form.get("emoji"),
    tag: form.get("tag"),
    tag_color: form.get("tag_color"),
    sort_order: Number(form.get("sort_order") ?? 0),
  };

  if (intent === "create") {
    const res = await fetch(`${API_BASE}/api/admin/meals`, {
      method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Failed to create meal." };
    return redirect(".");
  }

  if (intent === "update") {
    const res = await fetch(`${API_BASE}/api/admin/meals/${form.get("id")}`, {
      method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Failed to update meal." };
    return redirect(".");
  }

  if (intent === "delete") {
    await fetch(`${API_BASE}/api/admin/meals/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  return null;
}

const TAG_COLOR_OPTIONS = [
  { label: "Local Favourite (green)", value: "bg-emerald-100 text-emerald-700" },
  { label: "High Protein (orange)", value: "bg-orange-100 text-orange-700" },
  { label: "Low Calorie (blue)", value: "bg-blue-100 text-blue-700" },
  { label: "Healthy Choice (teal)", value: "bg-teal-100 text-teal-700" },
];

export default function AdminMeals() {
  const { meals } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<SampleMeal | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sample Meals</h1>
        <button
          onClick={() => { setEditRow(null); setModalOpen(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
        >
          + Add Meal
        </button>
      </div>

      {actionData?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <DataTable
        columns={[
          { header: "Food", render: (m) => <span>{m.emoji} <span className="font-medium">{m.name}</span></span> },
          { header: "Cuisine", render: (m) => m.cuisine },
          { header: "Cal", render: (m) => `${m.calories} kcal` },
          { header: "Macros", render: (m) => <span className="text-xs text-gray-500">P:{m.protein}g C:{m.carbs}g F:{m.fat}g</span> },
          { header: "Tag", render: (m) => <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.tag_color}`}>{m.tag}</span> },
        ]}
        rows={meals}
        keyFn={(m) => m.id}
        onEdit={(m) => { setEditRow(m); setModalOpen(true); }}
        onDelete={(m) => setDeleteId(m.id)}
        emptyMessage="No sample meals yet."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editRow ? "Edit Meal" : "Add Meal"}>
        <Form method="post" onSubmit={() => setModalOpen(false)} className="space-y-4">
          <input type="hidden" name="_intent" value={editRow ? "update" : "create"} />
          {editRow && <input type="hidden" name="id" value={editRow.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" required defaultValue={editRow?.name ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <input name="emoji" required defaultValue={editRow?.emoji ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <input name="cuisine" required defaultValue={editRow?.cuisine ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
              <input name="calories" type="number" required defaultValue={editRow?.calories ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["protein", "carbs", "fat"] as const).map((m) => (
              <div key={m}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{m} (g)</label>
                <input name={m} type="number" required defaultValue={editRow?.[m] ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input name="tag" required defaultValue={editRow?.tag ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Colour</label>
            <select name="tag_color" defaultValue={editRow?.tag_color ?? TAG_COLOR_OPTIONS[0].value} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {TAG_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={editRow?.sort_order ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editRow ? "Update" : "Create"}
          </button>
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Delete this meal?"
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
