import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  CreditCard,
  Pencil,
  Trash2,
  MoreVertical,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Download,
  ArrowRight,
  Receipt,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import invoiceService from "../../../services/invoiceService";
import useSettings from "../../../hooks/useSettings";
import PaymentModal from "../../../components/payments/PaymentModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

export default function InvoiceList() {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Payment Modal
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Delete Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleOpenPay = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentModalOpen(true);
  };

  // =====================================================
  // LOAD INVOICES
  // =====================================================


  const loadInvoices = async () => {
    try {
      setLoading(true);

      const data =
        await invoiceService.getAll();

      setInvoices(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load invoices error:",
        error
      );
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to load invoices"
      );

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

     useEffect(() => {
    loadInvoices();
  }, []);
  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const data =
        await invoiceService.getAll();

      setInvoices(
        Array.isArray(data)
          ? data
          : []
      );

      toast.success(
        "Invoices refreshed"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to refresh invoices"
      );
      
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const normalizeStatus = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  // =====================================================
  // FILTER
  // =====================================================

  const filteredInvoices = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const number =
        String(
          invoice.number ||
          invoice.invoice_number ||
          invoice.invoiceNumber ||
          invoice.id ||
          ""
        ).toLowerCase();

      const client =
        typeof invoice.client ===
          "object"
          ? String(
            invoice.client?.name ||
            invoice.client?.company ||
            ""
          ).toLowerCase()
          : String(
            invoice.client_name ||
            invoice.client ||
            ""
          ).toLowerCase();

      const statusValue =
        normalizeStatus(
          invoice.status
        );

      const matchesSearch =
        !query ||
        number.includes(query) ||
        client.includes(query);

      const matchesStatus =
        status === "All" ||
        statusValue ===
        normalizeStatus(status);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    invoices,
    search,
    status,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalInvoices =
    invoices.length;

  const paidInvoices =
    invoices.filter((invoice) => {
      const current =
        normalizeStatus(
          invoice.status
        );

      return (
        current === "paid" ||
        current === "completed"
      );
    }).length;

  const pendingInvoices =
    invoices.filter((invoice) => {
      const current =
        normalizeStatus(
          invoice.status
        );

      return (
        current === "pending" ||
        current === "unpaid" ||
        current === "sent"
      );
    }).length;

  const overdueInvoices =
    invoices.filter((invoice) => {
      return (
        normalizeStatus(
          invoice.status
        ) === "overdue"
      );
    }).length;

  // =====================================================
  // GET INVOICE NUMBER
  // =====================================================

  const getInvoiceNumber = (
    invoice
  ) => {
    return (
      invoice.number ||
      invoice.invoice_number ||
      invoice.invoiceNumber ||
      `INV-${invoice.id}`
    );
  };

  // =====================================================
  // GET CLIENT
  // =====================================================

  const getClientName = (
    invoice
  ) => {
    if (
      invoice.client &&
      typeof invoice.client ===
      "object"
    ) {
      return (
        invoice.client.name ||
        invoice.client.company ||
        "Unknown Client"
      );
    }

    return (
      invoice.client_name ||
      invoice.client ||
      "Unknown Client"
    );
  };

  // =====================================================
  // GET AMOUNT
  // =====================================================

  const getAmount = (
    invoice
  ) => {
    return (
      invoice.total ||
      invoice.grand_total ||
      invoice.total_amount ||
      invoice.amount ||
      0
    );
  };

  // =====================================================
  // GET DATE
  // =====================================================

  const getInvoiceDate = (
    invoice
  ) => {
    return (
      invoice.invoice_date ||
      invoice.issue_date ||
      invoice.date ||
      invoice.created_at ||
      invoice.createdAt
    );
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (id) => {
    navigate(
      `/admin/invoices/${id}/edit`
    );

    setOpenMenu(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteClick = (id) => {
    const invoiceToDelete = invoices.find(
      (i) => i.id === id || i._id === id
    );
    setDeleteConfirm({
      id,
      invoiceNumber: getInvoiceNumber(invoiceToDelete) || `Invoice #${id}`
    });
    setOpenMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { id, invoiceNumber } = deleteConfirm;

    const toastId = toast.loading(
      "Deleting invoice...",
      {
        position: "top-center",
      }
    );

    try {
      setActionLoading(`delete-${id}`);

      await invoiceService.remove(id);

      toast.success(
        `✅ "${invoiceNumber}" deleted successfully!`,
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );

      await loadInvoices();
    } catch (error) {
      console.error(
        "Delete invoice error:",
        error
      );
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to delete invoice",
        {
          id: toastId,
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const handleDownloadPdf = async (invoice) => {
    try {
      setActionLoading(`pdf-${invoice.id || invoice._id}`);
      const filename = `${getInvoiceNumber(invoice)}.pdf`;
      await invoiceService.pdf(invoice.id || invoice._id, filename);
      toast.success("Invoice PDF downloaded");
      setOpenMenu(null);
    } catch (error) {
      console.error("Invoice PDF error:", error);
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to download invoice PDF"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Loader2
              size={25}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading invoices...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching the latest invoice data
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-200 bg-white">

        <div className="px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-end">

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/invoices/add"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={18} />

                Create Invoice
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:p-8">

        <StatCard
          icon={Receipt}
          title="Total Invoices"
          value={totalInvoices}
          description="All invoices"
        />

        <StatCard
          icon={CheckCircle2}
          title="Paid"
          value={paidInvoices}
          description="Successfully paid"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon={Clock3}
          title="Pending"
          value={pendingInvoices}
          description="Awaiting payment"
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={AlertCircle}
          title="Overdue"
          value={overdueInvoices}
          description="Payment overdue"
          iconClass="bg-red-50 text-red-600"
        />

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="px-4 pb-8 sm:px-6 lg:px-8">

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative w-full sm:max-w-md">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search invoice or client..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />

            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
            >
              <option value="All">
                All Status
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Sent">
                Sent
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Overdue">
                Overdue
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

          </div>


          {/* =================================================
              DESKTOP
          ================================================= */}

          <div className="hidden overflow-x-auto md:block">

            <table className="min-w-full">

              <thead className="bg-slate-50">

                <tr>

                  <TableHead>
                    Invoice
                  </TableHead>

                  <TableHead>
                    Client
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead align="right">
                    Amount
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead align="right">
                    Action
                  </TableHead>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                <AnimatePresence>

                  {filteredInvoices.map(
                    (
                      invoice,
                      index
                    ) => {

                      const id =
                        invoice.id || invoice.invoice_number || `inv-tbl-${index}`;

                      const currentStatus =
                        normalizeStatus(
                          invoice.status
                        );

                      const busy =
                        actionLoading?.endsWith(
                          `-${id}`
                        );

                      return (
                        <motion.tr
                          key={`inv_row_${id}_${index}`}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              index *
                              0.025,
                          }}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Invoice */}

                          <td className="px-6 py-4">

                            <span className="font-bold text-slate-900">
                              {getInvoiceNumber(
                                invoice
                              )}
                            </span>

                          </td>


                          {/* Client */}

                          <td className="px-6 py-4">

                            <p className="font-semibold text-slate-800">
                              {getClientName(
                                invoice
                              )}
                            </p>

                          </td>


                          {/* Date */}

                          <td className="px-6 py-4 text-sm text-slate-500">

                            {formatDate(
                              getInvoiceDate(
                                invoice
                              )
                            )}

                          </td>


                          {/* Amount */}

                          <td className="px-6 py-4 text-right">

                            <p className="font-bold text-slate-900">
                              {formatCurrency(
                                getAmount(
                                  invoice
                                )
                              )}
                            </p>

                          </td>


                          {/* Status */}

                          <td className="px-6 py-4">

                            <StatusBadge
                              status={
                                invoice.status
                              }
                            />

                          </td>


                          {/* Actions */}

                          <td className="px-6 py-4 text-right">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() => handleEdit(id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Edit Invoice"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDeleteClick(id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Delete Invoice"
                              >
                                {busy ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>

                              <div className="relative inline-block ml-2">

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu(openMenu === id ? null : id);
                                  }}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                  {busy ? (
                                    <Loader2
                                      size={18}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <MoreVertical
                                      size={18}
                                    />
                                  )}
                                </button>


                                {openMenu === id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenu(null);
                                      }}
                                    />
                                    <InvoiceActionMenu
                                      onPay={() => {
                                        handleOpenPay(invoice);
                                        setOpenMenu(null);
                                      }}
                                      onEdit={() => {
                                        handleEdit(id);
                                        setOpenMenu(null);
                                      }}
                                      onPdf={() => {
                                        handleDownloadPdf(invoice);
                                        setOpenMenu(null);
                                      }}
                                      onDelete={() => {
                                        handleDeleteClick(id);
                                      }}
                                      status={currentStatus}
                                    />
                                  </>
                                )}
                              </div>

                            </div>

                          </td>

                        </motion.tr>
                      );
                    }
                  )}

                </AnimatePresence>

              </tbody>

            </table>

          </div>


          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="divide-y divide-slate-100 md:hidden">

            {filteredInvoices.map(
              (invoice, idx) => {

                const id =
                  invoice.id || invoice.invoice_number || `inv-mob-${idx}`;

                return (
                  <div
                    key={`inv_mob_${id}_${idx}`}
                    className="p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <span className="font-bold text-slate-900">
                          {getInvoiceNumber(
                            invoice
                          )}
                        </span>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {getClientName(
                            invoice
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            getInvoiceDate(
                              invoice
                            )
                          )}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          invoice.status
                        }
                      />

                    </div>


                    <div className="mt-4 flex items-end justify-between">

                      <div>

                        <p className="text-xs text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {formatCurrency(
                            getAmount(
                              invoice
                            )
                          )}
                        </p>

                      </div>


                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              id
                            )
                          }
                          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800"
                        >
                          <Pencil
                            size={17}
                          />
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>


          {/* EMPTY */}

          {filteredInvoices.length ===
            0 && (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Receipt size={25} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  {invoices.length === 0
                    ? "No invoices yet"
                    : "No invoices found"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {invoices.length === 0
                    ? "Create your first invoice to get started."
                    : "Try changing your search or status filter."}
                </p>

                {invoices.length ===
                  0 && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/admin/invoices/add"
                        )
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <Plus size={17} />
                      Create Invoice
                    </button>
                  )}

              </div>
            )}

        </div>

      </div>

      <PaymentModal
        open={paymentModalOpen}
        invoice={paymentInvoice}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentInvoice(null);
        }}
        onPaymentSuccess={(data) => {
          setPaymentModalOpen(false);
          setPaymentInvoice(null);
          loadInvoices();
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        type="danger"
        itemName={deleteConfirm?.invoiceNumber}
        loading={actionLoading?.startsWith('delete-')}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Permanently"
      />
    </div>
  );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  iconClass =
  "bg-slate-100 text-slate-700",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {title}
        </span>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      )}
    </motion.div>
  );
}


