import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  FileDown,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { downloadInvoicePdf } from "../../api/invoices";
import { getReceipts } from "../../api/receipts";
import useSettings from "../../hooks/useSettings";
import PaymentModal from "../../components/payments/PaymentModal";
import ReceiptModal from "../../components/payments/ReceiptModal";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { formatCurrency } = useSettings();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptId, setReceiptId] = useState(null);


  const loadInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}/`);
      const data = response?.data?.data || response?.data || null;
      setInvoice(data ? { ...data, id: data.id || data._id } : null);
    } catch (error) {
      console.error("Invoice details error:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center text-slate-500">
        Invoice not found.
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadInvoicePdf(invoice.id, `${invoice.invoice_number || `invoice_${invoice.id}`}.pdf`);
      toast.success("Invoice PDF downloaded.");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Unable to download invoice PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const isPaid = Number(invoice.balance_due || 0) === 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/client/invoices"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>

        {/* Card */}
        <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {invoice.invoice_number}
              </h1>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                isPaid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}>
                {invoice.status}
              </span>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-900">
                {invoice.client_name || invoice.client?.name || "Client Name"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {invoice.client_email || invoice.client?.email || ""} | {invoice.client_phone || invoice.client?.phone || ""}
              </p>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-12">
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Invoice Date</p>
                <p className="text-sm font-semibold text-slate-800">{invoice.issue_date || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Due Date</p>
                <p className="text-sm font-semibold text-slate-800">{invoice.due_date || "-"}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              <span>Description</span>
              <span>Amount</span>
            </div>
            
            <div className="space-y-4">
              {(invoice.items || []).map((item, index) => (
                <div key={item.id || item._id || index} className="flex justify-between items-start text-sm">
                  <span className="font-medium text-slate-700">{item.description}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.amount || 0)}</span>
                </div>
              ))}
              
              {/* Discount */}
              {Number(invoice.discount || 0) > 0 && (
                <div className="flex justify-between items-start text-sm pt-2">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-slate-700">-{formatCurrency(invoice.discount || 0)}</span>
                </div>
              )}
              {/* Tax */}
              {Number(invoice.tax || 0) > 0 && (
                <div className="flex justify-between items-start text-sm pt-2">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-700">{formatCurrency(invoice.tax || 0)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-base font-black text-slate-900">{formatCurrency(invoice.total || 0)}</span>
            </div>
          </div>

          {/* Amount Due & Action Buttons */}
          <div className="p-8 bg-slate-50/50">
            <div className="flex items-center justify-between p-4 mb-6 rounded-2xl bg-red-50/50 border border-red-100">
              <span className="font-semibold text-red-900">Amount Due</span>
              <span className="text-xl font-black text-red-600">{formatCurrency(invoice.balance_due || 0)}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
              
              {!isPaid ? (
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Now {formatCurrency(invoice.balance_due || 0)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const toastId = toast.loading("Loading receipt...");
                      const res = await getReceipts({ invoice: invoice.id });
                      const receipts = res?.data || res;
                      if (receipts && receipts.length > 0) {
                        setReceiptId(receipts[0].id);
                        setReceiptModalOpen(true);
                        toast.dismiss(toastId);
                      } else {
                        toast.error("No receipt found.", { id: toastId });
                      }
                    } catch (err) {
                      toast.error(err?.response?.data?.message || err?.message || "Unable to load receipt.");
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-md"
                >
                  View Receipt
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        invoice={invoice}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={(data) => {
          setPaymentModalOpen(false);
          if (data?.receiptId) {
            setReceiptId(data.receiptId);
            setReceiptModalOpen(true);
          }
          loadInvoice();
        }}
      />

      <ReceiptModal
        open={receiptModalOpen}
        receiptId={receiptId}
        onClose={() => {
          setReceiptModalOpen(false);
          setReceiptId(null);
        }}
      />
    </div>
  );
}