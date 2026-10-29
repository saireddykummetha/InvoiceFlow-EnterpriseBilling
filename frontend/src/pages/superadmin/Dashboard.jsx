import  { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users,
  FolderKanban,
  CreditCard,
  Plus,
  UserPlus,
  Activity,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("6_months");
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);


  // Form states
  const [newBizForm, setNewBizForm] = useState({
    business_name: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    currency: "USD",
    phone: "",
  });
  const [submittingBiz, setSubmittingBiz] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    metrics: {
      total_businesses: 0,
      total_users: 0,
      total_projects: 0,
      active_subscriptions: 0,
      monthly_subscription_revenue: 0,
      free_trials_active: 0,
      free_trials_exhausted: 0,
    },
    growth_chart: {
      labels: [],
      businesses: [],
      users: [],
      projects: [],
      revenue: [],
    },
    subscription_overview: {
      free_trial: { count: 0, active: 0, exhausted: 0 },
      starter: { count: 0, percentage: 0 },
      professional: { count: 0, percentage: 0 },
      enterprise: { count: 0, percentage: 0 },
      total_subscriptions: 0,
      active_paid_subscriptions: 0,
      cancelled_subscriptions: 0,
    },
    recent_businesses: [],
    recent_activities: [],
  });

  const fetchDashboardData = useCallback(async (range = timeRange) => {
    try {
      const res = await api.get(`/superadmin/stats/?time_range=${range}`);
      if (res.data?.success && res.data.data) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load superadmin stats:", err);
      toast.error("Failed to load real-time telemetry from backend.");
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    if (!newBizForm.business_name || !newBizForm.admin_email) {
      toast.error("Business name and admin email are required.");
      return;
    }

    try {
      setSubmittingBiz(true);
      const res = await api.post("/superadmin/tenants/", newBizForm);
      if (res.data?.success) {
        toast.success(res.data.message || "Business created with Free Trial!");
        setShowAddBusinessModal(false);
        setNewBizForm({
          business_name: "",
          admin_name: "",
          admin_email: "",
          admin_password: "",
          currency: "USD",
          phone: "",
        });
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create business.");
    } finally {
      setSubmittingBiz(false);
    }
  };

  const { metrics, growth_chart, subscription_overview, recent_businesses, recent_activities } = dashboardData;

  // Plan color map
  const getPlanBadge = (plan) => {
    const p = (plan || "").toUpperCase();
    if (p.includes("STARTER")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (p.includes("ENTERPRISE")) {
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    }
    if (p.includes("PRO")) {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  };

  // Max value for growth chart scaling
  const maxGrowthValue = Math.max(
    ...(growth_chart?.users || [1]),
    ...(growth_chart?.businesses || [1]),
    ...(growth_chart?.projects || [1]),
    10
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              SUPER ADMIN • PLATFORM OWNER
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Platform Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of the entire platform, ecosystem tenants, and subscription telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddBusinessModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500 transition cursor-pointer"
          >
            <Plus size={15} /> Add New Business
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS (100% DATABASE DRIVEN) - Only show when creating new business */}
      {showAddBusinessModal && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* Total Businesses */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Businesses</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Building2 size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {metrics.total_businesses}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Registered tenant instances</p>
          </div>

          {/* Total Users */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {metrics.total_users}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Across all 4 system roles</p>
          </div>

          {/* Total Projects */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Projects</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FolderKanban size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {metrics.total_projects}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Active & completed workspaces</p>
          </div>

          {/* Active Subscriptions */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Active Subscriptions</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <CreditCard size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
              {metrics.active_subscriptions}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Trial & paid active licenses</p>
          </div>

          {/* Monthly Subscription Revenue */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Monthly Sub Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                $
              </div>
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ${metrics.monthly_subscription_revenue.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Platform MRR (Excludes tenant invoices)</p>
          </div>

          {/* Free Trials / Trials Exhausted */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">5-Project Trials</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.free_trials_active}</span>
              <span className="text-xs font-bold text-slate-400">active /</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{metrics.free_trials_exhausted} exhausted</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">5-project limit tracking</p>
          </div>
        </div>
      )}

      {/* 3. PLATFORM GROWTH SECTION & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PLATFORM GROWTH DYNAMIC CHART (8 COLS) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Growth Metrics</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Real database growth trajectories over time</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="7_days">Last 7 Days</option>
                <option value="30_days">Last 30 Days</option>
                <option value="6_months">Last 6 Months</option>
                <option value="12_months">Last 12 Months</option>
              </select>
            </div>
          </div>

          {/* LEGEND */}
          <div className="flex items-center gap-4 text-xs mb-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Businesses
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Users
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Projects
            </span>
          </div>

          {/* DYNAMIC TIME BARS */}
          {growth_chart?.labels?.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-slate-400">
              No historical telemetry recorded for this timeframe yet.
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-fr gap-3 h-48 items-end pt-4 pb-2">
              {growth_chart.labels.map((lbl, idx) => {
                const bVal = growth_chart.businesses[idx] || 0;
                const uVal = growth_chart.users[idx] || 0;
                const pVal = growth_chart.projects[idx] || 0;

                const bHeight = Math.max(8, Math.round((bVal / maxGrowthValue) * 100));
                const uHeight = Math.max(8, Math.round((uVal / maxGrowthValue) * 100));
                const pHeight = Math.max(8, Math.round((pVal / maxGrowthValue) * 100));

                return (
                  <div key={lbl + idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="flex items-end gap-1 h-full w-full justify-center">
                      <div
                        className="w-2.5 bg-purple-500 rounded-t-md transition-all hover:opacity-80"
                        style={{ height: `${bHeight}%` }}
                        title={`Businesses: ${bVal}`}
                      />
                      <div
                        className="w-2.5 bg-blue-500 rounded-t-md transition-all hover:opacity-80"
                        style={{ height: `${uHeight}%` }}
                        title={`Users: ${uVal}`}
                      />
                      <div
                        className="w-2.5 bg-emerald-500 rounded-t-md transition-all hover:opacity-80"
                        style={{ height: `${pHeight}%` }}
                        title={`Projects: ${pVal}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[48px]">{lbl}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS & PLATFORM CONTROL (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Platform Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            <button
              onClick={() => setShowAddBusinessModal(true)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-purple-500/5 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Plus size={18} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center">
                + Add Business
              </span>
            </button>

            <button
              onClick={() => navigate("/super-admin/users")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-blue-500/5 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <UserPlus size={18} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center">
                + Platform Admin
              </span>
            </button>

            <button
              onClick={() => navigate("/super-admin/subscriptions")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-emerald-500/5 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CreditCard size={18} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center">
                Subscriptions
              </span>
            </button>

            <button
              onClick={() => navigate("/super-admin/users")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-indigo-500/5 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Users size={18} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center">
                View Users
              </span>
            </button>

            <button
              onClick={() => navigate("/super-admin/audit-logs")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-cyan-500/5 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Activity size={18} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center">
                Audit Logs
              </span>
            </button>

            <button
              onClick={() => navigate("/super-admin/payments")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-amber-500/5 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <WalletCards size={18} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center">
                View Payments
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. SUBSCRIPTION BREAKDOWN & FREE TRIAL MONITORING */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} />
              5-Project Free Trial & Commercial Tiers Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Multi-tenant subscription allocations based on the 5-project free quota model.
            </p>
          </div>
          <Link
            to="/super-admin/subscriptions"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            Manage Subscriptions →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Free Trial Tier</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {subscription_overview.free_trial?.count || 0}
            </p>
            <div className="mt-1 text-[10px] text-slate-400 flex justify-center gap-2">
              <span className="text-emerald-500 font-semibold">{subscription_overview.free_trial?.active || 0} Active</span>
              <span>•</span>
              <span className="text-rose-500 font-semibold">{subscription_overview.free_trial?.exhausted || 0} Exhausted</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Starter Plan ($29)</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {subscription_overview.starter?.count || 0}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{subscription_overview.starter?.percentage || 0}% of tenant base</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Professional ($79)</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {subscription_overview.professional?.count || 0}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{subscription_overview.professional?.percentage || 0}% of tenant base</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Enterprise ($199)</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {subscription_overview.enterprise?.count || 0}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{subscription_overview.enterprise?.percentage || 0}% of tenant base</p>
          </div>
        </div>
      </div>

      {/* 5. RECENT BUSINESSES TABLE (DATABASE DRIVEN) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Businesses / Tenants</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Latest business workspaces registered on the platform</p>
          </div>
          <Link
            to="/super-admin/tenants"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View All Businesses →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Business Name</th>
                <th className="px-4 py-3">Admin Email</th>
                <th className="px-4 py-3">Current Plan</th>
                <th className="px-4 py-3">Users Quota</th>
                <th className="px-4 py-3">Projects Quota</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined On</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recent_businesses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-xs text-slate-400">
                    No businesses created yet. Click "+ Add New Business" to provision the first tenant.
                  </td>
                </tr>
              ) : (
                recent_businesses.map((b) => (
                  <tr key={b.id || b._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                      {b.business_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {b.admin_email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPlanBadge(b.plan)}`}>
                        {b.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">
                      {b.users_count} / {b.max_users}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">
                      <span className={b.projects_count >= b.max_projects ? "text-rose-500 font-bold" : ""}>
                        {b.projects_count} / {b.max_projects}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === "Active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {b.joined_on}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate("/super-admin/tenants")}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. RECENT PLATFORM AUDIT ACTIVITY */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Platform Activity</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">System security audit trail and administrative actions</p>
          </div>
          <Link
            to="/super-admin/audit-logs"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Full Audit Logs →
          </Link>
        </div>

        <div className="space-y-2.5">
          {recent_activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent platform activities logged.</p>
          ) : (
            recent_activities.map((act, idx) => (
              <div
                key={act.id || act._id || idx}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                    <Activity size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{act.description}</p>
                    <span className="text-[10px] text-slate-400">Actor: {act.actor}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {act.created_at ? new Date(act.created_at).toLocaleString() : "Just now"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE BUSINESS MODAL */}
      {showAddBusinessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingBiz) {
              setShowAddBusinessModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Provision New Business Tenant</h3>
              <button
                onClick={() => setShowAddBusinessModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={newBizForm.business_name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, business_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newBizForm.admin_name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, admin_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@acme.com"
                  value={newBizForm.admin_email}
                  onChange={(e) => setNewBizForm({ ...newBizForm, admin_email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank for Admin123!"
                  value={newBizForm.admin_password}
                  onChange={(e) => setNewBizForm({ ...newBizForm, admin_password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-700 dark:text-amber-400">
                ⚡ <strong>Automatic Free Trial Provisioning:</strong> This business will automatically receive a <strong>FREE_TRIAL (5 Projects Limit)</strong> subscription upon creation.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBusinessModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBiz}
                  className="px-5 py-2 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-500 disabled:opacity-50 cursor-pointer"
                >
                  {submittingBiz ? "Creating..." : "Provision Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