// =====================================================
// TABLE HEADER
// =====================================================

function TableHead({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 ${align ===
        "right"
        ? "text-right"
        : "text-left"
        }`}
    >
      {children}
    </th>
  );
}


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const normalized =
    String(status || "")
      .toLowerCase();

  const config = {
    paid: {
      label: "Paid",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    partially_paid: {
      label: "Partial",
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    pending: {
      label: "Pending",
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    sent: {
      label: "Sent",
      icon: ArrowRight,
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    },

    overdue: {
      label: "Overdue",
      icon: AlertCircle,
      className:
        "bg-red-50 text-red-700 border-red-200",
    },

    draft: {
      label: "Draft",
      icon: Receipt,
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
    },

    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
  };

  const current =
    config[normalized] || {
      label:
        status || "Unknown",
      icon: Clock3,
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
    };

  const Icon =
    current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${current.className}`}
    >
      <Icon size={13} />

      {current.label}
    </span>
  );
}


// =====================================================
// ACTION MENU
// =====================================================

function InvoiceActionMenu({
  onPay,
  onEdit,
  onPdf,
  onDelete,
  status,
}) {
  const isPaid = String(status || "").toLowerCase() === "paid" || String(status || "").toLowerCase() === "completed";

  return (
    <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">

      {!isPaid && onPay && (
        <ActionButton
          icon={CreditCard}
          label="Pay Invoice"
          onClick={onPay}
        />
      )}

      <ActionButton
        icon={Pencil}
        label="Edit Invoice"
        onClick={onEdit}
      />

      <ActionButton
        icon={Download}
        label="Download PDF"
        onClick={onPdf}
      />

      <div className="my-1 border-t border-slate-100" />

      <ActionButton
        icon={Trash2}
        label="Delete Invoice"
        onClick={onDelete}
        danger
      />

    </div>
  );
}


// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${danger
        ? "text-red-600 hover:bg-red-50"
        : "text-slate-700 hover:bg-slate-50"
        }`}
    >
      <Icon size={16} />

      {label}
    </button>
  );
}