import { useState, useEffect } from "react";
import {
  BarChart3,

} from "lucide-react";
import api from "../../services/api";

export default function SuperAdminReports() {
  const [timeframe, setTimeframe] = useState("all");

  const [metrics, setMetrics] = useState({
    mrr: "$0.00",
    mrr_growth: "+0.0%",
    arr: "$0.00",
    arr_growth: "+0.0%",
    active_tenants: 0,
    tenants_growth: "+0.0%",
    avg_revenue_per_tenant: "$0.00",
    churn_rate: "0.0%",
  });

  const [months, setMonths] = useState(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]);
  const [revenueData, setRevenueData] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/superadmin/stats/?time_range=${timeframe}`);
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          const mrrNum = d.metrics?.monthly_subscription_revenue || 0;
          const arrNum = mrrNum * 12;
          const tenantsCount = d.metrics?.total_businesses || d.metrics?.total_tenants || 0;
          const arpu = tenantsCount > 0 ? Math.round(mrrNum / tenantsCount) : 0;

          setMetrics({
            mrr: `$${mrrNum.toLocaleString()}`,
            mrr_growth: "+0.0%",
            arr: `$${arrNum.toLocaleString()}`,
            arr_growth: "+0.0%",
            active_tenants: tenantsCount,
            tenants_growth: "+0.0%",
            avg_revenue_per_tenant: `$${arpu.toLocaleString()}`,
            churn_rate: "0.0%",
          });

          if (d.growth_chart?.labels && d.growth_chart.labels.length > 0) {
            setMonths(d.growth_chart.labels);
            setRevenueData(d.growth_chart.revenue || d.growth_chart.labels.map(() => 0));
          }
        }
      } catch (err) {
        console.warn("Failed to load report stats:", err?.message);
      }
    };

    fetchStats();
  }, [timeframe]);

  const maxRevenue = Math.max(...revenueData, 1);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="text-purple-600 dark:text-purple-400" size={26} />
            Platform Executive Analytics & MRR Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-tenant financial reporting, recurring revenue metrics, and growth trajectories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Fiscal Year</option>
          </select>
        </div>
      </div>

      {/* EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Recurring (MRR)</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{metrics.mrr_growth}</span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.mrr}</p>
          <p className="mt-1 text-xs text-slate-400">Net new subscription revenue</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Annual Run-Rate (ARR)</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{metrics.arr_growth}</span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.arr}</p>
          <p className="mt-1 text-xs text-slate-400">Projected 12-month value</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average Revenue / Tenant</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">ARPU</span>
          </div>
          <p className="mt-2 text-3xl font-black text-purple-600 dark:text-purple-400">{metrics.avg_revenue_per_tenant}</p>
          <p className="mt-1 text-xs text-slate-400">Blended commercial tiers</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Tenants</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">{metrics.active_tenants}</p>
          <p className="mt-1 text-xs text-slate-400">Registered businesses</p>
        </div>
      </div>

      {/* REVENUE BAR GRAPH */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Revenue Trajectory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">SaaS subscription & commercial billing expansion</p>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3 h-48 items-end pt-6 pb-2">
          {months.map((m, idx) => {
            const val = revenueData[idx] || 0;
            const heightPct = maxRevenue > 0 ? Math.round((val / maxRevenue) * 100) : 0;

            return (
              <div key={`${m}-${idx}`} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition">
                  ${(val / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full max-w-[42px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-xl group-hover:from-purple-500 group-hover:to-indigo-400 transition-all cursor-pointer shadow-md shadow-purple-600/20"
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{m}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
