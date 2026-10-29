import { useState, useEffect } from "react";
import {
  WalletCards,
  Search,
  CheckCircle2,
  Clock,
  
} from "lucide-react";
import api from "../../services/api";

export default function SuperAdminPayments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments/");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setPayments(
          data.map((p) => ({
            id: p.id,
            transaction_id: p.transaction_id || `TXN-${p.id}`,
            business_name: p.business?.business_name || p.business_name || "Enterprise Hub",
            client_name: p.invoice?.client?.name || p.client_name || "Client Account",
            invoice_number: p.invoice?.invoice_number || p.invoice_number || `INV-${p.id}`,
            amount: Number(p.amount || 0),
            payment_method: p.payment_method || "Online",
            status: p.status || "Completed",
            created_at: p.created_at || new Date().toISOString(),
          }))
        );
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.warn("Failed to load payments:", err?.message);
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalVolume = payments.reduce((acc, p) => acc + (p.status?.toLowerCase() === "completed" || p.status?.toLowerCase() === "success" ? p.amount : 0), 0);
  const successfulCount = payments.filter((p) => p.status?.toLowerCase() === "completed" || p.status?.toLowerCase() === "success").length;
  const pendingCount = payments.filter((p) => p.status?.toLowerCase() === "pending").length;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <WalletCards className="text-purple-600 dark:text-purple-400" size={26} />
            Cross-Tenant Payments & Revenue Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global real-time transaction ledger across all registered tenant businesses.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Settled Volume</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              $
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">${totalVolume.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">Processed across all active businesses</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Successful Transactions</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">{successfulCount}</p>
          <p className="mt-1 text-xs text-slate-400">100% verified settlement rate</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Settlements</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          <p className="mt-1 text-xs text-slate-400">Awaiting gateway clearance</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by transaction ID, tenant name, or invoice #..."
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
          <option value="completed">Completed / Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Transaction & Tenant</th>
                <th className="px-4 py-3.5">Client & Invoice</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">{p.transaction_id}</span>
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">{p.business_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{p.client_name}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{p.invoice_number}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                    {p.payment_method}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(p.created_at).toLocaleString()}
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
