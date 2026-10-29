import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  FileCheck,
  Loader2,
  Eye,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { downloadReceiptPdf } from "../../api/receipts";
import { format } from "date-fns";
import useSettings from "../../hooks/useSettings";

export default function Receipts() {
  const { formatCurrency } = useSettings();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);



  const loadReceipts = async () => {
    try {
      const response = await api.get("/receipts/");
      const data = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data?.results)
        ? response.data.results
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setReceipts(data.map((r) => ({ ...r, id: r.id || r._id })));
    } catch (error) {
      console.error("Receipts error:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadReceipts();
  }, []);

  const handleDownloadPdf = async (id, number) => {
    try {
      setDownloadingId(id);
      await downloadReceiptPdf(id, `${number || `receipt_${id}`}.pdf`);
      toast.success("Receipt PDF downloaded.");
    } catch (err) {
      console.error("Receipt PDF download error:", err);
      toast.error("Unable to download receipt PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Receipts</h1>
          <p className="mt-1 text-sm text-slate-500">
            All your payment receipts in one place.
          </p>
        </div>

        {/* Content */}
        <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-900">No receipts yet</p>
                <p className="text-sm text-slate-500 mt-1">Receipts will appear here after successful payments.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3 bg-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt #</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</span>
              </div>

              {receipts.map((receipt) => (
                <div key={receipt.id} className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                  {/* Receipt Number */}
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{receipt.receipt_number}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">PAID</span>
                    </div>
                  </div>

                  {/* Invoice */}
                  <p className="text-sm font-semibold text-slate-700">
                    {receipt.invoice_number || "-"}
                  </p>

                  {/* Amount */}
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(receipt.amount || 0)}
                  </p>

                  {/* Date */}
                  <p className="text-sm text-slate-500 hidden sm:block">
                    {receipt.issued_date
                      ? format(new Date(receipt.issued_date), "dd MMM yyyy")
                      : "-"}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/client/receipts/${receipt.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <button
                      type="button"
                      disabled={downloadingId === receipt.id}
                      onClick={() => handleDownloadPdf(receipt.id, receipt.receipt_number)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-60"
                    >
                      {downloadingId === receipt.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}