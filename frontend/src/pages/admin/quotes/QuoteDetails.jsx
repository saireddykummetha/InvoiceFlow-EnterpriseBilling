import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Printer,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import useQuotes from "../../../hooks/useQuotes";
import quoteService from "../../../services/quoteService";
import useSettings from "../../../hooks/useSettings";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";

import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/common/Button";

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    formatCurrency,
    formatDate,
    getBusinessInfo,
    settings,
  } = useSettings();

  const business = getBusinessInfo();

  const {
    quote,
    loading,
    error,
    loadQuote,
    approveQuote,
    rejectQuote,
    convertToInvoice,
  } = useQuotes();

  const [actionLoading, setActionLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuote(id);
    }
  }, [id, loadQuote]);

  const items = useMemo(() => {
    if (Array.isArray(quote?.items)) {
      return quote.items;
    }

    if (Array.isArray(quote?.quote_items)) {
      return quote.quote_items;
    }

    return [];
  }, [quote]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => {
        const quantity =
          Number(
            item.quantity || 0
          );

        const rate =
          Number(
            item.rate ??
            item.unit_price ??
            item.price ??
            0
          );

        return (
          total +
          quantity * rate
        );
      },
      0
    );
  }, [items]);

  const discount = Number(
    quote?.discount ??
    quote?.discount_amount ??
    0
  );

  const taxRate = Number(
    quote?.tax_rate ??
    quote?.taxRate ??
    quote?.gst_rate ??
    0
  );

  const taxableAmount =
    Math.max(
      subtotal - discount,
      0
    );

  const tax =
    taxableAmount *
    taxRate /
    100;

  const shipping = Number(
    quote?.shipping ??
    quote?.shipping_amount ??
    0
  );

  const adjustment = Number(
    quote?.adjustment ??
    0
  );

  const total =
    quote?.total ??
    quote?.grand_total ??
    quote?.total_amount ??
    (
      taxableAmount +
      tax +
      shipping +
      adjustment
    );

  const quoteNumber =
    quote?.number ||
    quote?.quote_number ||
    quote?.quoteNumber ||
    `QT-${quote?.id || id}`;

  const client =
    quote?.client || {};

  const clientName =
    client?.name ||
    client?.client_name ||
    quote?.client_name ||
    quote?.clientName ||
    "—";

  const clientEmail =
    client?.email ||
    quote?.client_email ||
    "—";

  const clientPhone =
    client?.phone ||
    quote?.client_phone ||
    "—";

  const clientAddress =
    client?.address ||
    quote?.client_address ||
    "—";

  const status =
    String(
      quote?.status || "pending"
    ).toLowerCase();

  const handleDownloadPdf = async () => {
    if (!id || downloading) return;
    try {
      setDownloading(true);
      const filename = `${quoteNumber}.pdf`;
      await quoteService.pdf(id, filename);
      toast.success("Quotation PDF downloaded");
    } catch (err) {
      console.error("Quote PDF download error:", err);
      toast.error(err?.response?.data?.detail || "Unable to download quotation PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleApprove = async () => {
    if (!id || actionLoading) return;

    try {
      setActionLoading(true);

      await approveQuote(id);

      toast.success(
        "Quotation approved successfully"
      );

      await loadQuote(id);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to approve quotation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || actionLoading) return;

    try {
      setActionLoading(true);

      await rejectQuote(id);

      toast.success(
        "Quotation rejected"
      );

      await loadQuote(id);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to reject quotation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!id || actionLoading) return;

    try {
      setActionLoading(true);

      const result =
        await convertToInvoice(id);

      const invoice =
        result?.data || result;

      toast.success(
        "Invoice created from quotation"
      );

      if (invoice?.id) {
        navigate(
          `/admin/invoices/${invoice.id}`
        );
      } else {
        navigate(
          "/admin/invoices"
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to convert quotation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-slate-700"
          />

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading quotation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle size={26} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Quotation not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The quotation could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/quotes"
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="min-h-full bg-slate-50"
    >
      <PageHeader
        title={quoteNumber}
        subtitle="Quotation details and approval status."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  "/admin/quotes"
                )
              }
            >
              <ArrowLeft size={16} />
              Back
            </Button>

            <Button
              variant="secondary"
              onClick={() => setPreviewOpen(true)}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
            >
              <Eye size={16} />
              Live Preview
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              Print
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              PDF
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  `/admin/quotes/${id}/edit`
                )
              }
            >
              <Pencil size={16} />
              Edit
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                loadQuote(id)
              }
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-3 lg:p-8">

        <div className="space-y-6 lg:col-span-2">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* Seller Business Info Banner */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg text-white">
                      {business.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{business.businessName}</h2>
                      {business.legalName && <p className="text-xs text-slate-400">{business.legalName}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 max-w-md">
                    {[business.address, business.city, business.state, business.postalCode, business.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{business.email} {business.phone && `• ${business.phone}`}</p>
                  {business.gstin && (
                    <p className="text-xs font-bold text-indigo-300 mt-1">GSTIN: {business.gstin}</p>
                  )}
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">ESTIMATE / QUOTATION</span>
                  <h3 className="text-xl font-black text-white mt-0.5">{quoteNumber}</h3>
                  <div className="mt-2">
                    <StatusBadge status={status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b border-slate-200 p-6 sm:grid-cols-2 sm:p-8">

              <InfoBlock
                label="Client Proposal For"
                value={clientName}
              />

              <InfoBlock
                label="Client Email"
                value={clientEmail}
              />

              <InfoBlock
                label="Client Phone"
                value={clientPhone}
              />

              <InfoBlock
                label="Billing / Client Address"
                value={clientAddress}
              />

              <InfoBlock
                label="Proposal Date"
                value={formatDate(quote?.issue_date || quote?.date || quote?.created_at)}
              />

              <InfoBlock
                label="Valid Until (Expiry)"
                value={formatDate(quote?.expiry_date || quote?.expiry || quote?.valid_until)}
              />

            </div>

            <div className="p-6 sm:p-8">

              <h2 className="text-lg font-bold text-slate-900">
                Items & Deliverables
              </h2>

              {items.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No quotation items found.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                          Description
                        </th>

                        <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                          Qty
                        </th>

                        <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                          Rate
                        </th>

                        <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {items.map(
                        (item, index) => {
                          const quantity =
                            Number(
                              item.quantity || 0
                            );

                          const rate =
                            Number(
                              item.rate ??
                              item.unit_price ??
                              item.price ??
                              0
                            );

                          return (
                            <tr
                              key={
                                item.id ??
                                index
                              }
                            >
                              <td className="px-3 py-4 text-sm font-semibold text-slate-700">
                                {item.description ||
                                  item.name ||
                                  item.title ||
                                  "—"}
                              </td>

                              <td className="px-3 py-4 text-right text-sm text-slate-600">
                                {quantity}
                              </td>

                              <td className="px-3 py-4 text-right text-sm text-slate-600">
                                {formatCurrency(
                                  rate
                                )}
                              </td>

                              <td className="px-3 py-4 text-right text-sm font-bold text-slate-900">
                                {formatCurrency(
                                  quantity *
                                  rate
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Quotation Terms & Notes */}
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                {(quote?.terms || settings?.quote?.terms) && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Terms & Conditions
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {quote?.terms || settings?.quote?.terms}
                    </p>
                  </div>
                )}

                {(quote?.notes || settings?.quote?.notes) && (
                  <div className="text-xs text-slate-400 italic">
                    {quote?.notes || settings?.quote?.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Summary
            </h2>

            <div className="mt-5 space-y-4">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(subtotal)}
              />

              <SummaryRow
                label="Discount"
                value={`-${formatCurrency(discount)}`}
              />

              <SummaryRow
                label={`Tax (${taxRate}%)`}
                value={formatCurrency(tax)}
              />

              <SummaryRow
                label="Shipping"
                value={formatCurrency(shipping)}
              />

              <div className="border-t border-slate-200 pt-4">
                <SummaryRow
                  label="Estimated Total"
                  value={formatCurrency(total)}
                  strong
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Actions
            </h2>

            <div className="mt-5 space-y-3">

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-md transition"
              >
                <Eye size={17} />
                Live Template Preview
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <Download size={17} />
                Download PDF
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer size={17} />
                Print Quotation
              </button>

              {status !== "approved" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}

                  Approve Quote
                </button>
              )}

              {status !== "rejected" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={17} />
                  Reject Quote
                </button>
              )}

              {status === "approved" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConvert}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <FileText size={17} />
                  )}

                  Convert to Invoice
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <DocumentPreviewModal
        open={previewOpen}
        type="quotation"
        data={quote}
        onClose={() => setPreviewOpen(false)}
        onDownloadPdf={handleDownloadPdf}
      />
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const normalized =
    String(status || "")
      .toLowerCase();

  if (normalized === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={14} />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
      <Clock3 size={14} />
      Pending
    </span>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-bold text-slate-900"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-black text-slate-900"
            : "text-sm font-semibold text-slate-800"
        }
      >
        {value}
      </span>
    </div>
  );
}