import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileDown,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  QrCode,
  Receipt,
  Sparkles,
  User,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import useSettings from "../../hooks/useSettings";
import DynamicUpiQr from "../payments/DynamicUpiQr";
import invoiceService from "../../services/invoiceService";
import quoteService from "../../services/quoteService";

const TEMPLATE_OPTIONS = [
  {
    id: "template1",
    name: "Modern Corporate",
    subtitle: "Dark slate header & bold totals",
    badge: "Popular",
    color: "from-slate-900 to-indigo-950",
  },
  {
    id: "template2",
    name: "Clean Minimal",
    subtitle: "Airy whitespace & thin borders",
    badge: "Minimal",
    color: "from-slate-700 to-slate-800",
  },
  {
    id: "template3",
    name: "Creative Pitch",
    subtitle: "Vibrant indigo badges & pill cards",
    badge: "Modern",
    color: "from-indigo-600 to-blue-700",
  },
  {
    id: "template4",
    name: "Formal Executive",
    subtitle: "Classic boxed layout with signoff",
    badge: "Formal",
    color: "from-slate-800 to-slate-900",
  },
];

export default function DocumentPreviewModal({
  open,
  type = "invoice", // "invoice" or "quotation" / "quote"
  data = null,
  onClose,
  onDownloadPdf,
}) {
  const {
    settings,
    formatCurrency,
    formatDate,
    getBusinessInfo,
    getPaymentDetails,
    getTaxConfig,
    getPdfConfig,
  } = useSettings();

  const business = getBusinessInfo();
  const payments = getPaymentDetails();
  const taxConfig = getTaxConfig();
  const pdfConfig = getPdfConfig();

  const isQuote = type === "quotation" || type === "quote";
  const defaultTemplate = isQuote
    ? settings?.quotation?.selectedTemplate || "template1"
    : settings?.invoice?.selectedTemplate || "template1";

  const [activeTemplate, setActiveTemplate] = useState(defaultTemplate);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open && defaultTemplate) {
      setActiveTemplate(defaultTemplate);
    }
  }, [open, defaultTemplate]);

  // Extract document fields with fallbacks
  const docNumber = isQuote
    ? data?.quote_number || data?.number || data?.quoteNumber || "QUO-0001"
    : data?.invoice_number || data?.number || data?.invoiceNumber || "INV-0001";

  const docTitle = isQuote ? "QUOTATION ESTIMATE" : "TAX INVOICE";

  const issueDate = data?.issue_date || data?.date || data?.created_at || new Date().toISOString().slice(0, 10);
  const dueDate = isQuote
    ? data?.expiry_date || data?.validUntil || data?.expiryDate || "—"
    : data?.due_date || data?.dueDate || "—";

  const client = typeof data?.client === "object" ? data?.client : null;
  const clientName =
    data?.client_name ||
    client?.name ||
    client?.client_name ||
    (typeof data?.client === "string" ? data?.client : "Valued Client");

  const clientEmail = data?.client_email || client?.email || "—";
  const clientPhone = data?.client_phone || client?.phone || "—";
  const clientAddress = data?.client_address || client?.address || client?.street || "—";
  const clientCompany = data?.client_company || data?.client_company_name || client?.company_name || client?.company || "";
  const clientGstin = data?.client_gstin || client?.gstin || client?.tax_number || "—";

  const rawItems = data?.items || data?.invoice_items || data?.quote_items || [];
  const items = Array.isArray(rawItems) && rawItems.length > 0
    ? rawItems
    : [
        { id: 1, description: "Consulting & Implementation Services", quantity: 1, rate: 5000 },
      ];

  const subtotal = items.reduce((sum, it) => {
    const q = Number(it.quantity || it.qty || 1);
    const r = Number(it.rate ?? it.unit_price ?? it.price ?? 0);
    return sum + q * r;
  }, 0);

  const discount = Number(data?.discount || data?.discount_amount || 0);
  const taxRate = Number(data?.tax_rate || data?.taxRate || data?.gst_rate || taxConfig.defaultRate || 0);
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = Number(data?.tax || data?.tax_amount || (taxableAmount * taxRate) / 100);
  const shipping = Number(data?.shipping || data?.shipping_amount || 0);
  const adjustment = Number(data?.adjustment || 0);
  const total = Number(data?.total || data?.grand_total || (taxableAmount + tax + shipping + adjustment));
  const paidAmount = Number(data?.paid_amount || 0);
  const balanceDue = Number(data?.balance_due ?? (total - paidAmount));

  const fallbackTerms = isQuote
    ? (settings?.quotation?.terms || settings?.quotation?.defaultTerms || "")
    : (settings?.invoice?.terms || settings?.invoice?.defaultTerms || "");

  const fallbackNotes = isQuote
    ? (settings?.quotation?.footer || settings?.quotation?.defaultFooter || settings?.quotation?.notes || "")
    : (settings?.invoice?.footer || settings?.invoice?.defaultFooter || settings?.invoice?.notes || "");

  const terms = (data?.terms && String(data.terms).trim() !== "") ? data.terms : fallbackTerms;
  const notes = (data?.notes && String(data.notes).trim() !== "") ? data.notes : ((data?.footer && String(data.footer).trim() !== "") ? data.footer : fallbackNotes);
  const status = String(data?.status || "active").toLowerCase();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (onDownloadPdf) {
      try {
        setDownloading(true);
        await onDownloadPdf(data, activeTemplate);
      } catch (err) {
        console.error("Custom download handler error:", err);
      } finally {
        setDownloading(false);
      }
      return;
    }

    if (data?.id) {
      try {
        setDownloading(true);
        const service = isQuote ? quoteService : invoiceService;
        const filename = `${docNumber || (isQuote ? "quote" : "invoice")}.pdf`;
        await service.pdf(data.id, filename, activeTemplate);
        toast.success("PDF downloaded successfully");
      } catch (err) {
        console.error("PDF download error:", err);
        window.print();
      } finally {
        setDownloading(false);
      }
    } else {
      window.print();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:backdrop-blur-none print:z-auto print:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-5xl h-[94vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 print:h-auto print:max-h-none print:w-full print:max-w-none print:bg-white print:border-none print:shadow-none print:rounded-none print:text-black print:overflow-visible print:block"
        >
          {/* TOP BAR - Hidden during print and PDF export */}
          <div className="modal-topbar no-print print:hidden flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                {isQuote ? <FileText size={20} /> : <Receipt size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{docNumber}</h3>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Live Preview
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isQuote ? "Quotation Document Preview" : "Tax Invoice Document Preview"}
                </p>
              </div>
            </div>

            {/* Template selector pills */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900 p-1 border border-slate-800 template-selector">
              {TEMPLATE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTemplate === t.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t.name.split(":")[0]}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
              >
                <Printer size={14} />
                Print
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition disabled:opacity-60"
              >
                {downloading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>{downloading ? "Downloading..." : "Download PDF"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/50 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
            <div className="w-full max-w-4xl printable-document print:max-w-none print:w-full print:m-0 print:p-0">
              {/* Template Rendering */}
              {activeTemplate === "template1" && (
                <TemplateCorporate
                  docTitle={docTitle}
                  docNumber={docNumber}
                  isQuote={isQuote}
                  issueDate={formatDate(issueDate)}
                  dueDate={formatDate(dueDate)}
                  status={status}
                  business={business}
                  clientName={clientName}
                  clientCompany={clientCompany}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  clientAddress={clientAddress}
                  clientGstin={clientGstin}
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  taxRate={taxRate}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  paidAmount={paidAmount}
                  balanceDue={balanceDue}
                  terms={terms}
                  notes={notes}
                  payments={payments}
                  formatCurrency={formatCurrency}
                />
              )}

              {activeTemplate === "template2" && (
                <TemplateMinimal
                  docTitle={docTitle}
                  docNumber={docNumber}
                  isQuote={isQuote}
                  issueDate={formatDate(issueDate)}
                  dueDate={formatDate(dueDate)}
                  status={status}
                  business={business}
                  clientName={clientName}
                  clientCompany={clientCompany}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  clientAddress={clientAddress}
                  clientGstin={clientGstin}
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  taxRate={taxRate}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  paidAmount={paidAmount}
                  balanceDue={balanceDue}
                  terms={terms}
                  notes={notes}
                  payments={payments}
                  formatCurrency={formatCurrency}
                />
              )}

              {activeTemplate === "template3" && (
                <TemplateCreative
                  docTitle={docTitle}
                  docNumber={docNumber}
                  isQuote={isQuote}
                  issueDate={formatDate(issueDate)}
                  dueDate={formatDate(dueDate)}
                  status={status}
                  business={business}
                  clientName={clientName}
                  clientCompany={clientCompany}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  clientAddress={clientAddress}
                  clientGstin={clientGstin}
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  taxRate={taxRate}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  paidAmount={paidAmount}
                  balanceDue={balanceDue}
                  terms={terms}
                  notes={notes}
                  payments={payments}
                  formatCurrency={formatCurrency}
                />
              )}

              {activeTemplate === "template4" && (
                <TemplateExecutive
                  docTitle={docTitle}
                  docNumber={docNumber}
                  isQuote={isQuote}
                  issueDate={formatDate(issueDate)}
                  dueDate={formatDate(dueDate)}
                  status={status}
                  business={business}
                  clientName={clientName}
                  clientCompany={clientCompany}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  clientAddress={clientAddress}
                  clientGstin={clientGstin}
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  taxRate={taxRate}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  paidAmount={paidAmount}
                  balanceDue={balanceDue}
                  terms={terms}
                  notes={notes}
                  payments={payments}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ========================================================================== */
/* TEMPLATE 1: MODERN CORPORATE                                               */
/* ========================================================================== */
function TemplateCorporate({
  docTitle,
  docNumber,
  isQuote,
  issueDate,
  dueDate,
  status,
  business,
  clientName,
  clientCompany,
  clientEmail,
  clientPhone,
  clientAddress,
  clientGstin,
  items,
  subtotal,
  discount,
  taxRate,
  tax,
  shipping,
  total,
  paidAmount,
  balanceDue,
  terms,
  notes,
  payments,
  formatCurrency,
}) {
  return (
    <div className="bg-white text-slate-900 rounded-3xl shadow-xl overflow-hidden font-sans border border-slate-200">
      {/* Header banner */}
      <div className="bg-slate-950 text-white p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg text-white">
                {business.businessName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-black tracking-tight">{business.businessName}</h1>
            </div>
            {business.legalName && (
              <p className="text-xs text-slate-400 mt-1">{business.legalName}</p>
            )}
            <div className="mt-3 text-xs text-slate-400 space-y-0.5 leading-relaxed">
              <p>{[business.address, business.city, business.state, business.postalCode, business.country].filter(Boolean).join(", ")}</p>
              <p>{business.email} {business.phone && `• ${business.phone}`}</p>
              {business.gstin && <p className="font-semibold text-slate-300">GSTIN: {business.gstin}</p>}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              {docTitle}
            </span>
            <h2 className="text-2xl font-black text-white mt-1">{docNumber}</h2>
            <div className="mt-3 text-xs text-slate-300 space-y-1">
              <p><strong className="text-slate-400">Date:</strong> {issueDate}</p>
              <p><strong className="text-slate-400">{isQuote ? "Valid Until:" : "Due Date:"}</strong> {dueDate}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="p-8 sm:p-10 border-b border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isQuote ? "Prepared For" : "Billed To"}
        </p>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{clientName}</h3>
            {clientCompany && <p className="text-sm font-semibold text-slate-600">{clientCompany}</p>}
            <p className="text-xs text-slate-500 mt-1 max-w-sm">{clientAddress}</p>
          </div>
          <div className="text-xs text-slate-600 space-y-1 sm:text-right">
            <p><span className="text-slate-400">Email:</span> {clientEmail}</p>
            <p><span className="text-slate-400">Phone:</span> {clientPhone}</p>
            {clientGstin && clientGstin !== "—" && (
              <p><span className="text-slate-400">Client GSTIN:</span> <strong className="text-slate-900">{clientGstin}</strong></p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-8 sm:p-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-right">Qty</th>
                <th className="py-3 px-2 text-right">Rate</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((it, idx) => {
                const q = Number(it.quantity || it.qty || 1);
                const r = Number(it.rate ?? it.unit_price ?? it.price ?? 0);
                const amt = q * r;
                return (
                  <tr key={it.id || idx} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-2 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-2 font-bold text-slate-800">
                      {it.description || it.name || "Service Item"}
                    </td>
                    <td className="py-3.5 px-2 text-right text-slate-600 font-medium">{q}</td>
                    <td className="py-3.5 px-2 text-right text-slate-600 font-medium">{formatCurrency(r)}</td>
                    <td className="py-3.5 px-2 text-right font-black text-slate-900">{formatCurrency(amt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Bank Details */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid sm:grid-cols-2 gap-8 items-start">
          {/* Left column: Payment / Bank details or Terms */}
          <div className="space-y-4 text-xs">
            {payments.bankDetailsText && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="font-black uppercase tracking-wider text-[10px] text-slate-500 mb-1">
                  Bank Settlement Details
                </p>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {payments.bankDetailsText}
                </p>
              </div>
            )}

            {payments.upiId && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-indigo-900 text-xs">Direct Dynamic UPI Payment</p>
                  <p className="text-[11px] text-indigo-700 font-mono mt-0.5 font-bold">{payments.upiId}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Scan with any UPI app to pay ₹{Number(balanceDue || total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="shrink-0 bg-white p-1.5 rounded-xl border border-indigo-200 shadow-sm">
                  <DynamicUpiQr
                    upiId={payments.upiId}
                    payeeName={business.businessName || "Merchant"}
                    amount={balanceDue || total || 0}
                    invoiceNumber={docNumber || ""}
                    size={72}
                    showApps={false}
                    showCopy={false}
                    showDetails={false}
                    allowEnlarge={true}
                  />
                </div>
              </div>
            )}

            {terms && (
              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Terms & Conditions
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed whitespace-pre-line">{terms}</p>
              </div>
            )}
          </div>

          {/* Right column: Totals breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Discount</span>
                <span className="font-semibold">-{formatCurrency(discount)}</span>
              </div>
            )}

            {taxRate > 0 && (
              <div className="flex justify-between text-xs text-slate-300">
                <span>Tax ({taxRate}%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
            )}

            {shipping > 0 && (
              <div className="flex justify-between text-xs text-slate-300">
                <span>Shipping</span>
                <span className="font-semibold">{formatCurrency(shipping)}</span>
              </div>
            )}

            <div className="border-t border-slate-700 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Grand Total</span>
              <span className="text-xl font-black text-indigo-400">{formatCurrency(total)}</span>
            </div>

            {!isQuote && (
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs">
                <span className="text-slate-400">Balance Due</span>
                <span className={`font-black ${balanceDue > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            )}
          </div>
        </div>

        {notes && (
          <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
            {notes}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TEMPLATE 2: CLEAN MINIMAL                                                  */
/* ========================================================================== */
function TemplateMinimal({
  docTitle,
  docNumber,
  isQuote,
  issueDate,
  dueDate,
  status,
  business,
  clientName,
  clientCompany,
  clientEmail,
  clientPhone,
  clientAddress,
  clientGstin,
  items,
  subtotal,
  discount,
  taxRate,
  tax,
  shipping,
  total,
  paidAmount,
  balanceDue,
  terms,
  notes,
  payments,
  formatCurrency,
}) {
  return (
    <div className="bg-white text-slate-900 rounded-3xl shadow-xl p-8 sm:p-12 font-sans border border-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-900 pb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{business.businessName}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
            {[business.address, business.city, business.state, business.postalCode, business.country].filter(Boolean).join(", ")}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{business.email} {business.phone && `• ${business.phone}`}</p>
          {business.gstin && <p className="text-xs font-bold text-slate-700 mt-1">GSTIN: {business.gstin}</p>}
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{docTitle}</p>
          <h2 className="text-xl font-black text-slate-900 mt-1">{docNumber}</h2>
          <div className="mt-2 text-xs text-slate-600 space-y-0.5">
            <p>Date: <span className="font-semibold text-slate-900">{issueDate}</span></p>
            <p>{isQuote ? "Valid Until:" : "Due Date:"} <span className="font-semibold text-slate-900">{dueDate}</span></p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="py-6 border-b border-slate-100 grid sm:grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient</p>
          <h3 className="text-base font-bold text-slate-900 mt-1">{clientName}</h3>
          {clientCompany && <p className="font-semibold text-slate-600">{clientCompany}</p>}
          <p className="text-slate-500 mt-1 leading-relaxed">{clientAddress}</p>
        </div>
        <div className="sm:text-right space-y-1 self-end">
          <p><span className="text-slate-400">Email:</span> {clientEmail}</p>
          <p><span className="text-slate-400">Phone:</span> {clientPhone}</p>
          {clientGstin && clientGstin !== "—" && <p><span className="text-slate-400">GSTIN:</span> {clientGstin}</p>}
        </div>
      </div>

      {/* Table */}
      <div className="py-6">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[10px] tracking-wider">
              <th className="py-2.5">Item Description</th>
              <th className="py-2.5 text-right">Qty</th>
              <th className="py-2.5 text-right">Price</th>
              <th className="py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it, idx) => {
              const q = Number(it.quantity || it.qty || 1);
              const r = Number(it.rate ?? it.unit_price ?? it.price ?? 0);
              return (
                <tr key={idx}>
                  <td className="py-3 font-semibold text-slate-800">{it.description || "Line item"}</td>
                  <td className="py-3 text-right text-slate-600">{q}</td>
                  <td className="py-3 text-right text-slate-600">{formatCurrency(r)}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(q * r)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Calculation */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-8">
          <div className="max-w-md text-xs text-slate-500 space-y-2">
            {payments.bankDetailsText && (
              <div>
                <p className="font-bold text-slate-800 uppercase text-[10px]">Payment Instructions</p>
                <p className="whitespace-pre-line leading-relaxed mt-0.5">{payments.bankDetailsText}</p>
              </div>
            )}
            {terms && (
              <div>
                <p className="font-bold text-slate-800 uppercase text-[10px]">Terms</p>
                <p className="whitespace-pre-line leading-relaxed mt-0.5">{terms}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(discount)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({taxRate}%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="border-t border-slate-900 pt-3 flex justify-between items-baseline font-black text-sm">
              <span>Total</span>
              <span className="text-base text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TEMPLATE 3: CREATIVE PITCH                                                 */
/* ========================================================================== */
function TemplateCreative({
  docTitle,
  docNumber,
  isQuote,
  issueDate,
  dueDate,
  status,
  business,
  clientName,
  clientCompany,
  clientEmail,
  clientPhone,
  clientAddress,
  clientGstin,
  items,
  subtotal,
  discount,
  taxRate,
  tax,
  shipping,
  total,
  paidAmount,
  balanceDue,
  terms,
  notes,
  payments,
  formatCurrency,
}) {
  return (
    <div className="bg-white text-slate-900 rounded-3xl shadow-xl overflow-hidden font-sans border border-slate-200">
      {/* Vibrant Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 sm:p-10 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur">
              <Sparkles size={11} /> {docTitle}
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-3">{business.businessName}</h1>
            <p className="text-xs text-indigo-100 mt-1 max-w-md">
              {[business.address, business.city, business.state, business.postalCode].filter(Boolean).join(", ")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Document No</p>
            <p className="text-xl font-black text-white">{docNumber}</p>
            <p className="text-xs text-indigo-100 mt-1">Date: {issueDate}</p>
          </div>
        </div>
      </div>

      {/* Pill Cards Row */}
      <div className="p-8 sm:p-10">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Customer Identity</p>
            <h3 className="text-base font-bold text-slate-900 mt-1">{clientName}</h3>
            {clientCompany && <p className="text-xs font-semibold text-slate-600">{clientCompany}</p>}
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{clientAddress}</p>
            <p className="text-xs text-slate-500 mt-1">{clientEmail} • {clientPhone}</p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Validity & Schedule</p>
              <p className="text-xs text-slate-700 mt-1">
                <strong>Schedule:</strong> {isQuote ? "Valid until " : "Due by "} <span className="text-indigo-600 font-bold">{dueDate}</span>
              </p>
            </div>
            {payments.upiId && (
              <div className="mt-3 pt-3 border-t border-indigo-200/60 flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-bold">UPI ID: {payments.upiId}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">Instant Pay</span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-indigo-50/70 text-indigo-950 font-black text-[10px] uppercase tracking-wider rounded-xl">
                <th className="py-3 px-3 rounded-l-xl">Scope Description</th>
                <th className="py-3 px-3 text-right">Units</th>
                <th className="py-3 px-3 text-right">Rate</th>
                <th className="py-3 px-3 text-right rounded-r-xl">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => {
                const q = Number(it.quantity || it.qty || 1);
                const r = Number(it.rate ?? it.unit_price ?? it.price ?? 0);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-bold text-slate-800">{it.description || "Service"}</td>
                    <td className="py-3.5 px-3 text-right text-slate-600">{q}</td>
                    <td className="py-3.5 px-3 text-right text-slate-600">{formatCurrency(r)}</td>
                    <td className="py-3.5 px-3 text-right font-black text-indigo-600">{formatCurrency(q * r)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Badge Banner */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Total Investment</p>
            <p className="text-2xl font-black text-white">{formatCurrency(total)}</p>
          </div>
          <div className="text-xs text-slate-300 sm:text-right space-y-1">
            <p>Subtotal: {formatCurrency(subtotal)}</p>
            {taxRate > 0 && <p>Tax ({taxRate}%): {formatCurrency(tax)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TEMPLATE 4: FORMAL EXECUTIVE                                               */
/* ========================================================================== */
function TemplateExecutive({
  docTitle,
  docNumber,
  isQuote,
  issueDate,
  dueDate,
  status,
  business,
  clientName,
  clientCompany,
  clientEmail,
  clientPhone,
  clientAddress,
  clientGstin,
  items,
  subtotal,
  discount,
  taxRate,
  tax,
  shipping,
  total,
  paidAmount,
  balanceDue,
  terms,
  notes,
  payments,
  formatCurrency,
}) {
  return (
    <div className="bg-white text-slate-900 rounded-3xl shadow-xl p-8 sm:p-12 font-serif border-2 border-slate-300">
      {/* Formal Header */}
      <div className="text-center border-b-2 border-slate-900 pb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">{business.businessName}</h1>
        {business.legalName && <p className="text-xs text-slate-600 italic mt-0.5">{business.legalName}</p>}
        <p className="text-xs text-slate-600 mt-1">
          {[business.address, business.city, business.state, business.postalCode, business.country].filter(Boolean).join(", ")}
        </p>
        <p className="text-xs text-slate-600">Email: {business.email} | Tel: {business.phone} | GSTIN: {business.gstin || "—"}</p>
      </div>

      {/* Title & Info Bar */}
      <div className="py-4 border-b border-slate-300 flex justify-between items-center text-xs font-sans">
        <div>
          <span className="font-bold uppercase tracking-wider">{docTitle}: </span>
          <span className="font-mono font-bold text-slate-900">{docNumber}</span>
        </div>
        <div>
          <span className="font-bold">Date: </span>
          <span>{issueDate}</span>
          <span className="mx-2">|</span>
          <span className="font-bold">{isQuote ? "Valid To: " : "Due Date: "}</span>
          <span>{dueDate}</span>
        </div>
      </div>

      {/* Recipient */}
      <div className="py-4 border-b border-slate-300 font-sans text-xs">
        <p className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Client / Recipient:</p>
        <p className="font-bold text-sm text-slate-900 mt-1">{clientName} {clientCompany && `(${clientCompany})`}</p>
        <p className="text-slate-600 mt-0.5">{clientAddress}</p>
        <p className="text-slate-600">Email: {clientEmail} | Contact: {clientPhone} | GSTIN: {clientGstin}</p>
      </div>

      {/* Items */}
      <div className="py-6 font-sans">
        <table className="w-full text-left text-xs border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3 border-r border-slate-300">Item Details</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-300">Quantity</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-300">Rate</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((it, idx) => {
              const q = Number(it.quantity || it.qty || 1);
              const r = Number(it.rate ?? it.unit_price ?? it.price ?? 0);
              return (
                <tr key={idx}>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-semibold">{it.description || "Service"}</td>
                  <td className="py-2.5 px-3 text-right border-r border-slate-300">{q}</td>
                  <td className="py-2.5 px-3 text-right border-r border-slate-300">{formatCurrency(r)}</td>
                  <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(q * r)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Calculation and Signoff */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-8 text-xs">
          <div className="space-y-3 max-w-sm">
            {payments.bankDetailsText && (
              <div>
                <p className="font-bold uppercase text-[10px] text-slate-600">Remittance Details:</p>
                <p className="whitespace-pre-line text-slate-700 leading-relaxed mt-0.5">{payments.bankDetailsText}</p>
              </div>
            )}
            {terms && (
              <div>
                <p className="font-bold uppercase text-[10px] text-slate-600">Terms:</p>
                <p className="whitespace-pre-line text-slate-600 leading-relaxed mt-0.5">{terms}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-sm">
              <span>Total Amount:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {/* Signature box */}
            <div className="mt-8 pt-8 border-t border-dashed border-slate-300 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Authorized Signatory</p>
              <p className="font-semibold text-slate-800 mt-1">{business.businessName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
