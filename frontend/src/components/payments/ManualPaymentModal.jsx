import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  FileText,
  Loader2,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getInvoices } from "../../api/invoices";
import { createManualPayment } from "../../api/payments";
import useSettings from "../../hooks/useSettings";

export default function ManualPaymentModal({
  open,
  onClose,
  onSuccess,
}) {
  const { formatCurrency, settings } = useSettings();
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const dropdownRef = useRef(null);

  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank"); // "cash" | "upi" | "bank" | "cheque"
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingInvoices(true);
      setInvoices([]);
      getInvoices()
        .then((res) => {
          console.log("Invoices response:", res);
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.results)
            ? res.results
            : [];
          console.log("Parsed invoices list:", list);
          setInvoices(list);
          if (list.length === 0) {
            toast.info("No invoices available to record payment");
          }
        })
        .catch((err) => {
          console.error("Failed to load invoices for payment:", err);
          toast.error("Failed to load invoices");
        })
        .finally(() => {
          setLoadingInvoices(false);
        });

      setInvoiceId("");
      setAmount("");
      setMethod("bank");
      setTransactionId("");
      setNotes("");
    }
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Dropdown closes automatically when clicking elsewhere due to native select behavior
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const generateUtr = () => {
    const now = new Date();
    const dStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const tStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    if (method === "upi") {
      setTransactionId(`UPI/${dStr.slice(2)}${tStr}/${rand}`);
    } else if (method === "bank") {
      setTransactionId(`UTR${dStr}${rand}${Math.floor(10 + Math.random() * 90)}`);
    } else if (method === "card") {
      setTransactionId(`POS-${dStr}-${rand}`);
    } else {
      setTransactionId(`CSH-REC-${dStr}-${rand}`);
    }
  };

  const handleInvoiceChange = (id) => {
    setInvoiceId(id);
    const selected = invoices.find((inv) => String(inv.id) === String(id));
    if (selected) {
      const balance = Number(
        selected.balance_due ??
        selected.balanceDue ??
        selected.grand_total ??
        selected.total ??
        0
      );
      setAmount(balance > 0 ? balance : "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceId) {
      toast.error("Please select an invoice");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        invoice_id: invoiceId,
        amount: Number(amount),
        method: method,
        transaction_id: transactionId.trim() || undefined,
        notes: notes.trim(),
      };

      const result = await createManualPayment(payload);
      toast.success("Payment recorded successfully");
      onSuccess?.(result?.data || result);
      onClose?.();
    } catch (err) {
      console.error("Record payment error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to record payment";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="manual-payment-modal-overlay"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Record Payment
                  </h2>
                  <p className="text-xs text-slate-400">
                    Record an offline or direct bank transfer payment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  disabled={loadingInvoices}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 disabled:opacity-50 cursor-pointer"
                >
                  <option value="">
                    {loadingInvoices ? "Loading invoices..." : invoices.length === 0 ? `No invoices available (${invoices.length} loaded)` : "Select an invoice"}
                  </option>
                  {!loadingInvoices && invoices.map((inv) => {
                    const num = inv.invoice_number || inv.number || `#${inv.id}`;
                    const client = inv.client_name || inv.client?.name || "";
                    const due = Number(inv.balance_due ?? inv.total ?? 0);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {num} - {client} (Due: {formatCurrency(due)})
                      </option>
                    );
                  })}
                </select>
                {!loadingInvoices && invoices.length > 0 && (
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    {invoices.length} invoice(s) available to select
                  </p>
                )}
                {invoices.length === 0 && !loadingInvoices && (
                  <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                    Create an invoice first before recording a payment
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Amount ({settings?.currency?.symbol || "₹"}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="bank">Bank Transfer / NEFT / RTGS</option>
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card (POS)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Transaction ID / UTR / Reference
                  </label>
                  <button
                    type="button"
                    onClick={generateUtr}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                  >
                    + Generate Real UTR
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={
                    method === "upi"
                      ? "e.g. UPI/260814131500/A1B2 or 12-digit RRN"
                      : method === "bank"
                      ? "e.g. UTR202608149817294"
                      : "e.g. Ref / Cheque No / Voucher ID"
                  }
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Transaction Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Direct bank transfer verified in business current account"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 dark:border-slate-800">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700"
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
