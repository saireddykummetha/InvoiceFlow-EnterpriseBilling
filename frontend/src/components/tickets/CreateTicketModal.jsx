import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LifeBuoy,
  Send,
  Loader2,
  Paperclip,
  AlertCircle,
  FileText,
  HelpCircle,
  CreditCard,
  Wrench,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import ticketService from "../../services/ticketService";

const CATEGORIES = [
  { id: "billing", label: "Billing & Payments", icon: CreditCard, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" },
  { id: "invoice", label: "Invoice Inquiry", icon: FileText, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400" },
  { id: "technical", label: "Technical Support", icon: Wrench, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
  { id: "account", label: "Account & Access", icon: AlertCircle, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400" },
  { id: "feature", label: "Feature Request", icon: Sparkles, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400" },
  { id: "general", label: "General Inquiry", icon: HelpCircle, color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
];

const PRIORITIES = [
  { id: "low", label: "Low", desc: "General question", color: "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300", active: "border-slate-800 bg-slate-900 text-white dark:bg-white dark:text-slate-900" },
  { id: "medium", label: "Medium", desc: "Standard issue", color: "border-blue-200 text-blue-700 hover:border-blue-300 dark:border-blue-800/40 dark:text-blue-400", active: "border-blue-600 bg-blue-600 text-white" },
  { id: "high", label: "High", desc: "Attention needed", color: "border-amber-200 text-amber-700 hover:border-amber-300 dark:border-amber-800/40 dark:text-amber-400", active: "border-amber-600 bg-amber-600 text-white" },
  { id: "urgent", label: "Urgent", desc: "Service blocker", color: "border-red-200 text-red-700 hover:border-red-300 dark:border-red-800/40 dark:text-red-400", active: "border-red-600 bg-red-600 text-white" },
];

export default function CreateTicketModal({ open, onClose, onSuccess }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("billing");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!subject.trim()) {
      toast.error("Please enter a ticket subject.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your issue or query.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description.trim());
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await ticketService.create(formData);
      toast.success(res?.message || "Ticket submitted successfully!");
      setSubject("");
      setDescription("");
      setAttachment(null);
      onSuccess?.(res);
      onClose?.();
    } catch (err) {
      console.error("Create ticket error:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to submit ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm cursor-pointer"
        onClick={(e) => {
          if (e.target === e.currentTarget && !submitting) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 flex flex-col max-h-[90vh] cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <LifeBuoy size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Raise Support Ticket
                </h2>
                <p className="text-xs text-slate-400">
                  Submit your request and our support desk will respond shortly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Ticket Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Question about Invoice INV-0042 payment status"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 transition"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-500"
                          : "border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800/50 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${cat.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-semibold leading-tight line-clamp-1">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isSelected ? p.active : p.color
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide details regarding your issue, invoice number, steps taken, or specific requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 transition resize-none"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Attachment (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                  <Paperclip size={15} />
                  Choose File / Screenshot
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  />
                </label>
                {attachment && (
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-indigo-400 hover:text-indigo-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Submit Support Ticket
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
