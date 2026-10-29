import { useEffect, useState, useRef } from "react";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  CreditCard,
  FileText,
  IndianRupee,
  MoreVertical,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserPlus,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

import dashboardService from "../../services/dashboardService";
import api from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("May 12, 2025 - Jun 12, 2025");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [overviewTimeframe, setOverviewTimeframe] = useState("This Month");
  const [invoicesTimeframe, setInvoicesTimeframe] = useState("This Month");
  const dropdownRef = useRef(null);

  const [subscriptionUsage, setSubscriptionUsage] = useState(null);

  // Dynamic state loaded purely from backend API without initial mock data
  const [dashboardData, setDashboardData] = useState({
    clients: 0,
    vendors: 0,
    quotations: 0,
    invoices: 0,
    total_revenue: 0,
    stats: {
      clients: { value: "0", growth: "0.0%", from: "from last month" },
      vendors: { value: "0", growth: "0.0%", from: "from last month" },
      quotations: { value: "0", growth: "0.0%", from: "from last month" },
      invoices: { value: "0", growth: "0.0%", from: "from last month" },
      revenue: { value: "₹0.00", growth: "0.0%", from: "from last month" },
    },
    quotations_by_status: {
      total: 0,
      breakdown: [],
    },
    invoices_by_status: {
      total: 0,
      breakdown: [],
    },
    overview_chart: [],
    recent_quotations: [],
    recent_invoices: [],
    recent_activities: [],
  });

  const loadDashboardData = async () => {
    try {
      const res = await dashboardService.get();
      if (res?.data || res?.revenue !== undefined || res?.clients !== undefined) {
        const d = res.data || res;
        setDashboardData({
          clients: d.clients || 0,
          vendors: d.vendors || 0,
          quotations: d.quotations || 0,
          invoices: d.invoices || 0,
          total_revenue: d.total_revenue || 0,
          stats: {
            clients: {
              value: String(d.clients ?? 0),
              growth: d.stats?.clients?.growth || "0.0%",
              from: d.stats?.clients?.from || "from last month",
            },
            vendors: {
              value: String(d.vendors ?? 0),
              growth: d.stats?.vendors?.growth || "0.0%",
              from: d.stats?.vendors?.from || "from last month",
            },
            quotations: {
              value: String(d.quotations ?? 0),
              growth: d.stats?.quotations?.growth || "0.0%",
              from: d.stats?.quotations?.from || "from last month",
            },
            invoices: {
              value: String(d.invoices ?? 0),
              growth: d.stats?.invoices?.growth || "0.0%",
              from: d.stats?.invoices?.from || "from last month",
            },
            revenue: {
              value: d.stats?.revenue?.value || `₹${(d.total_revenue || 0).toLocaleString("en-IN")}`,
              growth: d.stats?.revenue?.growth || "0.0%",
              from: d.stats?.revenue?.from || "from last month",
            },
          },
          quotations_by_status: d.quotations_by_status || { total: 0, breakdown: [] },
          invoices_by_status: d.invoices_by_status || { total: 0, breakdown: [] },
          overview_chart: Array.isArray(d.overview_chart) ? d.overview_chart : [],
          recent_quotations: Array.isArray(d.recent_quotations) ? d.recent_quotations : [],
          recent_invoices: Array.isArray(d.recent_invoices) ? d.recent_invoices : [],
          recent_activities: Array.isArray(d.recent_activities) ? d.recent_activities : [],
        });
      }

      // Fetch dynamic subscription usage
      try {
        const subRes = await api.get("/subscriptions/usage/");
        if (subRes.data?.success && subRes.data?.data) {
          setSubscriptionUsage(subRes.data.data);
        }
      } catch (subErr) {
        console.warn("Subscription usage fetch:", subErr?.message);
      }
    } catch (err) {
      console.warn("Dashboard sync:", err?.message);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh dashboard data when window regains focus (after navigating back from list pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData();
      }
    };

    const handleFocus = () => {
      loadDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false);
      }
    };

    if (dateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateDropdownOpen]);

  // Mini Sparkline Data for 5 Top Cards
  const clientSparkline = [
    { v: 10 }, { v: 14 }, { v: 12 }, { v: 18 }, { v: 16 }, { v: 24 }, { v: 28 },
  ];
  const vendorSparkline = [
    { v: 12 }, { v: 15 }, { v: 13 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 29 },
  ];
  const quoteSparkline = [
    { v: 15 }, { v: 18 }, { v: 14 }, { v: 22 }, { v: 28 }, { v: 24 }, { v: 34 },
  ];
  const invoiceSparkline = [
    { v: 10 }, { v: 16 }, { v: 14 }, { v: 24 }, { v: 22 }, { v: 28 }, { v: 30 },
  ];
  const revenueSparkline = [
    { v: 20 }, { v: 25 }, { v: 22 }, { v: 32 }, { v: 30 }, { v: 42 }, { v: 48 },
  ];

  // Helper status pill badges
  const renderStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("paid")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          Paid
        </span>
      );
    }
    if (s.includes("approved")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          Approved
        </span>
      );
    }
    if (s.includes("review")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
          Under Review
        </span>
      );
    }
    if (s.includes("pending")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
          Pending
        </span>
      );
    }
    if (s.includes("draft")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
        {status}
      </span>
    );
  };

  const renderActivityIcon = (type) => {
    switch (type) {
      case "quotation_request":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <FileText size={18} />
          </div>
        );
      case "quotation_approved":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck size={18} />
          </div>
        );
      case "invoice_paid":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Receipt size={18} />
          </div>
        );
      case "po_created":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <ShoppingCart size={18} />
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <UserPlus size={18} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & DATE RANGE SELECTOR                          */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Welcome back, Admin! Here's what's happening with your business.
          </p>
        </div>

        {/* Date Range Selector Pill (Matching Template) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 transition"
          >
            <Calendar size={16} className="text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-20 dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
              {[
                "May 12, 2025 - Jun 12, 2025",
                "Today",
                "Last 7 Days",
                "This Month",
                "Last 30 Days",
                "This Quarter",
                "This Year",
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setDateRange(opt);
                    setDateDropdownOpen(false);
                    toast.success(`Filter updated: ${opt}`);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                    dateRange === opt
                      ? "bg-[#6342ff] text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1.5 SUBSCRIPTION & FREE TRIAL USAGE BANNER CARD             */}
      {/* ============================================================ */}
      {subscriptionUsage && (
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            subscriptionUsage.is_trial
              ? subscriptionUsage.trial_exhausted
                ? "border-rose-300/80 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent dark:border-rose-900/60 dark:bg-rose-950/20"
                : "border-purple-300/80 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent dark:border-purple-900/60 dark:bg-purple-950/20"
              : "border-emerald-300/80 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:border-emerald-900/60 dark:bg-emerald-950/20"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-md ${
                  subscriptionUsage.is_trial
                    ? subscriptionUsage.trial_exhausted
                      ? "bg-rose-600 shadow-rose-600/30"
                      : "bg-[#6342ff] shadow-indigo-600/30"
                    : "bg-emerald-600 shadow-emerald-600/30"
                }`}
              >
                <CreditCard size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      subscriptionUsage.is_trial
                        ? subscriptionUsage.trial_exhausted
                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                          : "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {subscriptionUsage.is_trial
                      ? subscriptionUsage.trial_exhausted
                        ? "FREE TRIAL COMPLETED"
                        : "FREE TRIAL"
                      : `${subscriptionUsage.plan_name} PLAN (ACTIVE)`}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Projects: {subscriptionUsage.projects.used} / {subscriptionUsage.projects.limit} used
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subscriptionUsage.is_trial
                    ? subscriptionUsage.trial_exhausted
                      ? "Your free trial has ended. Upgrade your plan to continue creating projects."
                      : `You can create ${subscriptionUsage.projects.remaining} more project${subscriptionUsage.projects.remaining === 1 ? "" : "s"} on your free trial.`
                    : `Active subscription quota: ${subscriptionUsage.projects.used} of ${subscriptionUsage.projects.limit} projects utilized.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-40 hidden sm:block">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>Usage</span>
                  <span>{subscriptionUsage.projects.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      subscriptionUsage.trial_exhausted
                        ? "bg-rose-500"
                        : subscriptionUsage.projects.percentage > 80
                        ? "bg-amber-500"
                        : "bg-[#6342ff]"
                    }`}
                    style={{ width: `${subscriptionUsage.projects.percentage}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/subscription")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95 ${
                  subscriptionUsage.trial_exhausted
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 animate-pulse"
                    : "bg-[#6342ff] hover:bg-[#5232ee] shadow-indigo-600/30"
                }`}
              >
                {subscriptionUsage.trial_exhausted ? "Upgrade Now" : "Upgrade Plan"}
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TOP 5 STAT CARDS (WITH ICON BOX & SPARKLINE)              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* CARD 1: TOTAL CLIENTS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6342ff] text-white shadow-md shadow-indigo-600/20">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Clients
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.clients.value}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboardData.stats.clients.growth}
                </span>
                <span className="text-slate-400">{dashboardData.stats.clients.from}</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#6342ff" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL VENDORS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10b981] text-white shadow-md shadow-emerald-600/20">
              <Store size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Vendors
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.vendors.value}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboardData.stats.vendors.growth}
                </span>
                <span className="text-slate-400">{dashboardData.stats.vendors.from}</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vendorSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 3: TOTAL QUOTATIONS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f59e0b] text-white shadow-md shadow-amber-600/20">
              <FileText size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Quotations
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.quotations.value}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboardData.stats.quotations.growth}
                </span>
                <span className="text-slate-400">{dashboardData.stats.quotations.from}</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quoteSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 4: TOTAL INVOICES */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-md shadow-blue-600/20">
              <Receipt size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Invoices
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.invoices.value}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboardData.stats.invoices.growth}
                </span>
                <span className="text-slate-400">{dashboardData.stats.invoices.from}</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={invoiceSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL REVENUE */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d9488] text-white shadow-md shadow-teal-600/20">
              <IndianRupee size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Revenue
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.revenue.value}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboardData.stats.revenue.growth}
                </span>
                <span className="text-slate-400">{dashboardData.stats.revenue.from}</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MIDDLE CHARTS ROW (OVERVIEW + 2 DONUT CHARTS)             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* CHART 1: QUOTATION & INVOICE OVERVIEW (50% / 6 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Quotation & Invoice Overview
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={overviewTimeframe}
                onChange={(e) => setOverviewTimeframe(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
              Quotations
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              Invoices
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
              Revenue (₹)
            </div>
          </div>

          {/* Chart Graphic */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.overview_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 50]}
                  ticks={[0, 10, 20, 30, 40, 50]}
                  tickFormatter={(v) => `₹${v}L`}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  formatter={(val, name) => [
                    name === "Revenue (₹)" ? `₹${val} Lakhs` : val,
                    name,
                  ]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="quotations"
                  name="Quotations"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="invoices"
                  name="Invoices"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: QUOTATIONS BY STATUS (25% / 3 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Quotations by Status
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center relative my-auto py-2">
            <div className="h-44 w-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.quotations_by_status.breakdown}
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardData.quotations_by_status.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {dashboardData.quotations_by_status.total}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-1.5 mt-2">
            {dashboardData.quotations_by_status.breakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <div className="text-slate-900 dark:text-slate-100 font-bold">
                  {item.value} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 3: INVOICES BY STATUS (25% / 3 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Invoices by Status
            </h2>
            <select
              value={invoicesTimeframe}
              onChange={(e) => setInvoicesTimeframe(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 outline-none hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="This Month">This Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <div className="flex flex-col items-center justify-center relative my-auto py-2">
            <div className="h-44 w-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.invoices_by_status.breakdown}
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardData.invoices_by_status.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {dashboardData.invoices_by_status.total}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-1.5 mt-2">
            {dashboardData.invoices_by_status.breakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <div className="text-slate-900 dark:text-slate-100 font-bold">
                  {item.value} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM ROW (RECENT QUOTES, RECENT INVOICES, ACTIVITY)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* TABLE 1: RECENT QUOTATIONS (~40% / 5 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Quotations
              </h2>
              <Link
                to="/admin/quotes"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">QTN No.</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Vendor</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {dashboardData.recent_quotations.map((q) => (
                    <tr key={q.id || q.quote_number} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {q.quote_number}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                        {q.client}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
                        {q.vendor}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        {q.amount}
                      </td>
                      <td className="py-3">
                        {renderStatusBadge(q.status)}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {q.date}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/quotes`)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/admin/quotes"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All Quotations
            </Link>
          </div>
        </div>

        {/* TABLE 2: RECENT INVOICES (~35% / 4 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Invoices
              </h2>
              <Link
                to="/admin/invoices"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">INV No.</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {dashboardData.recent_invoices.map((inv) => (
                    <tr key={inv.id || inv.invoice_number} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                        {inv.client}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        {inv.amount}
                      </td>
                      <td className="py-3">
                        {renderStatusBadge(inv.status)}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {inv.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/admin/invoices"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All Invoices
            </Link>
          </div>
        </div>

        {/* LIST 3: RECENT ACTIVITY (~25% / 3 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Activity
              </h2>
              <button
                type="button"
                onClick={() => navigate("/admin/reports")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData.recent_activities.map((act, idx) => (
                <div key={act.id || act._id || idx} className="flex items-start gap-3">
                  {renderActivityIcon(act.type, act.color)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {act.title}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {act.subtitle}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}