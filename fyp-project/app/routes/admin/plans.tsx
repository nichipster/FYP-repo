import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/plans";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import DataTable from "../../components/admin/DataTable";
import Modal from "../../components/admin/Modal";
import { adminFetch, type Plan, type PlanFeature } from "../../utils/api";

const API_BASE =
  typeof process !== "undefined" && process.env?.API_URL ? process.env.API_URL : "";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Plans — NutriTrack Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const plans = await adminFetch<Plan[]>("/api/admin/plans", request);
  return { plans: plans ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  if (intent === "create-plan") {
    const res = await fetch(`${API_BASE}/api/admin/plans`, {
      method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        price_display: form.get("price_display"),
        period: form.get("period"),
        highlight: form.get("highlight") === "true",
        badge: form.get("badge") || null,
        sort_order: Number(form.get("sort_order") ?? 0),
      }),
    });
    if (!res.ok) return { error: "Failed to create plan." };
    return redirect(".");
  }

  if (intent === "update-plan") {
    const res = await fetch(`${API_BASE}/api/admin/plans/${form.get("id")}`, {
      method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        price_display: form.get("price_display"),
        period: form.get("period"),
        highlight: form.get("highlight") === "true",
        badge: form.get("badge") || null,
        sort_order: Number(form.get("sort_order") ?? 0),
      }),
    });
    if (!res.ok) return { error: "Failed to update plan." };
    return redirect(".");
  }

  if (intent === "delete-plan") {
    await fetch(`${API_BASE}/api/admin/plans/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  if (intent === "add-feature") {
    const res = await fetch(`${API_BASE}/api/admin/plan-features`, {
      method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: Number(form.get("plan_id")),
        label: form.get("label"),
        included: form.get("included") !== "false",
        sort_order: Number(form.get("sort_order") ?? 0),
      }),
    });
    if (!res.ok) return { error: "Failed to add feature." };
    return redirect(".");
  }

  if (intent === "update-feature") {
    const res = await fetch(`${API_BASE}/api/admin/plan-features/${form.get("id")}`, {
      method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.get("label"),
        included: form.get("included") !== "false",
        sort_order: Number(form.get("sort_order") ?? 0),
      }),
    });
    if (!res.ok) return { error: "Failed to update feature." };
    return redirect(".");
  }

  if (intent === "delete-feature") {
    await fetch(`${API_BASE}/api/admin/plan-features/${form.get("id")}`, {
      method: "DELETE", headers: { Cookie: cookie },
    });
    return redirect(".");
  }

  return null;
}

export default function AdminPlans() {
  const { plans } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [planModal, setPlanModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [featureModal, setFeatureModal] = useState<Plan | null>(null);
  const [editFeature, setEditFeature] = useState<PlanFeature | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
  const [deleteFeatureId, setDeleteFeatureId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <button
          onClick={() => { setEditPlan(null); setPlanModal(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
        >
          + Add Plan
        </button>
      </div>

      {actionData?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <div className="space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900">{plan.name}</h2>
                <span className="text-sm text-gray-500">{plan.price_display} / {plan.period}</span>
                {plan.highlight && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Popular</span>}
                {plan.badge && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{plan.badge}</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeatureModal(plan)}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  + Feature
                </button>
                <button
                  onClick={() => { setEditPlan(plan); setPlanModal(true); }}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletePlanId(plan.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <DataTable
              columns={[
                { header: "Feature", render: (f) => f.label },
                { header: "Included", render: (f) => (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.included ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {f.included ? "✓ Yes" : "✗ No"}
                  </span>
                )},
              ]}
              rows={plan.features}
              keyFn={(f) => f.id}
              onEdit={(f) => { setEditFeature(f); setFeatureModal(plan); }}
              onDelete={(f) => setDeleteFeatureId(f.id)}
              emptyMessage="No features — add one with + Feature."
            />
          </div>
        ))}

        {plans.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">
            No plans yet. Click "+ Add Plan" to create the first one.
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <Modal isOpen={planModal} onClose={() => setPlanModal(false)} title={editPlan ? "Edit Plan" : "Add Plan"}>
        <Form method="post" onSubmit={() => setPlanModal(false)} className="space-y-4">
          <input type="hidden" name="_intent" value={editPlan ? "update-plan" : "create-plan"} />
          {editPlan && <input type="hidden" name="id" value={editPlan.id} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" required defaultValue={editPlan?.name ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Display</label>
              <input name="price_display" required placeholder="S$9.90" defaultValue={editPlan?.price_display ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input name="period" required placeholder="per month" defaultValue={editPlan?.period ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlight</label>
              <select name="highlight" defaultValue={String(editPlan?.highlight ?? false)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="false">No</option>
                <option value="true">Yes (Popular)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
              <input name="badge" placeholder="Save 28%" defaultValue={editPlan?.badge ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={editPlan?.sort_order ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editPlan ? "Update" : "Create"}
          </button>
        </Form>
      </Modal>

      {/* Feature Modal */}
      <Modal
        isOpen={!!featureModal}
        onClose={() => { setFeatureModal(null); setEditFeature(null); }}
        title={editFeature ? "Edit Feature" : `Add Feature to ${featureModal?.name}`}
      >
        <Form method="post" onSubmit={() => { setFeatureModal(null); setEditFeature(null); }} className="space-y-4">
          <input type="hidden" name="_intent" value={editFeature ? "update-feature" : "add-feature"} />
          <input type="hidden" name="plan_id" value={featureModal?.id ?? ""} />
          {editFeature && <input type="hidden" name="id" value={editFeature.id} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feature Label</label>
            <input name="label" required defaultValue={editFeature?.label ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Included</label>
              <select name="included" defaultValue={String(editFeature?.included ?? true)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="true">✓ Yes</option>
                <option value="false">✗ No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={editFeature?.sort_order ?? featureModal?.features.length ?? 0} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
            {editFeature ? "Update Feature" : "Add Feature"}
          </button>
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={deletePlanId !== null}
        message="Delete this plan and all its features?"
        onCancel={() => setDeletePlanId(null)}
        onConfirm={() => {
          const form = document.createElement("form");
          form.method = "post";
          [["_intent", "delete-plan"], ["id", String(deletePlanId)]].forEach(([n, v]) => {
            const i = document.createElement("input"); i.name = n; i.value = v; form.appendChild(i);
          });
          document.body.appendChild(form);
          form.submit();
          setDeletePlanId(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteFeatureId !== null}
        message="Delete this feature?"
        onCancel={() => setDeleteFeatureId(null)}
        onConfirm={() => {
          const form = document.createElement("form");
          form.method = "post";
          [["_intent", "delete-feature"], ["id", String(deleteFeatureId)]].forEach(([n, v]) => {
            const i = document.createElement("input"); i.name = n; i.value = v; form.appendChild(i);
          });
          document.body.appendChild(form);
          form.submit();
          setDeleteFeatureId(null);
        }}
      />
    </div>
  );
}
