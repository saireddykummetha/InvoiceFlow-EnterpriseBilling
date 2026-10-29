import { useState, useEffect } from "react";
import {
  LifeBuoy,
  Search,

} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUS_BADGES = {
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  waiting_client: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  resolved: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  closed: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

const PRIORITY_BADGES = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export default function SuperAdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets/");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setTickets(
          data.map((t) => ({
            id: t.id || t._id,
            ticket_number: t.ticket_number || `TCK-${t.id}`,
            subject: t.subject || "Support Inquiry",
            business_name: t.business?.business_name || t.business_name || "Enterprise Hub",
            client_name: t.created_by?.username || t.client_name || "User",
            priority: t.priority || "medium",
            status: t.status || "open",
            category: t.category || "general",
            created_at: t.created_at || new Date().toISOString(),
          }))
        );
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.warn("Failed to load tickets:", err?.message);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => ((t.id === ticketId || t._id === ticketId) ? { ...t, status: newStatus } : t))
    );
    toast.success(`Ticket status updated to ${newStatus.toUpperCase()}`);
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.business_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <LifeBuoy className="text-purple-600 dark:text-purple-400" size={26} />
            Global Customer Support & SLA Helpdesk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming inquiries, billing questions, technical issues, and SLA tickets across all tenants.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Open Tickets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{openCount}</p>
          <p className="mt-1 text-xs text-slate-400">Awaiting initial support response</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</p>
          <p className="mt-1 text-xs text-slate-400">Active engineering triage</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          <p className="mt-1 text-xs text-slate-400">Successfully closed</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search ticket number, subject, or tenant..."
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
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none shadow-xs"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* TICKETS TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Ticket & Subject</th>
                <th className="px-4 py-3.5">Tenant Organization</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTickets.map((t) => (
                <tr key={t.id || t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3.5 max-w-sm">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{t.ticket_number}</span>
                      <p className="font-bold text-slate-900 dark:text-white truncate mt-0.5">{t.subject}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-purple-600 dark:text-purple-400">
                    {t.business_name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                    {t.category}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGES[t.priority] || "bg-slate-100 text-slate-700"}`}>
                      {t.priority?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[t.status] || "bg-slate-100 text-slate-700"}`}>
                      {t.status?.replace("_", " ")?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600 transition text-[11px] font-semibold cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTicket(null);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Update Ticket Status</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">{selectedTicket.subject}</p>

            <div className="grid grid-cols-2 gap-2">
              {["open", "in_progress", "resolved", "closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(selectedTicket.id || selectedTicket._id, st)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                    selectedTicket.status === st
                      ? "bg-purple-600 text-white"
                      : "border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
