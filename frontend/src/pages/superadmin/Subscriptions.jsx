import  { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Edit2,

} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUS_BADGES = {
  TRIAL_ACTIVE: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  TRIAL_EXHAUSTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  PAST_DUE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  CANCELLED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
};

const PLAN_BADGES = {
  FREE_TRIAL: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  STARTER: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PROFESSIONAL: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  ENTERPRISE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [editingSub, setEditingSub] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchSubs = async () => {
    try {
      const res = await api.get("/superadmin/subscriptions/");
      if (res.data?.success && res.data?.data) {
        setSubscriptions(res.data.data);
      } else {
        const fallback = await api.get("/subscriptions/");
        setSubscriptions(fallback.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform subscriptions");
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!editingSub) return;

    try {
      setUpdating(true);
      await api.patch("/superadmin/subscriptions/", {
        subscription_id: editingSub.id || editingSub._id,
        plan_name: editingSub.plan_name,
        status: editingSub.status,
        max_projects: editingSub.max_projects,
        max_users: editingSub.max_users,
        monthly_price: editingSub.monthly_price,
      });

      toast.success("Subscription updated successfully!");
      setEditingSub(null);
      fetchSubs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update subscription");
    } finally {
      setUpdating(false);
    }
  };

  const filteredSubs = subscriptions.filter((s) => {
    const matchesSearch =
      s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.owner_email?.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" || s.plan_name === planFilter;
    return matchesSearch && matchesPlan;
  });

  // Calculate summary counts
  const totalSubs = subscriptions.length;
  const trialActiveCount = subscriptions.filter((s) => s.status === "TRIAL_ACTIVE").length;
  const trialExhaustedCount = subscriptions.filter((s) => s.status === "TRIAL_EXHAUSTED").length;
  const paidActiveCount = subscriptions.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="text-purple-600 dark:text-purple-400" size={26} />
            SaaS Subscriptions & Tenant Licenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor tenant quotas, 5-project free trials, and commercial plan upgrades across the platform.
          </p>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Subscriptions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalSubs}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">All registered businesses</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Active Free Trials</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{trialActiveCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Under 5 projects consumed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Trials Exhausted</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{trialExhaustedCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">5/5 projects reached (Upgrade req.)</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Paid Active Licenses</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{paidActiveCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Starter / Pro / Enterprise</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search business name or owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-xs"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none shadow-xs"
        >
          <option value="all">All Plans</option>
          <option value="FREE_TRIAL">Free Trial</option>
          <option value="STARTER">Starter</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>

      {/* SUBSCRIPTIONS TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Business & Admin</th>
                <th className="px-4 py-3.5">Plan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Trial Usage</th>
                <th className="px-4 py-3.5">Project Usage</th>
                <th className="px-4 py-3.5">User Usage</th>
                <th className="px-4 py-3.5">Upgrade Required</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id || sub._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{sub.business_name}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{sub.owner_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${PLAN_BADGES[sub.plan_name] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                        {sub.plan_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[sub.status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      {sub.is_trial ? (
                        <span className={sub.trial_used >= 5 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-purple-600 dark:text-purple-400"}>
                          {sub.trial_used} / 5 Projects {sub.trial_used >= 5 && "(Ended)"}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">N/A (Paid Tier)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      <strong>{sub.projects_count}</strong> / {sub.is_trial ? 5 : sub.max_projects}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      <strong>{sub.users_count}</strong> / {sub.max_users}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.upgrade_required
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {sub.upgrade_required ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setEditingSub({ ...sub })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition text-[11px] font-semibold cursor-pointer"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SUBSCRIPTION MODAL */}
      {editingSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingSub(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Subscription: {editingSub.business_name}</h3>
              <button onClick={() => setEditingSub(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">Plan Tier</label>
                <select
                  value={editingSub.plan_name}
                  onChange={(e) => setEditingSub({ ...editingSub, plan_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="FREE_TRIAL">FREE_TRIAL</option>
                  <option value="STARTER">STARTER</option>
                  <option value="PROFESSIONAL">PROFESSIONAL</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">Status</label>
                <select
                  value={editingSub.status}
                  onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="TRIAL_ACTIVE">TRIAL_ACTIVE</option>
                  <option value="TRIAL_EXHAUSTED">TRIAL_EXHAUSTED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">Max Projects</label>
                  <input
                    type="number"
                    value={editingSub.max_projects}
                    onChange={(e) => setEditingSub({ ...editingSub, max_projects: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">Max Users</label>
                  <input
                    type="number"
                    value={editingSub.max_users}
                    onChange={(e) => setEditingSub({ ...editingSub, max_users: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
