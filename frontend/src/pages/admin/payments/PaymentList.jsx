import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  CreditCard,
  Plus,
  Trash2,
  FileText,
  Smartphone,
  Building2,
  Banknote,
  ShieldCheck,
  Copy,
  Check,
  ArrowUpRight,
  Filter,
  FileDown,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../../components/layout/PageHeader";
import paymentService from "../../../services/paymentService";
import { downloadReceiptPdf } from "../../../api/receipts";
import ManualPaymentModal from "../../../components/payments/ManualPaymentModal";
import ReceiptModal from "../../../components/payments/ReceiptModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import useSettings from "../../../hooks/useSettings";

// =========================================================
// HELPERS
// =========================================================

const getPaymentId = (payment) =>
  payment.id ||
  payment.payment_id ||
  payment.paymentId;

const getInvoiceNumber = (payment) =>
  payment.invoice?.invoice_number ||
  payment.invoice?.number ||
  payment.invoice_number ||
  payment.invoiceNumber ||
  (payment.invoice ? `#${payment.invoice}` : "—");

const getCustomerName = (payment) =>
  payment.client?.name ||
  payment.client?.client_name ||
  payment.customer?.name ||
  payment.client_name ||
  payment.customer_name ||
  payment.customer ||
  payment.invoice?.client?.name ||
  payment.invoice?.client_name ||
  "—";

const getAmount = (payment) =>
  Number(payment.amount ?? payment.paid_amount ?? payment.total ?? 0);

const getStatus = (payment) => {
  const status =
    payment.status ||
    payment.payment_status ||
    "";

  return String(status).toLowerCase();
};

const getMethod = (payment) => {
  const method =
    payment.payment_method ||
    payment.method ||
    "online";

  return String(method).toLowerCase();
};

const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.results)) {
    return response.results;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.payments)) {
    return response.payments;
  }
  return [];
};

// =========================================================
// STATUS CONFIG
// =========================================================

const statusConfig = {
  success: {
    label: "Success",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    icon: CheckCircle2,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    icon: Clock3,
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    icon: RotateCcw,
  },
};

// =========================================================
// PAYMENT METHOD CONFIG
// =========================================================

const methodConfig = {
  upi: {
    label: "Dynamic UPI",
    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    icon: Smartphone,
  },
  card: {
    label: "Credit / Debit Card",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    icon: CreditCard,
  },
  bank: {
    label: "Bank Wire (IMPS/NEFT)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    icon: Building2,
  },
  cash: {
    label: "Cash Counter Voucher",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    icon: Banknote,
  },
  online: {
    label: "Online Gateway",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    icon: ShieldCheck,
  },
  razorpay: {
    label: "Razorpay Gateway",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    icon: ShieldCheck,
  },
  cheque: {
    label: "Cheque / DD",
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    icon: FileText,
  },
};

// =========================================================
// COMPONENT
// =========================================================

