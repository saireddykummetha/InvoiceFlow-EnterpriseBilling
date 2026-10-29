import { useState, useEffect } from "react";
import {
  Receipt,
  Search,
} from "lucide-react";
import api from "../../services/api";

const STATUS_BADGES = {
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  partially_paid: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  sent: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  overdue: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export default function SuperAdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/invoices/");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setInvoices(
          data.map((inv) => ({
            id: inv.id || inv._id,
            invoice_number: inv.invoice_number || `INV-${inv.id}`,
            business_name: inv.business?.business_name || inv.business_name || "Enterprise Hub",
            client_name: inv.client?.name || inv.client_name || "Client Account",
            total: Number(inv.total || 0),
            paid_amount: Number(inv.paid_amount || 0),
            balance_due: Number(inv.balance_due || 0),
            status: inv.status || "sent",
            issue_date: inv.issue_date || "-",
            due_date: inv.due_date || "-",
          }))
        );
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.warn("Failed to load invoices:", err?.message);
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paid_amount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balance_due, 0);

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      i.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="text-purple-600 dark:text-purple-400" size={26} />
            Cross-Tenant Invoices & Billing Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global repository of commercial invoices, VAT schedules, and outstanding receivables across all tenants.
          </p>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Invoiced Amount</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">${totalInvoiced.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">Across all platform tenants</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Collected Amount</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalCollected.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">Settled and paid invoices</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Outstanding Balance Due</p>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">${totalOutstanding.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">Pending client remittances</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by invoice number, tenant, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none shadow-xs"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="sent">Sent / Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* INVOICES TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice & Tenant</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Balance Due</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5 text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id || inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">{inv.invoice_number}</span>
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">{inv.business_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                    {inv.client_name}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    ${inv.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-rose-600 dark:text-rose-400">
                    ${inv.balance_due.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[inv.status] || "bg-slate-100 text-slate-700"}`}>
                      {inv.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {inv.issue_date}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {inv.due_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
