import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import useSettings from "../../hooks/useSettings";
import { generateClientCredentials } from "../../api/clients";

export default function ClientViewModal({
  open,
  client,
  onClose,
  onEdit,
  onDelete,
}) {
  const { formatCurrency } = useSettings();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!client) return null;

  const name = client.name || client.client_name || "Client Details";
  const company = client.company || client.company_name || "";
  const email = client.email || "—";
  const phone = client.phone || "—";
  const gstin = client.gstin || client.tax_number || "—";
  const address = client.address || client.street || "—";
  const city = client.city || "";
  const state = client.state || "";
  const country = client.country || "";
  const fullAddress = [address, city, state, country].filter(Boolean).join(", ") || "No address specified";

  const outstanding = Number(
    client.outstanding ?? client.outstanding_amount ?? 0
  );
  const invoiceCount = client.invoice_count ?? client.invoiceCount ?? 0;
  const status =
    client.status ||
    (client.is_active === false ? "Inactive" : "Active");

  const handleGenerateCredentials = async () => {
    if (!client.email) {
      toast.error("Client needs an email address to enable portal login.");
      return;
    }

    try {
      setResettingPassword(true);
      const clientId = client.id || client._id;
      const res = await generateClientCredentials(clientId);
      if (res?.success && res?.data) {
        setGeneratedCreds(res.data);
        toast.success("New portal credentials generated!");
      }
    } catch (err) {
      toast.error(err,"Failed to generate portal credentials");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCopyCredentials = (creds) => {
    const loginUrl = `${window.location.origin}/login`;
    const text = `Client Portal Login Details:\nPortal URL: ${loginUrl} (Select Client tab)\nEmail: ${creds.email}\nPassword: ${creds.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Login credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="client-view-modal-overlay"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-950 p-6 text-white dark:bg-slate-950 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white font-black text-lg backdrop-blur">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black">{name}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          String(status).toLowerCase() === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {company ? company : "Individual Client"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Outstanding Balance
                  </p>
                  <p className={`text-lg font-black mt-1 ${outstanding > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"}`}>
                    {formatCurrency(outstanding)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Invoices
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                    {invoiceCount}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border border-slate-100 p-4 space-y-3 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact Information
                </h4>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <span>{phone}</span>
                  </div>
                </div>
              </div>

              {/* Portal Login Credentials Section */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Client Portal Login Access
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={resettingPassword || !client.email}
                    onClick={handleGenerateCredentials}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition disabled:opacity-50"
                  >
                    {resettingPassword ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    {generatedCreds ? "Regenerate" : "Generate Login Password"}
                  </button>
                </div>

                {generatedCreds ? (
                  <div className="rounded-xl bg-white p-3 border border-indigo-200 text-xs space-y-2 dark:bg-slate-900 dark:border-indigo-900">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Email:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{generatedCreds.email}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Password:</span>
                      <strong className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 dark:bg-emerald-950/40">
                        {generatedCreds.password}
                      </strong>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(generatedCreds)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied Credentials" : "Copy Login Info"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Client can sign in at <strong>/login</strong> (Client tab) using <strong>{email}</strong>. Click &ldquo;Generate Login Password&rdquo; to create a new password and share it with the client.
                  </p>
                )}
              </div>

              {/* Billing & Tax Information */}
              <div className="rounded-2xl border border-slate-100 p-4 space-y-3 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Billing & Tax Details
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs leading-5">{fullAddress}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs">
                    <Building2 size={16} className="text-slate-400 shrink-0" />
                    <span>GSTIN / Tax ID: <strong className="text-slate-900 dark:text-slate-100">{gstin}</strong></span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Notes:</p>
                  <p>{client.notes}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onDelete?.(client);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onEdit?.(client);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                <Pencil size={14} />
                Edit Client
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
