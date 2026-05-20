import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/faqs";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import DataTable from "../../components/admin/DataTable";
import Modal from "../../components/admin/Modal";
import { adminFetch, type FaqGroup, type FaqItem } from "../../utils/api";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL ? process.env.API_URL : "";

interface FaqCategory {
  id: number;
  name: string;
  sort_order: number;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "FAQs — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const [groups, categories] = await Promise.all([
    adminFetch<FaqGroup[]>("/api/admin/faqs", request).then(() =>
      adminFetch<FaqGroup[]>("/api/faqs", request)
    ),
    adminFetch<FaqCategory[]>("/api/admin/faq-categories", request),
    adminFetch<FaqItem[]>("/api/admin/faqs", request),
  ]);

  const items = await adminFetch<FaqItem[]>("/api/admin/faqs", request);
  return { groups, categories: categories ?? [], items: items ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  if (intent === "create-category") {
    const res = await fetch(`${API_BASE}/api/admin/faq-categories`, {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), sort_order: Number(form.get("sort_order") ?? 0) }),
    });
    if (!res.ok) return { error: "Failed to create category." };
    return redirect(".");
  }

  if (intent === "delete-category") {
    await fetch(`${API_BASE}/api/admin/faq-categories/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  if (intent === "create-item") {
    const res = await fetch(`${API_BASE}/api/admin/faqs`, {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: Number(form.get("category_id")),
        question: form.get("question"),
        answer: form.get("answer"),
        sort_order: Number(form.get("sort_order") ?? 0),
      }),
    });
    if (!res.ok) return { error: "Failed to create FAQ item." };
    return redirect(".");
  }

  if (intent === "update-item") {
    const res = await fetch(`${API_BASE}/api/admin/faqs/${form.get("id")}`, {
      method: "PUT",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: Number(form.get("category_id")),
        question: form.get("question"),
        answer: form.get("answer"),
        sort_order: Number(form.get("sort_order") ?? 0),
      }),
    });
    if (!res.ok) return { error: "Failed to update FAQ item." };
    return redirect(".");
  }

  if (intent === "delete-item") {
    await fetch(`${API_BASE}/api/admin/faqs/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  return null;
}

export default function AdminFaqs() {
  const { categories, items } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [catModal, setCatModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editItem, setEditItem] = useState<FaqItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "item"; id: number } | null>(null);

  const handleEditItem = (item: FaqItem) => {
    setEditItem(item);
    setItemModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCatModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            + Category
          </button>
          <button
            onClick={() => { setEditItem(null); setItemModal(true); }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
          >
            + FAQ Item
          </button>
        </div>
      </div>

      {actionData?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h2>
        <DataTable
          columns={[
            { header: "Name", render: (c) => c.name },
            { header: "Order", render: (c) => c.sort_order },
          ]}
          rows={categories}
          keyFn={(c) => c.id}
          onEdit={() => {}}
          onDelete={(c) => setDeleteTarget({ type: "category", id: c.id })}
          emptyMessage="No categories yet."
        />
      </div>

      {/* Items */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">FAQ Items</h2>
        <DataTable
          columns={[
            { header: "Question", render: (i) => <span className="font-medium">{i.question}</span> },
            { header: "Category", render: (i) => categories.find((c) => c.id === (i as any).category_id)?.name ?? "—" },
            { header: "Order", render: (i) => i.sort_order },
          ]}
          rows={items as any[]}
          keyFn={(i: any) => i.id}
          onEdit={(i) => handleEditItem(i as FaqItem)}
          onDelete={(i: any) => setDeleteTarget({ type: "item", id: i.id })}
          emptyMessage="No FAQ items yet."
        />
      </div>

      {/* Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Add Category">
        <Form method="post" onSubmit={() => setCatModal(false)} className="space-y-4">
          <input type="hidden" name="_intent" value="create-category" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            Create
          </button>
        </Form>
      </Modal>

      {/* Item Modal */}
      <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={editItem ? "Edit FAQ Item" : "Add FAQ Item"}>
        <Form method="post" onSubmit={() => setItemModal(false)} className="space-y-4">
          <input type="hidden" name="_intent" value={editItem ? "update-item" : "create-item"} />
          {editItem && <input type="hidden" name="id" value={editItem.id} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category_id" required defaultValue={(editItem as any)?.category_id ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input name="question" required defaultValue={editItem?.question ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea name="answer" required rows={4} defaultValue={editItem?.answer ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={editItem?.sort_order ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editItem ? "Update" : "Create"}
          </button>
        </Form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`Delete this ${deleteTarget?.type === "category" ? "category (and all its items)" : "FAQ item"}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const form = document.createElement("form");
          form.method = "post";
          const intentInput = document.createElement("input");
          intentInput.name = "_intent";
          intentInput.value = deleteTarget.type === "category" ? "delete-category" : "delete-item";
          const idInput = document.createElement("input");
          idInput.name = "id";
          idInput.value = String(deleteTarget.id);
          form.appendChild(intentInput);
          form.appendChild(idInput);
          document.body.appendChild(form);
          form.submit();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
