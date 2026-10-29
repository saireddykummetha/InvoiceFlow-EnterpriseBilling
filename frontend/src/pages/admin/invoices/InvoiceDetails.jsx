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
  CreditCard,
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Printer,
  QrCode,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import invoiceService from "../../../services/invoiceService";
import useSettings from "../../../hooks/useSettings";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";

import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/common/Button";
import PaymentModal from "../../../components/payments/PaymentModal";
import ReceiptModal from "../../../components/payments/ReceiptModal";
import DynamicUpiQr from "../../../components/payments/DynamicUpiQr";
import { getReceipts } from "../../../api/receipts";

export default function InvoiceDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    formatCurrency,
    formatDate,
    getBusinessInfo,
    getPaymentDetails,
  } = useSettings();

  const business = getBusinessInfo();
  const payments = getPaymentDetails();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const loadInvoice = async () => {
    if (!id) {
      setError(
        "Invoice ID is missing."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await invoiceService.get(id);

      setInvoice(
        data?.data || data
      );
    } catch (err) {
      console.error(
        "Load invoice error:",
        err
      );

      setInvoice(null);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load invoice";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const items = useMemo(() => {
    if (Array.isArray(invoice?.items)) {
      return invoice.items;
    }

    if (
      Array.isArray(
        invoice?.invoice_items
      )
    ) {
      return invoice.invoice_items;
    }

    return [];
  }, [invoice]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => {
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
          sum +
          quantity * rate
        );
      },
      0
    );
  }, [items]);

  const discount = Number(
    invoice?.discount ??
    invoice?.discount_amount ??
    0
  );

  const taxRate = Number(
    invoice?.tax_rate ??
    invoice?.taxRate ??
    invoice?.gst_rate ??
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
    invoice?.shipping ??
    invoice?.shipping_amount ??
    0
  );

  const adjustment = Number(
    invoice?.adjustment ??
    0
  );

  const total =
    invoice?.total ??
    invoice?.grand_total ??
    invoice?.total_amount ??
    (
      taxableAmount +
      tax +
      shipping +
      adjustment
    );

  const invoiceNumber =
    invoice?.number ||
    invoice?.invoice_number ||
    invoice?.invoiceNumber ||
    `INV-${invoice?.id || id}`;

  const client =
    invoice?.client || {};

  // Backend now returns flat client_* fields directly on the invoice object
  const clientName =
    invoice?.client_name ||
    (typeof client === "object" ? client?.name : null) ||
    invoice?.clientName ||
    "—";

  const clientEmail =
    invoice?.client_email ||
    (typeof client === "object" ? client?.email : null) ||
    invoice?.clientEmail ||
    "—";

  const clientPhone =
    invoice?.client_phone ||
    (typeof client === "object" ? client?.phone : null) ||
    invoice?.clientPhone ||
    "—";

  const clientAddress =
    invoice?.client_address ||
    (typeof client === "object" ? client?.address : null) ||
    invoice?.clientAddress ||
    "—";

  const clientCompany =
    invoice?.client_company ||
    invoice?.client_company_name ||
    (typeof client === "object" ? (client?.company_name || client?.company) : null) ||
    invoice?.clientCompany ||
    "";

  const clientGstin =
    invoice?.client_gstin ||
    (typeof client === "object" ? (client?.gstin || client?.tax_number) : null) ||
    invoice?.clientGstin ||
    "—";

  const status =
    String(
      invoice?.status ||
      "pending"
    ).toLowerCase();

  const handleDownload = async () => {
    if (!id || downloading) return;

    try {
      setDownloading(true);
      await invoiceService.pdf(id, `${invoiceNumber}.pdf`);
      toast.success("Invoice PDF downloaded");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error(
        err?.response?.data?.detail ||
        "Unable to download invoice PDF"
      );
    } finally {
      setDownloading(false);
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
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle size={26} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Invoice not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The invoice could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/invoices"
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">

      <PageHeader
        title={invoiceNumber}
        subtitle="Invoice details and payment information."
        action={
          <div className="flex flex-wrap gap-2">

            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  "/admin/invoices"
                )
              }
            >
              <ArrowLeft size={16} />
              Back
            </Button>

            <Button
              variant="secondary"
              onClick={loadInvoice}
            >
              <RefreshCw size={16} />
              Refresh
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
              onClick={() =>
                navigate(
                  `/admin/invoices/${id}/edit`
                )
              }
            >
              <Pencil size={16} />
              Edit
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Download size={16} />
              )}

              PDF
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">TAX INVOICE</span>
                  <h3 className="text-xl font-black text-white mt-0.5">{invoiceNumber}</h3>
                  <div className="mt-2">
                    <StatusBadge status={status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b border-slate-200 p-6 sm:grid-cols-2 sm:p-8">

              <InfoBlock
                label="Billed To Client"
                value={clientName}
              />

              <InfoBlock
                label="Client Company"
                value={clientCompany || "—"}
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
                label="Billing Address"
                value={clientAddress}
              />

              <InfoBlock
                label="Client GSTIN / Tax ID"
                value={clientGstin || "—"}
              />

              <InfoBlock
                label="Issue Date"
                value={formatDate(invoice?.issue_date || invoice?.date || invoice?.created_at)}
              />

              <InfoBlock
                label="Due Date"
                value={formatDate(invoice?.due_date || invoice?.dueDate)}
              />
            </div>

            <div className="p-6 sm:p-8">

              <h2 className="text-lg font-bold text-slate-900">
                Invoice Items
              </h2>

              {items.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No invoice items found.
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

              {/* Bank Settlement & Terms Section */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid sm:grid-cols-2 gap-6">
                {payments.bankDetailsText && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Bank Settlement Details
                    </p>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {payments.bankDetailsText}
                    </p>
                  </div>
                )}

                {payments.upiId && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="font-bold text-indigo-900 text-xs">Direct Dynamic UPI Payment</p>
                      </div>
                      <p className="text-[11px] text-indigo-700 font-mono mt-0.5 font-bold">
                        {payments.upiId}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Scan with GPay, PhonePe, Paytm or any UPI app to pay ₹{Number(invoice?.balance_due || invoice?.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="shrink-0 bg-white p-2 rounded-2xl border border-indigo-200 shadow-sm">
                      <DynamicUpiQr
                        upiId={payments.upiId}
                        payeeName={business?.businessName || business?.business_name || "Merchant"}
                        amount={invoice?.balance_due || invoice?.total || 0}
                        invoiceNumber={invoice?.invoice_number || ""}
                        size={84}
                        showApps={false}
                        showCopy={false}
                        showDetails={false}
                        allowEnlarge={true}
                      />
                    </div>
                  </div>
                )}

                {(invoice?.terms || settings?.invoice?.terms) && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Terms & Conditions
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {invoice?.terms || settings?.invoice?.terms}
                    </p>
                  </div>
                )}

                {(invoice?.notes || settings?.invoice?.footer) && (
                  <div className="sm:col-span-2 text-xs text-slate-400 italic">
                    {invoice?.notes || settings?.invoice?.footer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Payment Status
            </h2>

            <div className="mt-5">
              <StatusBadge
                status={status}
              />

              <p className="mt-4 text-sm leading-6 text-slate-500">
                {status === "paid" ||
                  status === "completed"
                  ? "This invoice has been paid."
                  : "This invoice is still awaiting payment."}
              </p>
            </div>
          </div>

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
                  label="Grand Total"
                  value={formatCurrency(total)}
                  strong
                />

                <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
                  <SummaryRow
                    label="Paid Amount"
                    value={formatCurrency(invoice?.paid_amount ?? 0)}
                    valueClass="text-emerald-600"
                  />
                  <SummaryRow
                    label="Balance Due"
                    value={formatCurrency(invoice?.balance_due ?? total)}
                    valueClass={Number(invoice?.balance_due ?? total) > 0 ? "text-red-600 font-black" : "text-emerald-600"}
                    strong
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-indigo-500 shadow-md transition"
              >
                <Eye size={17} />
                Live Template Preview
              </button>

              {status === "paid" || status === "completed" || Number(invoice?.balance_due ?? -1) <= 0 ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-left text-sm font-semibold text-white opacity-100 cursor-not-allowed"
                  >
                    <CheckCircle2 size={17} />
                    Paid
                  </button>
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
                          toast.error("No receipt found for this invoice.", { id: toastId });
                        }
                      } catch (err) {
                        toast.error("Unable to load receipt.", { id: "receipt" });
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText size={17} />
                    View Receipt
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <CreditCard size={17} />
                  Record Payment
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Download size={17} />
                Download PDF
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer size={17} />
                Print Invoice
              </button>

              <button
                type="button"
                onClick={() =>
                  toast.success(
                    "Email action is ready for backend email integration."
                  )
                }
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Mail size={17} />
                Send Invoice
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/payments"
                  )
                }
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileText size={17} />
                Payment History
              </button>

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
        onClose={() => setReceiptModalOpen(false)} 
        receiptId={receiptId} 
      />

      <DocumentPreviewModal
        open={previewOpen}
        type="invoice"
        data={invoice}
        onClose={() => setPreviewOpen(false)}
        onDownloadPdf={handleDownload}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized =
    String(status || "")
      .toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "completed"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={14} />
        Paid
      </span>
    );
  }

  if (normalized === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
        <XCircle size={14} />
        Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
      <Clock3 size={14} />
      {status || "Pending"}
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
  valueClass = "",
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
        className={`text-right text-sm font-bold ${valueClass || (strong ? "text-lg font-black text-slate-900" : "text-sm font-semibold text-slate-800")}`}
      >
        {value}
      </span>
    </div>
  );
}