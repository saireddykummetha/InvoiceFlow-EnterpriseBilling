import  { useEffect, useState, useMemo } from "react";
import {  useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Plus,
  Search,
  // Filter,
  // Clock,
  // CheckCircle2,
  // AlertCircle,
  MessageSquare,
  ChevronRight,
  Loader2,
  RefreshCw,
  // Sparkles,
  Inbox,
  // ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ticketService from "../../services/ticketService";
import CreateTicketModal from "../../components/tickets/CreateTicketModal";

const STATUS_CONFIGS = {
  open: { label: "Open", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800" },
  waiting_client: { label: "Action Needed", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800" },
  resolved: { label: "Resolved", color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  closed: { label: "Closed", color: "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-800" },
};

const PRIORITY_BADGES = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  medium: { label: "Medium", color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  high: { label: "High", color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  urgent: { label: "Urgent", color: "bg-red-50 text-red-600 font-bold dark:bg-red-950/40 dark:text-red-400" },
};

export default function ClientTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);


  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await ticketService.getAll(params);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load tickets error:", err);
      toast.error("Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadTickets();
  }, [statusFilter]);


  const filtered = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.ticket_number?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress" || t.status === "waiting_client").length;
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <LifeBuoy size={15} />
            Support Desk
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Support & Help Tickets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit inquiries, request assistance with invoices or billing, and track live resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadTickets}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 transition"
            title="Refresh tickets"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <Plus size={16} />
            Raise Support Ticket
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tickets</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{metrics.total}</p>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Open Tickets</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{metrics.open}</p>
        </div>
        <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-900/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{metrics.inProgress}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved</p>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{metrics.resolved}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket #, subject or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 transition"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800">
          <div className="text-center">
            <Loader2 size={28} className="mx-auto animate-spin text-indigo-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading support tickets...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Inbox size={26} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
            No support tickets found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {search
              ? `No tickets match "${search}". Try clearing your search.`
              : "You haven't raised any support tickets yet. Click below to create one."}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              <Plus size={15} />
              Raise First Ticket
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const statusConfig = STATUS_CONFIGS[ticket.status] || STATUS_CONFIGS.open;
            const priorityBadge = PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.medium;
            return (
              <div
                key={ticket.id}
                onClick={() => navigate(`/client/tickets/${ticket.id}`)}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 hover:border-indigo-300 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500/50 transition cursor-pointer"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {ticket.ticket_number}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityBadge.color}`}>
                      {priorityBadge.label} Priority
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {ticket.category?.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {ticket.subject}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MessageSquare size={13} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.messages_count || 0}</span> replies
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(ticket.last_reply_at || ticket.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:group-hover:bg-indigo-950 transition">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadTickets()}
      />
    </div>
  );
}
