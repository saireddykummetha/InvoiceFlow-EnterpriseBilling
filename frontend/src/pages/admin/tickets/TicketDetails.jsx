import  { useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  Paperclip,
  X,
  ShieldCheck,
  User,
  CheckCircle2,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import ticketService from "../../../services/ticketService";

const STATUS_CONFIGS = {
  open: { label: "Open", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800" },
  waiting_client: { label: "Waiting for Client", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800" },
  resolved: { label: "Resolved", color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  closed: { label: "Closed", color: "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-800" },
};

export default function AdminTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachment, setReplyAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);



  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketService.get(id);
      setTicket(data);
    } catch (err) {
      console.error("Load ticket error:", err);
      toast.error("Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
    loadTicket();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await ticketService.update(id, { status: newStatus });
      toast.success(`Ticket marked as ${newStatus.replace("_", " ").toUpperCase()}`);
      setTicket(res?.data || res);
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setUpdating(true);
      const res = await ticketService.update(id, { priority: newPriority });
      toast.success(`Priority set to ${newPriority.toUpperCase()}`);
      setTicket(res?.data || res);
    } catch (err) {
      console.error("Update priority error:", err);
      toast.error("Failed to update priority.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendReply = async (e) => {
    e?.preventDefault?.();
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("message", replyMessage.trim());
      if (replyAttachment) {
        formData.append("attachment", replyAttachment);
      }

      const res = await ticketService.reply(id, formData);
      toast.success("Support reply posted and client notified!");
      setTicket(res?.data || res);
      setReplyMessage("");
      setReplyAttachment(null);
    } catch (err) {
      console.error("Reply error:", err);
      toast.error(err?.response?.data?.message || "Failed to post reply.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-indigo-600" />
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading ticket thread...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ticket not found</h2>
        <button
          onClick={() => navigate("/admin/tickets")}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft size={14} /> Back to Support Desk
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIGS[ticket.status] || STATUS_CONFIGS.open;

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back button & Ticket Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                {ticket.ticket_number}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {ticket.category?.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Status and Priority Quick Changers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Status:</span>
            <select
              value={ticket.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_client">Waiting for Client</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Priority:</span>
            <select
              value={ticket.priority}
              disabled={updating}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Initial Issue & Conversation Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Initial Ticket Description Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs">
                  <User size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{ticket.client_name}</p>
                  <p className="text-[10px] text-slate-400">Client Initial Submission</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pt-1">
              {ticket.description}
            </p>

            {ticket.attachment && (
              <div className="pt-2">
                <a
                  href={ticket.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400 transition"
                >
                  <Paperclip size={14} />
                  Download Attached Document / Screenshot
                  <Download size={13} />
                </a>
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Discussion Timeline ({ticket.messages?.length || 0})
            </h3>

            {ticket.messages && ticket.messages.length > 0 ? (
              <div className="space-y-3">
                {ticket.messages.map((msg) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col rounded-2xl p-4 sm:p-5 border transition ${
                        isAdmin
                          ? "bg-slate-900 text-white border-slate-800 ml-0 sm:ml-8"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ml-0 sm:mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${
                            isAdmin ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {isAdmin ? <ShieldCheck size={13} /> : <User size={13} />}
                          </div>
                          <span className={`text-xs font-bold ${isAdmin ? "text-indigo-300" : "text-slate-900 dark:text-slate-100"}`}>
                            {isAdmin ? "Admin / Support Representative" : (msg.sender_name || ticket.client_name)}
                          </span>
                        </div>
                        <span className={`text-[10px] ${isAdmin ? "text-slate-400" : "text-slate-400"}`}>
                          {new Date(msg.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className={`text-sm whitespace-pre-line leading-relaxed ${isAdmin ? "text-slate-200" : "text-slate-700 dark:text-slate-300"}`}>
                        {msg.message}
                      </p>

                      {msg.attachment && (
                        <div className="mt-3">
                          <a
                            href={msg.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              isAdmin
                                ? "bg-slate-800 text-indigo-300 hover:bg-slate-700"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            } transition`}
                          >
                            <Paperclip size={12} />
                            Download Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                No replies yet. Post a reply below to update the client.
              </div>
            )}
          </div>

          {/* Admin Reply Composer */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Reply to Client
            </h4>

            <form onSubmit={handleSendReply} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Type your official support response to the client..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 transition resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 transition">
                    <Paperclip size={14} />
                    Attach File / PDF
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setReplyAttachment(e.target.files?.[0] || null)}
                    />
                  </label>

                  {replyAttachment && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <span className="truncate max-w-[150px]">{replyAttachment.name}</span>
                      <button
                        type="button"
                        onClick={() => setReplyAttachment(null)}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending || !replyMessage.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Posting Reply...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Authorized Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Client Profile & Ticket Metadata */}
        <div className="space-y-6">
          {/* Client Information Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Client Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Client Name</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{ticket.client_name}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{ticket.client_email}</p>
              </div>

              {ticket.client_company && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Company</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{ticket.client_company}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Resolution Actions */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>

            <button
              type="button"
              onClick={() => handleStatusChange("resolved")}
              disabled={ticket.status === "resolved"}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition disabled:opacity-40"
            >
              <CheckCircle2 size={15} />
              Mark Ticket as Resolved
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("closed")}
              disabled={ticket.status === "closed"}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold transition disabled:opacity-40"
            >
              Close Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
