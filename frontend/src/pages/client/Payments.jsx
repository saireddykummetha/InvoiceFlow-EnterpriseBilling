import  { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Loader2,
  Smartphone,
  Building2,
  Banknote,
  ShieldCheck,
  FileText,
  Download,
  Copy,
  Check,
  Search,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { downloadReceiptPdf } from "../../api/receipts";
import useSettings from "../../hooks/useSettings";
import ReceiptModal from "../../components/payments/ReceiptModal";

const methodConfig = {
  upi: {
    label: "Dynamic UPI",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Smartphone,
  },
  card: {
    label: "Credit / Debit Card",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: CreditCard,
  },
  bank: {
    label: "Bank Wire (IMPS/NEFT)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Building2,
  },
  cash: {
    label: "Cash Counter Voucher",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Banknote,
  },
  online: {
    label: "Online Gateway",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: ShieldCheck,
  },
};

export default function Payments() {
  const { formatCurrency, formatDate } = useSettings();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedTxn, setCopiedTxn] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

 

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/payments/");
      const list = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setPayments(list);
    } catch (error) {
      console.error("Payments load error:", error);
      toast.error("Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  };

     useEffect(() => {
    loadPayments();
  }, []);

  const copyTxn = (txn) => {
    if (!txn) return;
    navigator.clipboard.writeText(txn);
    setCopiedTxn(txn);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  const handleDownload = async (payment) => {
    const rId = payment.receipt?.id || payment.receipt_id || payment.id;
    if (!rId) return;
    try {
      setDownloadingId(rId);
      await downloadReceiptPdf(rId, `Receipt_${payment.invoice_number || payment.id}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not download receipt.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) => {
      const inv = String(p.invoice_number || p.invoice?.invoice_number || "").toLowerCase();
      const m = String(p.method || "").toLowerCase();
      const txn = String(p.transaction_id || p.gateway_payment_id || "").toLowerCase();
      return inv.includes(q) || m.includes(q) || txn.includes(q);
    });
  }, [payments, search]);

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Payment & Settlement History
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500">
              View your payment transactions and download authorized digital receipts and vouchers.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice, UTR..."
              className="w-full h-10 rounded-xl bg-white border border-slate-200 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* PAYMENTS TABLE CARD */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <CreditCard className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No payment records found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Any successful invoices paid via Dynamic UPI, Cards, Bank Wire, or Cash Counter will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-4">Transaction / Receipt</th>
                    <th className="px-5 py-4">Invoice #</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Settled At</th>
                    <th className="px-5 py-4 text-right">Receipt</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((payment) => {
                    const m = String(payment.method || "online").toLowerCase();
                    const config = methodConfig[m] || methodConfig.online;
                    const Icon = config.icon;
                    const txn = payment.transaction_id || payment.gateway_payment_id || "";

                    return (
                      <tr key={payment.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-4">
                          <p className="font-mono font-bold text-slate-900">
                            {payment.receipt_number ? payment.receipt_number : `PAY-${payment.id}`}
                          </p>
                          {txn && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[130px]">
                                {txn}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyTxn(txn)}
                                className="text-slate-400 hover:text-indigo-600 transition"
                                title="Copy Transaction ID"
                              >
                                {copiedTxn === txn ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-700">
                          {payment.invoice_number || payment.invoice?.invoice_number || `#${payment.invoice}`}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${config.badge}`}>
                            <Icon size={12} />
                            {config.label}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-slate-900 text-sm">
                          {formatCurrency(Number(payment.amount || 0))}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={11} />
                            {payment.status || "Paid"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-500">
                          {formatDate(payment.paid_at || payment.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const rId = payment.receipt?.id || payment.receipt_id || payment.id;
                                setSelectedReceiptId(rId);
                                setReceiptModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                              title="View Receipt"
                            >
                              <FileText size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={downloadingId === (payment.receipt?.id || payment.receipt_id || payment.id)}
                              onClick={() => handleDownload(payment)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition disabled:opacity-50"
                              title="Download PDF Receipt Voucher"
                            >
                              {downloadingId === (payment.receipt?.id || payment.receipt_id || payment.id) ? (
                                <Loader2 size={15} className="animate-spin text-emerald-600" />
                              ) : (
                                <Download size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        open={receiptModalOpen}
        receiptId={selectedReceiptId}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedReceiptId(null);
        }}
      />
    </div>
  );
}