export default function PaymentList() {
  const { formatCurrency, formatDate } = useSettings();
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedMethodFilter, setSelectedMethodFilter] = useState("all");
  const [copiedTxn, setCopiedTxn] = useState(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [cleanPendingConfirm, setCleanPendingConfirm] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAll({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });
      setPayments(normalizeList(response));
    } catch (error) {
      console.error("Load payments error:", error);
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [status]);

  // Client-side search & method filtering
  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      // 1. Status filter
      if (status !== "all" && getStatus(payment) !== status) {
        return false;
      }

      // 2. Method filter
      if (selectedMethodFilter !== "all") {
        const m = getMethod(payment);
        if (selectedMethodFilter === "upi" && m !== "upi") return false;
        if (selectedMethodFilter === "card" && m !== "card") return false;
        if (selectedMethodFilter === "bank" && m !== "bank" && m !== "netbanking") return false;
        if (selectedMethodFilter === "cash" && m !== "cash") return false;
        if (selectedMethodFilter === "online" && m !== "online" && m !== "razorpay") return false;
      }

      // 3. Search query
      if (!query) return true;

      const paymentId = String(getPaymentId(payment) || "").toLowerCase();
      const invoice = String(getInvoiceNumber(payment) || "").toLowerCase();
      const customer = String(getCustomerName(payment) || "").toLowerCase();
      const methodStr = String(getMethod(payment) || "").toLowerCase();
      const transaction = String(
        payment.transaction_id ||
        payment.transactionId ||
        payment.razorpay_payment_id ||
        payment.gateway_payment_id ||
        ""
      ).toLowerCase();

      return (
        paymentId.includes(query) ||
        invoice.includes(query) ||
        customer.includes(query) ||
        methodStr.includes(query) ||
        transaction.includes(query)
      );
    });
  }, [payments, search, status, selectedMethodFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Statistics Breakdown
  const stats = useMemo(() => {
    let totalReceived = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let bankTotal = 0;
    let cashTotal = 0;

    payments.forEach((payment) => {
      const value = getAmount(payment);
      const currentStatus = getStatus(payment);
      const m = getMethod(payment);

      if (["success", "paid", "completed"].includes(currentStatus)) {
        totalReceived += value;

        if (m === "upi") upiTotal += value;
        else if (m === "card") cardTotal += value;
        else if (m === "bank" || m === "netbanking") bankTotal += value;
        else if (m === "cash") cashTotal += value;
      }
    });

    return {
      totalReceived,
      upiTotal,
      cardTotal,
      bankTotal,
      cashTotal,
      totalTransactions: payments.length,
    };
  }, [payments]);

  // Copy Transaction reference / UTR
  const copyTransactionId = (txnId) => {
    if (!txnId) return;
    navigator.clipboard.writeText(txnId);
    setCopiedTxn(txnId);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  // Direct PDF Receipt Download
  const handleDownloadReceiptPdf = async (payment) => {
    const rId = payment.receipt?.id || payment.receipt_id || payment.id;
    if (!rId) {
      toast.error("Receipt ID not found.");
      return;
    }
    try {
      setDownloadingReceiptId(rId);
      await downloadReceiptPdf(rId, `Receipt_${payment.invoice_number || payment.id}.pdf`);
      toast.success("Receipt PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not download receipt PDF.");
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  // Export CSV
  const exportPayments = () => {
    if (!filteredPayments.length) {
      toast.error("No payments available to export");
      return;
    }

    const headers = [
      "Payment ID",
      "Invoice",
      "Customer",
      "Amount",
      "Status",
      "Method",
      "Transaction ID / UTR",
      "Date",
    ];

    const rows = filteredPayments.map((payment) => [
      `PAY-${getPaymentId(payment)}`,
      getInvoiceNumber(payment),
      getCustomerName(payment),
      getAmount(payment),
      getStatus(payment),
      getMethod(payment),
      payment.transaction_id || payment.transactionId || payment.razorpay_payment_id || payment.gateway_payment_id || "—",
      payment.paid_at || payment.created_at || payment.date || "—",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Payments exported successfully");
  };

  // Confirm pending payment
  const [confirmingId, setConfirmingId] = useState(null);
  const [cleaningPending, setCleaningPending] = useState(false);

  const pendingCount = useMemo(() => {
    return payments.filter((p) => getStatus(p) === "pending").length;
  }, [payments]);

  const handleConfirmPayment = async (payment) => {
    const pId = getPaymentId(payment);
    try {
      setConfirmingId(pId);
      const res = await paymentService.confirm(pId);
      toast.success(res?.message || "Payment marked as SUCCESS and receipt generated!");
      loadPayments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCleanPending = async () => {
    setCleanPendingConfirm(true);
  };

  const handleCleanPendingConfirm = async () => {
    try {
      setCleaningPending(true);
      const toastId = toast.loading("Cleaning pending records...", {
        position: "top-center",
      });
      const res = await paymentService.cleanPending();
      toast.success(
        res?.message || "Cleaned pending records successfully!",
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      loadPayments();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to clean pending records",
        {
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setCleaningPending(false);
      setCleanPendingConfirm(false);
    }
  };

  const handleCleanPendingCancel = () => {
    setCleanPendingConfirm(false);
  };

  // Delete payment
  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      setDeleting(true);
      await paymentService.delete(getPaymentId(paymentToDelete));
      setPayments((current) =>
        current.filter((p) => getPaymentId(p) !== getPaymentId(paymentToDelete))
      );
      toast.success("Payment record deleted and invoice balance reconciled");
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Delete payment error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to delete payment record"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* =================================================
          HEADER & ACTIONS
      ================================================= */}
      <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setManualModalOpen(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-md shadow-slate-950/20 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            <Plus size={16} />
            Record Payment
          </button>
        </div>

      {/* =================================================
          REAL-TIME STATS CARDS (5 METRICS)
      ================================================= */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Collected"
          value={formatCurrency(stats.totalReceived)}
          subtitle="Net Settled Revenue"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          title="Dynamic UPI"
          value={formatCurrency(stats.upiTotal)}
          subtitle="Scan & App Intents"
          icon={Smartphone}
          iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
        />
        <StatCard
          title="Cards & POS"
          value={formatCurrency(stats.cardTotal)}
          subtitle="3D Secure & POS"
          icon={CreditCard}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
        <StatCard
          title="Bank Wire / NEFT"
          value={formatCurrency(stats.bankTotal)}
          subtitle="Direct Account Transfers"
          icon={Building2}
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <StatCard
          title="Cash Counter"
          value={formatCurrency(stats.cashTotal)}
          subtitle="Signed Vouchers"
          icon={Banknote}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </div>

      {/* =================================================
          TABLE CONTAINER & MULTI-DIMENSIONAL FILTERS
      ================================================= */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* FILTERS TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payment ID, UTR, Invoice, Customer..."
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* METHOD & STATUS DROPDOWNS & EXPORT */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* METHOD SELECTOR */}
            <select
              value={selectedMethodFilter}
              onChange={(e) => setSelectedMethodFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="all">💳 All Methods</option>
              <option value="upi">📱 Dynamic UPI</option>
              <option value="card">💳 Credit / Debit Cards</option>
              <option value="bank">🏦 Bank Wire / NEFT</option>
              <option value="cash">💵 Cash Counter Voucher</option>
              <option value="online">🛡️ Online Gateway</option>
            </select>

            {/* STATUS SELECTOR */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="all">⚡ All Status</option>
              <option value="success">Success / Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* EXPORT CSV */}
            <button
              type="button"
              onClick={exportPayments}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <Download size={14} />
              Export CSV
            </button>

            {/* CLEAN PENDING / ABANDONED ATTEMPTS */}
            {pendingCount > 0 && (
              <button
                type="button"
                disabled={cleaningPending}
                onClick={handleCleanPending}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-sm"
                title="Remove uncompleted pending checkout orders"
              >
                {cleaningPending ? (
                  <Loader2 size={14} className="animate-spin text-amber-700" />
                ) : (
                  <Trash2 size={14} className="text-amber-700" />
                )}
                <span>Clean {pendingCount} Abandoned Orders</span>
              </button>
            )}
          </div>
        </div>

        {/* LOADING & TABLE CONTENT */}
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-indigo-500"
              />
              <p className="mt-3 text-xs font-bold text-slate-500">Loading settlements & payments...</p>
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-slate-800 dark:text-indigo-400">
              <CreditCard size={25} />
            </div>
            <h3 className="mt-4 font-bold text-slate-900 dark:text-slate-100">
              No payments matched
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Try adjusting your search query, status filters, or record a new manual payment above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left dark:border-slate-800 dark:bg-slate-800/40">
                  <TableHead>Payment & Ref</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Settlement Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settled Date</TableHead>
                  <TableHead textRight>Actions</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedPayments.map((payment, index) => {
                  const paymentId = getPaymentId(payment);
                  const statusVal = getStatus(payment);
                  const methodVal = getMethod(payment);
                  const txnId =
                    payment.transaction_id ||
                    payment.transactionId ||
                    payment.razorpay_payment_id ||
                    payment.gateway_payment_id ||
                    "";

                  return (
                    <tr
                      key={`pay_row_${paymentId || index}_${index}`}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition dark:border-slate-800 dark:hover:bg-slate-800/30"
                    >
                      {/* PAYMENT ID & UTR */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs font-black text-slate-900 dark:text-slate-100">
                            PAY-{paymentId}
                          </p>
                          {payment.receipt_number && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              {payment.receipt_number}
                            </span>
                          )}
                        </div>

                        {txnId ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                              {txnId}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyTransactionId(txnId)}
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                              title="Copy UTR / Transaction ID"
                            >
                              {copiedTxn === txnId ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-slate-400 italic">
                            Direct Counter Settlement
                          </p>
                        )}
                      </td>

                      {/* INVOICE NUMBER */}
                      <td className="px-5 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {getInvoiceNumber(payment)}
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {getCustomerName(payment)}
                        </p>
                      </td>

                      {/* PAYMENT METHOD BADGE */}
                      <td className="px-5 py-4">
                        <MethodBadge method={methodVal} />
                      </td>

                      {/* AMOUNT */}
                      <td className="px-5 py-4 text-sm font-black text-slate-900 dark:text-slate-100">
                        {formatCurrency(getAmount(payment))}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="px-5 py-4">
                        <StatusBadge status={statusVal} />
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {formatDate(payment.paid_at || payment.created_at || payment.date)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* CONFIRM PENDING PAYMENT */}
                          {statusVal === "pending" && (
                            <button
                              type="button"
                              disabled={confirmingId === paymentId}
                              onClick={() => handleConfirmPayment(payment)}
                              className="flex h-8 items-center gap-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 text-xs font-bold shadow-sm disabled:opacity-50"
                              title="Mark as Received & Issue Receipt"
                            >
                              {confirmingId === paymentId ? (
                                <Loader2 size={13} className="animate-spin text-emerald-700" />
                              ) : (
                                <CheckCircle2 size={13} className="text-emerald-700" />
                              )}
                              <span>Approve</span>
                            </button>
                          )}

                          {/* VIEW RECEIPT DETAILS */}
                          {statusVal !== "pending" && (
                            <button
                              type="button"
                              onClick={() => {
                                const rId = payment.receipt?.id || payment.receipt_id || paymentId;
                                setSelectedReceiptId(rId);
                                setReceiptModalOpen(true);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition dark:hover:bg-slate-800 dark:text-slate-400"
                              title="View Receipt Summary"
                            >
                              <FileText size={15} />
                            </button>
                          )}

                          {/* 1-CLICK PDF DOWNLOAD */}
                          {statusVal !== "pending" && (
                            <button
                              type="button"
                              disabled={downloadingReceiptId === (payment.receipt?.id || payment.receipt_id || paymentId)}
                              onClick={() => handleDownloadReceiptPdf(payment)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition dark:hover:bg-slate-800 dark:text-slate-400 disabled:opacity-50"
                              title="Download Signed PDF Receipt Voucher"
                            >
                              {downloadingReceiptId === (payment.receipt?.id || payment.receipt_id || paymentId) ? (
                                <Loader2 size={14} className="animate-spin text-emerald-600" />
                              ) : (
                                <Download size={15} />
                              )}
                            </button>
                          )}

                          {/* DELETE & REVERT */}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentToDelete(payment);
                              setDeleteModalOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-500/10"
                            title="Delete Payment Record"
                          >
                            <Trash2 size={15} />
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

        {/* PAGINATION - Bottom Right */}
        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          RECORD PAYMENT MODAL
      ====================================================== */}
      <ManualPaymentModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSuccess={() => loadPayments()}
      />

      {/* ======================================================
          RECEIPT MODAL
      ====================================================== */}
      <ReceiptModal
        open={receiptModalOpen}
        receiptId={selectedReceiptId}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedReceiptId(null);
        }}
      />

      {/* ======================================================
          DELETE CONFIRM MODAL
      ====================================================== */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Revert & Delete Payment"
        message="Are you sure you want to delete this payment record? The associated invoice balance will automatically be updated and reconciled."
        itemName={`Payment PAY-${getPaymentId(paymentToDelete || {})}`}
        loading={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setPaymentToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={cleanPendingConfirm}
        title="Clean Pending Records"
        message="Are you sure you want to clean all uncompleted/abandoned pending checkout attempts?"
        type="warning"
        loading={cleaningPending}
        onClose={handleCleanPendingCancel}
        onConfirm={handleCleanPendingConfirm}
        confirmText="Clean Records"
      />
    </motion.div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${iconClass}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function TableHead({ children, textRight = false }) {
  return (
    <th
      className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
        textRight ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function MethodBadge({ method }) {
  const config = methodConfig[method] || {
    label: method ? method.toUpperCase() : "Online",
    badge: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    icon: ShieldCheck,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${config.badge}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
    className: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    icon: Clock3,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.className}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}