import  { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Printer,
  Loader2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { downloadReceiptPdf } from "../../api/receipts";
import { format } from "date-fns";

export default function ReceiptDetails() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);



  const loadReceipt = async () => {
    try {
      const response = await api.get(`/receipts/${id}/`);
      const data = response?.data?.data || response?.data || null;
      setReceipt(data ? { ...data, id: data.id || data._id } : null);
    } catch (error) {
      console.error("Receipt detail error:", error);
    } finally {
      setLoading(false);
    }
  };

     useEffect(() => {
    loadReceipt();
  }, [id]);
  
  const handleDownloadPdf = async () => {
    if (!receipt) return;
    try {
      setDownloading(true);
      await downloadReceiptPdf(receipt.id, `${receipt.receipt_number || `receipt_${receipt.id}`}.pdf`);
      toast.success("Receipt PDF downloaded.");
    } catch (err) {
      console.error("Receipt PDF download error:", err);
      toast.error("Unable to download receipt PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6 text-center text-slate-500">Receipt not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-lg">
        <Link
          to="/client/receipts"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Receipts
        </Link>

        {/* Receipt Card */}
        <div
          id="receipt-card"
          className="rounded-3xl bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-black tracking-[0.2em] uppercase mb-1">
              Payment Receipt
            </h1>
            <p className="text-indigo-200 text-sm font-medium">
              {receipt.business_name || "InvoiceFlow"}
            </p>
          </div>

          {/* Status & Receipt Number */}
          <div className="flex items-center justify-between px-8 py-4 bg-emerald-50 border-b border-emerald-100">
            <div>
              <p className="text-xs font-medium text-emerald-700">Receipt #</p>
              <p className="text-sm font-black text-emerald-800">
                {receipt.receipt_number}
              </p>
            </div>
            <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              PAID
            </span>
          </div>

          {/* Details */}
          <div className="p-8 space-y-5">
            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-500 font-medium">Invoice #</span>
              <span className="font-bold text-slate-900">
                {receipt.invoice_number || "-"}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-500 font-medium">Date</span>
              <span className="font-bold text-slate-900">
                {receipt.issued_date
                  ? format(new Date(receipt.issued_date), "dd MMM yyyy")
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-500 font-medium">Customer</span>
              <div className="text-right">
                <p className="font-bold text-slate-900">
                  {receipt.client_name || "-"}
                </p>
                {receipt.client_email && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {receipt.client_email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="font-bold text-slate-900 uppercase">
                {receipt.payment_method || "-"}
              </span>
            </div>

            {receipt.gateway_payment_id && (
              <div className="flex justify-between items-start text-sm">
                <span className="text-slate-500 font-medium">Transaction ID</span>
                <span className="font-bold text-slate-900 text-right max-w-[180px] break-all">
                  {receipt.gateway_payment_id}
                </span>
              </div>
            )}

            {/* Amount */}
            <div className="pt-5 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">
                  Amount Paid
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{Number(receipt.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Thank You Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm font-semibold text-slate-500 italic">
              Thank you for your payment!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={printReceipt}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
