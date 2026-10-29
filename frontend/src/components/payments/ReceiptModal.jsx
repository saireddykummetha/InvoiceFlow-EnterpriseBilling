import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { getReceipt, downloadReceiptPdf } from "../../api/receipts";
import useSettings from "../../hooks/useSettings";

export default function ReceiptModal({ open, onClose, receiptId }) {
  const { formatCurrency, formatDate } = useSettings();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (open && receiptId) {
      setLoading(true);
      getReceipt(receiptId)
        .then((res) => {
          if (mounted) setReceipt(res?.data || res);
        })
        .catch(() => {
          if (mounted) toast.error("Failed to load receipt details.");
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setReceipt(null);
    }
    return () => {
      mounted = false;
    };
  }, [open, receiptId]);

  const handleDownload = async () => {
    if (!receipt || downloading) return;
    try {
      setDownloading(true);
      await downloadReceiptPdf(receipt.id, `Receipt_${receipt.receipt_number || receipt.id}.pdf`);
      toast.success("Receipt PDF downloaded.");
    } catch (err) {
      toast.error("Failed to download receipt.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-bold leading-6 text-slate-900">
                  Payment Receipt
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                </div>
              ) : receipt ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
                    <h4 className="text-2xl font-black text-slate-900">
                      {formatCurrency(receipt.amount)}
                    </h4>
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest mt-1">Payment Successful</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Receipt No</span>
                      <span className="text-sm font-bold text-slate-900">{receipt.receipt_number || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Invoice No</span>
                      <span className="text-sm font-bold text-slate-900">{receipt.invoice?.invoice_number || receipt.invoice_number || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Client</span>
                      <span className="text-sm font-bold text-slate-900">{receipt.invoice?.client_name || receipt.client_name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Payment Method</span>
                      <span className="text-sm font-bold text-slate-900 capitalize">{String(receipt.payment?.method || receipt.payment_method || "—").replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Transaction ID / UTR</span>
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[220px] font-mono">{receipt.payment?.transaction_id || receipt.transaction_id || receipt.payment?.gateway_payment_id || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Date</span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(receipt.issued_date || receipt.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Business</span>
                      <span className="text-sm font-bold text-slate-900">{receipt.business?.company_name || receipt.business_name || "—"}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {downloading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Download size={18} />}
                      {downloading ? "Downloading..." : "Download Receipt PDF"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-slate-500">
                  Receipt not found.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
