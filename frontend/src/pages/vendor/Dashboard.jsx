import { useEffect, useState, useCallback, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  Eye,
  FileCheck,
  FileText,
  IndianRupee,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
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

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function VendorDashboard() {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState("May 12, 2025 - Jun 12, 2025");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [trendTimeframe, setTrendTimeframe] = useState("This Month");
  const dropdownRef = useRef(null);

  // Interactive RFQ Response Modal
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [quoteNotes, setQuoteNotes] = useState("");

  // Quotation Preview Modal
  const [selectedQuote, setSelectedQuote] = useState(null);

  // State data loaded purely from backend API without initial mock data
  const [dashboardData, setDashboardData] = useState({
    vendor_name: "",
    stats: {
      rfqs: { value: 0, subtext: "Assigned tasks" },
      submitted_quotes: { value: 0, subtext: "Deliverables submitted" },
      approved_quotes: { value: 0, subtext: "Approved deliverables" },
      purchase_orders: { value: 0, subtext: "Active task orders" },
      total_invoice_amount: { value: "₹0.00", subtext: "Invoiced work" },
    },
    quotation_status: {
      total: 0,
      breakdown: [],
    },
    recent_rfqs: [],
    quotation_trend: [],
    recent_quotations: [],
    purchase_orders: [],
    recent_payments: [],
    recent_activities: [],
  });

  const fetchVendorDashboard = useCallback(async () => {
    try {
      const res = await api.get("/vendor-portal/dashboard/");
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setDashboardData({
          vendor_name: d.vendor_name || user?.company_name || user?.username || "Vendor Portal",
          stats: d.stats || {
            rfqs: { value: 0, subtext: "Assigned tasks" },
            submitted_quotes: { value: 0, subtext: "Deliverables submitted" },
            approved_quotes: { value: 0, subtext: "Approved deliverables" },
            purchase_orders: { value: 0, subtext: "Active task orders" },
            total_invoice_amount: { value: "₹0.00", subtext: "Invoiced work" },
          },
          quotation_status: d.quotation_status || { total: 0, breakdown: [] },
          recent_rfqs: Array.isArray(d.recent_rfqs) ? d.recent_rfqs : [],
          quotation_trend: Array.isArray(d.quotation_trend) ? d.quotation_trend : [],
          recent_quotations: Array.isArray(d.recent_quotations) ? d.recent_quotations : [],
          purchase_orders: Array.isArray(d.purchase_orders) ? d.purchase_orders : [],
          recent_payments: Array.isArray(d.recent_payments) ? d.recent_payments : [],
          recent_activities: Array.isArray(d.recent_activities) ? d.recent_activities : [],
        });
      }
    } catch (err) {
      console.warn("Vendor dashboard fetch:", err?.message);
    }
  }, [user]);

  useEffect(() => {
    fetchVendorDashboard();
  }, [fetchVendorDashboard]);

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

  // Mini Sparklines
  const rfqSparkline = [{ v: 3 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }];
  const submittedSparkline = [{ v: 4 }, { v: 7 }, { v: 6 }, { v: 10 }, { v: 12 }, { v: 15 }];
  const approvedSparkline = [{ v: 2 }, { v: 3 }, { v: 3 }, { v: 5 }, { v: 4 }, { v: 6 }];
  const poSparkline = [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 4 }, { v: 3 }, { v: 4 }];
  const invoiceSparkline = [{ v: 10 }, { v: 14 }, { v: 16 }, { v: 20 }, { v: 22 }, { v: 25 }];

  const handleRespondSubmit = (e) => {
    e.preventDefault();
    if (!quotePrice) {
      toast.error("Please enter quote price");
      return;
    }
    toast.success(`Quotation submitted for ${selectedRfq.rfq_no}!`);
    // Add to submitted quotations list
    const now = new Date();
    const randomSuffix = Math.floor(2016 + Math.random() * 100);
    setDashboardData((prev) => ({
      ...prev,
      recent_quotations: [
        {
          id: now.getTime(),
          quote_no: `QTN-${randomSuffix}`,
          rfq_no: selectedRfq.rfq_no,
          client: "Enterprise Client",
          amount: `₹${Number(quotePrice).toLocaleString()}`,
          status: "Under Review",
          submitted_on: "Just now",
        },
        ...prev.recent_quotations,
      ],
      stats: {
        ...prev.stats,
        submitted_quotes: {
          ...prev.stats.submitted_quotes,
          value: Number(prev.stats.submitted_quotes.value) + 1,
        },
      },
    }));
    setSelectedRfq(null);
    setQuotePrice("");
  };

  const renderStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("paid") || s.includes("delivered") || s.includes("confirmed")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          {status}
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
    if (s.includes("review") || s.includes("progress")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
          {status}
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
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
        {status}
      </span>
    );
  };

  const renderActivityIcon = (color) => {
    switch (color) {
      case "purple":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <FileText size={17} />
          </div>
        );
      case "green":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <FileCheck size={17} />
          </div>
        );
      case "amber":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <ShieldCheck size={17} />
          </div>
        );
      case "blue":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <ShoppingCart size={17} />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Receipt size={17} />
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {dashboardData.vendor_name || user?.name || "ABC Suppliers"} 👋
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Date Range Selector */}
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
                    toast.success(`Filtered: ${opt}`);
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
      {/* 2. TOP 5 STAT CARDS                                          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* CARD 1: NEW RFQs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                New RFQs
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.rfqs.value}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {dashboardData.stats.rfqs.subtext}
              </p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rfqSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 2: SUBMITTED QUOTATIONS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <FileCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Submitted Quotations
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.submitted_quotes.value}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {dashboardData.stats.submitted_quotes.subtext}
              </p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={submittedSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 3: APPROVED QUOTATIONS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Approved Quotations
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.approved_quotes.value}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {dashboardData.stats.approved_quotes.subtext}
              </p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={approvedSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 4: PURCHASE ORDERS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Purchase Orders
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.purchase_orders.value}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {dashboardData.stats.purchase_orders.subtext}
              </p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={poSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL INVOICE AMOUNT */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Invoice Amount
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {dashboardData.stats.total_invoice_amount.value}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {dashboardData.stats.total_invoice_amount.subtext}
              </p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={invoiceSparkline}>
                  <Line type="monotone" dataKey="v" stroke="#0D9488" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MIDDLE ROW (STATUS DONUT + RECENT RFQS + TREND CHART)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* DONUT CHART: QUOTATION STATUS OVERVIEW (~30% / 4 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-4 flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Quotation Status Overview
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center relative my-auto py-2">
            <div className="h-44 w-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.quotation_status.breakdown}
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardData.quotation_status.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {dashboardData.quotation_status.total}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Total
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {dashboardData.quotation_status.breakdown.map((item) => (
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

        {/* TABLE: RECENT RFQS (~40% / 5 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent RFQs
              </h2>
              <button
                type="button"
                onClick={() => toast.success("Showing all available RFQs")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">RFQ No.</th>
                    <th className="pb-3 font-semibold">Product / Service</th>
                    <th className="pb-3 font-semibold">Qty</th>
                    <th className="pb-3 font-semibold">Deadline</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {dashboardData.recent_rfqs.map((rfq) => (
                    <tr key={rfq.id || rfq.rfq_no} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {rfq.rfq_no}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {rfq.product_service}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {rfq.qty}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {rfq.deadline}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRfq(rfq)}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold transition duration-150"
                        >
                          Respond
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CHART: QUOTATION TREND (~30% / 3 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Quotation Trend
            </h2>
            <select
              value={trendTimeframe}
              onChange={(e) => setTrendTimeframe(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 outline-none hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="This Month">This Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.quotation_trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="quoteTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "10px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#quoteTrendGradient)"
                  dot={{ r: 3.5, fill: "#8B5CF6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM ROW (MY RECENT QUOTATIONS, PURCHASE ORDERS, PAYMENTS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* TABLE 1: MY RECENT QUOTATIONS (~45% / 6 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                My Recent Quotations
              </h2>
              <button
                type="button"
                onClick={() => toast.success("Showing all quotations")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Quotation No.</th>
                    <th className="pb-3 font-semibold">RFQ No.</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Submitted On</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {dashboardData.recent_quotations.map((q) => (
                    <tr key={q.id || q.quote_no} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {q.quote_no}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {q.rfq_no}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                        {q.client}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        {q.amount}
                      </td>
                      <td className="py-3">
                        {renderStatusBadge(q.status)}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {q.submitted_on}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedQuote(q)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 ml-auto dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TABLE 2: PURCHASE ORDERS (~30% / 3 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Purchase Orders
              </h2>
              <Link
                to="/vendor/orders"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">PO No.</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Delivery Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {dashboardData.purchase_orders.map((po) => (
                    <tr key={po.id || po.po_no} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {po.po_no}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 truncate max-w-[90px]">
                        {po.client}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        {po.amount}
                      </td>
                      <td className="py-3">
                        {renderStatusBadge(po.status)}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {po.delivery_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TABLE 3: RECENT PAYMENTS (~25% / 3 cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Payments
              </h2>
              <Link
                to="/vendor/payments"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Invoice No.</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Paid On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {dashboardData.recent_payments.map((pmt) => (
                    <tr key={pmt.id || pmt.invoice_no} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {pmt.invoice_no}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        {pmt.amount}
                      </td>
                      <td className="py-3">
                        {renderStatusBadge(pmt.status)}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {pmt.paid_on}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. RECENT ACTIVITY (HORIZONTAL 5-CARD GRID)                  */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <button
            type="button"
            onClick={() => toast.success("All activities up to date")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {dashboardData.recent_activities.map((act) => (
            <div
              key={act.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40"
            >
              {renderActivityIcon(act.color)}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {act.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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

      {/* ============================================================ */}
      {/* 6. RFQ RESPONSE MODAL                                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRfq(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Respond to RFQ: {selectedRfq.rfq_no}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Product: {selectedRfq.product_service} (Qty: {selectedRfq.qty})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRfq(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRespondSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Quotation Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Delivery Timeline (Days)
                  </label>
                  <input
                    type="number"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Terms
                  </label>
                  <textarea
                    rows={3}
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Include warranty, freight conditions, or payment terms..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#6342ff] hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
                  >
                    Submit Quotation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 7. QUOTATION DETAILS PREVIEW MODAL                           */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuote(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedQuote.quote_no}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Linked RFQ: {selectedQuote.rfq_no}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Client:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedQuote.client}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedQuote.amount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Status:</span>
                  <div>{renderStatusBadge(selectedQuote.status)}</div>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Submitted On:</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedQuote.submitted_on}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
