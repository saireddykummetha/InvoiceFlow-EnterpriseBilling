import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle2,

  Edit2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/subscriptions/plans/");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setPlans(res.data.data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.warn("Failed to load plans:", err?.message);
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);
    setTimeout(() => {
      setPlans((prev) =>
        prev.map((p) => (p.plan_name === editingPlan.plan_name ? { ...p, ...editingPlan } : p))
      );
      toast.success(`Plan ${editingPlan.display_name} updated!`);
      setEditingPlan(null);
      setSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="text-purple-600 dark:text-purple-400" size={26} />
            SaaS Plans, Tiers & Quota Configuration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure multi-tenant commercial plans, project limitations, user seats, and subscription pricing.
          </p>
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.plan_name}
            className={`relative flex flex-col justify-between rounded-3xl border p-5 transition-all hover:shadow-lg ${
              plan.popular
                ? "border-purple-500 bg-gradient-to-b from-purple-500/5 via-white to-white dark:from-purple-500/10 dark:via-slate-900 dark:to-slate-900 shadow-md shadow-purple-900/5"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                Popular Tier
              </span>
            )}

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {plan.plan_name}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {plan.active_tenants || 24} Active
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{plan.display_name}</h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">${plan.monthly_price || plan.price || 0}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ month</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
                  <p className="text-[10px] text-slate-400">Projects Limit</p>
                  <p className="font-bold text-slate-900 dark:text-white">{plan.max_projects}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
                  <p className="text-[10px] text-slate-400">User Seats</p>
                  <p className="font-bold text-slate-900 dark:text-white">{plan.max_users}</p>
                </div>
              </div>

              <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {plan.features?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPlan({ ...plan })}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition cursor-pointer"
              >
                <Edit2 size={13} /> Edit Tier Specs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingPlan(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Plan: {editingPlan.display_name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingPlan.display_name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, display_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  value={editingPlan.monthly_price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Max Projects</label>
                  <input
                    type="number"
                    value={editingPlan.max_projects}
                    onChange={(e) => setEditingPlan({ ...editingPlan, max_projects: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Max Users</label>
                  <input
                    type="number"
                    value={editingPlan.max_users}
                    onChange={(e) => setEditingPlan({ ...editingPlan, max_users: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
