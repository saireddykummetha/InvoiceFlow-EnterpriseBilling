import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  FileText,
  Eye,
  Pencil,
  CheckCircle2,
  Clock3,
  XCircle,
  MoreVertical,
  ArrowRight,
  RefreshCw,
  RefreshCcw,
  Loader2,
  Receipt,
  Download,
  Printer,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import quoteService from "../../../services/quoteService";
import useSettings from "../../../hooks/useSettings";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

export default function QuoteList() {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  // =====================================================
  // STATE
  // =====================================================

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // =====================================================
  // LOAD QUOTES
  // =====================================================

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);

      const data =
        await quoteService.getAll();

      setQuotes(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Load quotes error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to load quotes"
      );

      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const data =
        await quoteService.getAll();

      setQuotes(
        Array.isArray(data)
          ? data
          : []
      );

      toast.success("Quotes refreshed");
    } catch (error) {
      console.error(
        "Refresh quotes error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to refresh quotes"
      );
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const normalizeStatus = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  };

  // =====================================================
  // FILTER QUOTES
  // =====================================================

  const filteredQuotes = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const number = String(
        quote.number ||
        quote.quote_number ||
        quote.quoteNumber ||
        quote.id ||
        ""
      ).toLowerCase();

      const client =
        typeof quote.client === "object"
          ? String(
            quote.client?.name ||
            quote.client?.company_name ||
            ""
          ).toLowerCase()
          : String(
            quote.client ||
            quote.client_name ||
            ""
          ).toLowerCase();

      const email =
        typeof quote.client === "object"
          ? String(
            quote.client?.email || ""
          ).toLowerCase()
          : String(
            quote.email ||
            quote.client_email ||
            ""
          ).toLowerCase();

      const description = String(
        quote.title ||
        quote.description ||
        quote.subject ||
        ""
      ).toLowerCase();

      const quoteStatus =
        normalizeStatus(
          quote.status
        );

      const matchesSearch =
        !query ||
        number.includes(query) ||
        client.includes(query) ||
        email.includes(query) ||
        description.includes(query);

      const selectedStatus =
        normalizeStatus(status);

      const matchesStatus =
        status === "All" ||
        quoteStatus === selectedStatus;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [quotes, search, status]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalQuotes = quotes.length;

  const pendingQuotes =
    quotes.filter((quote) => {
      const current =
        normalizeStatus(quote.status);

      return (
        current === "pending" ||
        current === "sent" ||
        current === "draft"
      );
    }).length;

  const approvedQuotes =
    quotes.filter((quote) => {
      const current =
        normalizeStatus(quote.status);

      return (
        current === "approved" ||
        current === "accepted"
      );
    }).length;

  const rejectedQuotes =
    quotes.filter((quote) => {
      const current =
        normalizeStatus(quote.status);

      return (
        current === "rejected" ||
        current === "declined"
      );
    }).length;

  // =====================================================
  // GET QUOTE NUMBER
  // =====================================================

  const getQuoteNumber = (quote) => {
    return (
      quote.number ||
      quote.quote_number ||
      quote.quoteNumber ||
      `QT-${quote.id}`
    );
  };

  // =====================================================
  // GET CLIENT NAME
  // =====================================================

  const getClientName = (quote) => {
    if (
      quote.client &&
      typeof quote.client === "object"
    ) {
      return (
        quote.client.name ||
        quote.client.company_name ||
        quote.client.company ||
        "Unknown Client"
      );
    }

    return (
      quote.client_name ||
      quote.client ||
      "Unknown Client"
    );
  };

  // =====================================================
  // GET CLIENT EMAIL
  // =====================================================

  const getClientEmail = (quote) => {
    if (
      quote.client &&
      typeof quote.client === "object"
    ) {
      return (
        quote.client.email ||
        ""
      );
    }

    return (
      quote.client_email ||
      quote.email ||
      ""
    );
  };

  // =====================================================
  // GET DESCRIPTION
  // =====================================================

  const getDescription = (quote) => {
    return (
      quote.title ||
      quote.description ||
      quote.subject ||
      "Quotation"
    );
  };

  // =====================================================
  // GET AMOUNT
  // =====================================================

  const getAmount = (quote) => {
    return (
      quote.total ||
      quote.grand_total ||
      quote.total_amount ||
      quote.amount ||
      0
    );
  };

  // =====================================================
  // GET DATE
  // =====================================================

  const getQuoteDate = (quote) => {
    return (
      quote.date ||
      quote.issue_date ||
      quote.quote_date ||
      quote.created_at
    );
  };

  // =====================================================
  // GET EXPIRY
  // =====================================================

  const getExpiryDate = (quote) => {
    return (
      quote.expiry_date ||
      quote.expiry ||
      quote.valid_until ||
      quote.validity_date
    );
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleView = (id) => {
    navigate(
      `/admin/quotes/${id}`
    );
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (id) => {
    navigate(
      `/admin/quotes/${id}/edit`
    );
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const handleDownloadPdf = async (quote) => {
    if (!quote?.id) return;
    const toastId = toast.loading("Generating quote PDF...");
    try {
      const blob = await quoteService.pdf(quote.id);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `quote-${quote.quote_number || quote.id}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Quotation PDF downloaded", { id: toastId });
    } catch (err) {
      console.error("Download quote PDF error:", err);
      toast.error("Unable to download quote PDF", { id: toastId });
    }
  };

  // =====================================================
  // DELETE QUOTE
  // =====================================================

  const handleDeleteClick = (quoteId) => {
    const quoteToDelete = quotes.find(
      (q) => q.id === quoteId || q._id === quoteId
    );
    setDeleteConfirm({
      id: quoteId,
      quoteNumber: quoteToDelete?.quote_number || quoteToDelete?.number || `Quote #${quoteId}`
    });
    setOpenMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { id, quoteNumber } = deleteConfirm;

    const toastId = toast.loading(
      "Deleting quotation...",
      {
        position: "top-center",
      }
    );

    try {
      setActionLoading(id);
      await quoteService.delete(id);
      toast.success(
        `✅ "${quoteNumber}" deleted successfully!`,
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      setQuotes((prev) => prev.filter((q) => q.id !== id && q._id !== id));
    } catch (err) {
      console.error("Delete quote error:", err);
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete quotation",
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
  // APPROVE
  // =====================================================

  const handleApprove = async (id) => {
    try {
      setActionLoading(`approve-${id}`);
      await quoteService.approve(id);
      toast.success("Quotation approved successfully");
      setOpenMenu(null);
      await loadQuotes();
    } catch (error) {
      console.error("Approve quote error:", error);
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to approve quotation"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = async (id) => {
    try {
      setActionLoading(
        `reject-${id}`
      );

      await quoteService.reject(id);

      toast.success(
        "Quotation rejected"
      );

      setOpenMenu(null);

      await loadQuotes();
    } catch (error) {
      console.error(
        "Reject quote error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to reject quotation"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // CONVERT TO INVOICE
  // =====================================================

  const handleConvertToInvoice =
    async (id) => {
      try {
        setActionLoading(
          `convert-${id}`
        );

        const invoice =
          await quoteService.convertToInvoice(
            id
          );

        toast.success(
          "Quotation converted to invoice"
        );

        setOpenMenu(null);

        if (invoice?.id) {
          navigate(
            `/admin/invoices/${invoice.id}`
          );
        } else {
          await loadQuotes();
        }
      } catch (error) {
        console.error(
          "Convert quote error:",
          error
        );

        toast.error(
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Unable to convert quotation"
        );
      } finally {
        setActionLoading(null);
      }
    };

  // =====================================================
  // SYNC INVOICE FROM QUOTE
  // =====================================================

  const handleSyncInvoice = async (id) => {
    try {
      setActionLoading(`sync-${id}`);
      const invoice = await quoteService.syncInvoice(id);
      toast.success(
        `Invoice ${invoice?.invoice_number || ""} updated with latest quote amounts!`
      );
      setOpenMenu(null);
      await loadQuotes();
    } catch (error) {
      console.error("Sync invoice error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to sync invoice from quote"
      );
    } finally {
      setActionLoading(null);
    }
  };
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Loader2
                size={22}
                className="animate-spin"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading quotations...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching the latest data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-200 bg-white">

        <div className="px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-end">

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                    "/admin/quotes/add"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
              >
                <Plus size={18} />

                Create Quotation
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:p-8">

        <StatCard
          icon={FileText}
          title="Total Quotes"
          value={totalQuotes}
          description="All quotations"
        />

        <StatCard
          icon={Clock3}
          title="Pending"
          value={pendingQuotes}
          description="Awaiting response"
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={CheckCircle2}
          title="Approved"
          value={approvedQuotes}
          description="Successfully approved"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon={XCircle}
          title="Rejected"
          value={rejectedQuotes}
          description="Rejected quotations"
          iconClass="bg-red-50 text-red-600"
        />

      </div>


      {/* =================================================
          MAIN TABLE
      ================================================= */}

      <div className="px-4 pb-8 sm:px-6 lg:px-8">

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative w-full sm:max-w-md">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search quotation, client or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />

            </div>

            <div className="flex gap-2">

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>

              </select>

            </div>

          </div>


          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-x-auto md:block">

            <table className="min-w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Quote
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Expiry
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                <AnimatePresence mode="popLayout">

                  {filteredQuotes.map(
                    (quote, index) => {

                      const quoteId =
                        quote.id;

                      const currentStatus =
                        normalizeStatus(
                          quote.status
                        );

                      const isActionLoading =
                        actionLoading?.endsWith(
                          `-${quoteId}`
                        );

                      return (
                        <motion.tr
                          key={`quo_row_${quoteId || index}_${index}`}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          transition={{
                            delay:
                              index *
                              0.025,
                          }}
                          className="group transition hover:bg-slate-50"
                        >

                          {/* Quote */}

                          <td className="px-6 py-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  quoteId
                                )
                              }
                              className="font-bold text-slate-900 transition hover:text-blue-600"
                            >
                              {getQuoteNumber(
                                quote
                              )}
                            </button>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                getQuoteDate(
                                  quote
                                )
                              )}
                            </p>

                          </td>


                          {/* Client */}

                          <td className="px-6 py-4">

                            <p className="font-semibold text-slate-800">
                              {getClientName(
                                quote
                              )}
                            </p>

                            {getClientEmail(
                              quote
                            ) && (
                                <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                                  {getClientEmail(
                                    quote
                                  )}
                                </p>
                              )}

                          </td>


                          {/* Description */}

                          <td className="px-6 py-4">

                            <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                              {getDescription(
                                quote
                              )}
                            </p>

                          </td>


                          {/* Amount */}

                          <td className="px-6 py-4 text-right">

                            <span className="font-bold text-slate-900">
                              {formatCurrency(
                                getAmount(
                                  quote
                                )
                              )}
                            </span>

                          </td>


                          {/* Expiry */}

                          <td className="px-6 py-4">

                            <p className="text-sm text-slate-600">
                              {formatDate(
                                getExpiryDate(
                                  quote
                                )
                              )}
                            </p>

                          </td>


                          {/* Status */}

                          <td className="px-6 py-4">

                            <StatusBadge
                              status={
                                quote.status
                              }
                            />

                          </td>


                          {/* Actions */}

                          <td className="px-6 py-4 text-right">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() => setPreviewQuote(quote)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                title="Quick Preview (Live Template)"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleView(quoteId)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="View Details"
                              >
                                <FileText size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEdit(quoteId)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Edit Quote"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(quote)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Download PDF"
                              >
                                <Download size={16} />
                              </button>

                              <div className="relative inline-block ml-2">

                                <button
                                  type="button"
                                  disabled={
                                    isActionLoading
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu(
                                      openMenu ===
                                        quoteId
                                        ? null
                                        : quoteId
                                    );
                                  }}
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                  {isActionLoading ? (
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


                                {openMenu ===
                                  quoteId && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-20"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenu(null);
                                        }}
                                      />
                                      <ActionMenu
                                        quote={quote}
                                        status={
                                          currentStatus
                                        }
                                        onPreview={() => {
                                          setPreviewQuote(quote);
                                          setOpenMenu(null);
                                        }}
                                        onPdf={() => {
                                          handleDownloadPdf(quote);
                                          setOpenMenu(null);
                                        }}
                                        onView={() => {
                                          handleView(
                                            quoteId
                                          );
                                          setOpenMenu(
                                            null
                                          );
                                        }}
                                        onEdit={() => {
                                          handleEdit(
                                            quoteId
                                          );
                                          setOpenMenu(
                                            null
                                          );
                                        }}
                                        onDelete={() => {
                                          handleDeleteClick(quoteId);
                                        }}
                                        onApprove={() => {
                                          handleApprove(
                                            quoteId
                                          );
                                          setOpenMenu(null);
                                        }}
                                        onReject={() => {
                                          handleReject(
                                            quoteId
                                          );
                                          setOpenMenu(null);
                                        }}
                                        onConvert={() => {
                                          handleConvertToInvoice(
                                            quoteId
                                          );
                                          setOpenMenu(null);
                                        }}
                                        onSyncInvoice={(id) => {
                                          handleSyncInvoice(id);
                                          setOpenMenu(null);
                                        }}
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

            {filteredQuotes.map(
              (quote, index) => {

                const quoteId =
                  quote.id;

                const currentStatus =
                  normalizeStatus(
                    quote.status
                  );

                return (
                  <motion.div
                    key={`quo_mob_${quoteId || index}_${index}`}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay:
                        index * 0.03,
                    }}
                    className="p-4 transition hover:bg-slate-50"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <button
                          type="button"
                          onClick={() =>
                            handleView(
                              quoteId
                            )
                          }
                          className="font-bold text-slate-900"
                        >
                          {getQuoteNumber(
                            quote
                          )}
                        </button>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                          {getClientName(
                            quote
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            getQuoteDate(
                              quote
                            )
                          )}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          quote.status
                        }
                      />

                    </div>


                    <p className="mt-3 truncate text-sm text-slate-500">
                      {getDescription(
                        quote
                      )}
                    </p>


                    <div className="mt-4 flex items-end justify-between">

                      <div>

                        <p className="text-xs text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {formatCurrency(
                            getAmount(
                              quote
                            )
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Expires{" "}
                          {formatDate(
                            getExpiryDate(
                              quote
                            )
                          )}
                        </p>

                      </div>


                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setPreviewQuote(quote)
                          }
                          className="rounded-xl border border-indigo-200 bg-indigo-50 p-2.5 text-indigo-600 hover:bg-indigo-100 transition"
                          title="Quick Preview"
                        >
                          <Eye
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleView(
                              quoteId
                            )
                          }
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50"
                          title="View Details"
                        >
                          <FileText
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              quoteId
                            )
                          }
                          className="rounded-xl bg-slate-900 p-2.5 text-white transition hover:bg-slate-800"
                          title="Edit Quote"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                      </div>

                    </div>


                    {/* MOBILE ACTIONS */}

                    {(currentStatus ===
                      "pending" ||
                      currentStatus ===
                      "sent" ||
                      currentStatus ===
                      "draft") && (
                        <div className="mt-4 flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                quoteId
                              )
                            }
                            className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleReject(
                                quoteId
                              )
                            }
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            Reject
                          </button>

                        </div>
                      )}

                    {(currentStatus ===
                      "approved" ||
                      currentStatus ===
                      "accepted") && (
                        <button
                          type="button"
                          onClick={() =>
                            handleConvertToInvoice(
                              quoteId
                            )
                          }
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          <Receipt
                            size={15}
                          />
                          Convert to Invoice
                        </button>
                      )}

                  </motion.div>
                );
              }
            )}

          </div>


          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredQuotes.length ===
            0 && (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText size={25} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  {quotes.length === 0
                    ? "No quotations yet"
                    : "No quotations found"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {quotes.length === 0
                    ? "Create your first quotation to get started."
                    : "Try changing your search or status filter."}
                </p>

                {quotes.length ===
                  0 && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/admin/quotes/add"
                        )
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Plus size={17} />
                      Create Quotation
                    </button>
                  )}

              </div>
            )}

        </div>

      </div>

      <DocumentPreviewModal
        open={Boolean(previewQuote)}
        type="quotation"
        data={previewQuote}
        onClose={() => setPreviewQuote(null)}
        onDownloadPdf={handleDownloadPdf}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
        type="danger"
        itemName={deleteConfirm?.quoteNumber}
        loading={!!actionLoading}
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
  iconClass = "bg-slate-100 text-slate-700",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`rounded-xl p-3 transition group-hover:scale-110 ${iconClass}`}
        >
          <Icon size={20} />
        </div>

      </div>

    </motion.div>
  );
}


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  const config = {
    paid: {
      label: "Paid",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },

    approved: {
      label: "Approved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },

    accepted: {
      label: "Accepted",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },

    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },

    sent: {
      label: "Sent",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock3,
    },

    draft: {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
      icon: FileText,
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },

    declined: {
      label: "Declined",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  const current =
    config[normalized] || {
      label:
        status || "Unknown",
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
      icon: Clock3,
    };

  const Icon = current.icon;

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

function ActionMenu({
  quote,
  status,
  onPreview,
  onPdf,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onConvert,
  onSyncInvoice,
}) {
  return (
    <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">

      <ActionButton
        icon={Eye}
        label="Quick Preview"
        onClick={onPreview}
      />

      <ActionButton
        icon={FileText}
        label="View Quotation"
        onClick={onView}
      />

      <ActionButton
        icon={Download}
        label="Download PDF"
        onClick={onPdf}
      />

      <ActionButton
        icon={Pencil}
        label="Edit Quotation"
        onClick={onEdit}
      />

      {(status === "draft" ||
        status === "pending" ||
        status === "sent") && (
          <>
            <ActionButton
              icon={CheckCircle2}
              label="Approve Quotation"
              onClick={onApprove}
              success
            />

            <ActionButton
              icon={XCircle}
              label="Reject Quotation"
              onClick={onReject}
              danger
            />
          </>
        )}

      {(status === "approved" ||
        status === "accepted") && (
          <ActionButton
            icon={ArrowRight}
            label="Convert to Invoice"
            onClick={onConvert}
          />
        )}

      <ActionButton
        icon={RefreshCcw}
        label="Sync Invoice from Quote"
        onClick={() => onSyncInvoice(quote.id)}
      />

      <div className="my-1 border-t border-slate-100" />

      <ActionButton
        icon={Trash2}
        label="Delete Quotation"
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
  success = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${danger
        ? "text-red-600 hover:bg-red-50"
        : success
          ? "text-emerald-600 hover:bg-emerald-50"
          : "text-slate-700 hover:bg-slate-50"
        }`}
    >
      <Icon size={16} />

      {label}
    </button>
  );
}