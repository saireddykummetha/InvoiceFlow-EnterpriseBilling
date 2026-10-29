import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Printer,
  Receipt,
  Sparkles,
  X,
} from "lucide-react";
import useSettings from "../../hooks/useSettings";

const TEMPLATES = [
  {
    id: "template1",
    name: "Template 1: Modern Corporate",
    subtitle: "Dark header with slate accents & bold total highlight",
    badge: "Popular",
    color: "from-slate-900 to-indigo-950",
  },
  {
    id: "template2",
    name: "Template 2: Clean Minimal",
    subtitle: "Airy whitespace, thin elegant borders & classic typography",
    badge: "Minimal",
    color: "from-slate-100 to-slate-200 text-slate-800",
  },
  {
    id: "template3",
    name: "Template 3: Creative Pitch",
    subtitle: "Vibrant indigo badges, rounded pill cards & QR section",
    badge: "Modern",
    color: "from-indigo-600 to-blue-700",
  },
  {
    id: "template4",
    name: "Template 4: Formal Executive",
    subtitle: "Traditional boxed layout with formal authorization signoff",
    badge: "Formal",
    color: "from-slate-800 to-slate-900",
  },
];

export default function TemplatePreviewModal({
  open,
  type = "quotation", // "quotation" or "invoice"
  selectedTemplate = "template1",
  onSelectTemplate,
  onClose,
}) {
  const { settings } = useSettings();
  const [activeTemplate, setActiveTemplate] = useState(selectedTemplate);

  const isQuote = type === "quotation";
  const docTitle = isQuote ? "QUOTATION ESTIMATE" : "TAX INVOICE";
  const docNumber = isQuote ? "AK-XX-0089" : "INV-2026-0042";

  const business = settings?.business || {
    businessName: "UltraKey Technologies Pvt Ltd",
    address: "Plot 42, Silicon Valley, Hitec City, Hyderabad, 500081",
    email: "billing@ultrakey.io",
    phone: "+91 98765 43210",
    website: "https://ultrakey.io",
    gstin: "36AAAAA0000A1Z5",
  };

  const sampleItems = [
    {
      id: 1,
      description: "Cloud Architecture & Full-Stack System Design",
      qty: 1,
      rate: 35000,
      amount: 35000,
    },
    {
      id: 2,
      description: "Custom UI/UX Interface Design & Responsive Frontend",
      qty: 1,
      rate: 20000,
      amount: 20000,
    },
    {
      id: 3,
      description: "PostgreSQL Database Migration & REST API Integration",
      qty: 1,
      rate: 15000,
      amount: 15000,
    },
  ];

  const subtotal = 70000;
  const gst = 12600; // 18%
  const grandTotal = 82600;

  const handleApply = () => {
    onSelectTemplate?.(activeTemplate);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="template-preview-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:backdrop-blur-none print:z-auto print:block"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 print:h-auto print:max-h-none print:w-full print:max-w-none print:bg-white print:border-none print:shadow-none print:rounded-none print:text-black print:overflow-visible print:block"
          >
            {/* Modal Header - Hidden in Print */}
            <div className="modal-topbar no-print print:hidden flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Eye size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    Live {isQuote ? "Quote" : "Invoice"} Template Preview
                    <span className="rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Interactive
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Switch between templates below to preview how your documents will look.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition shadow-md"
                >
                  <CheckCircle2 size={14} />
                  <span>Use This Template</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Template Selector Bar - Hidden in Print */}
            <div className="template-selector no-print print:hidden border-b border-slate-800 bg-slate-950/40 px-6 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TEMPLATES.map((tmpl) => {
                  const isSelected = activeTemplate === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setActiveTemplate(tmpl.id)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left border transition ${
                        isSelected
                          ? "border-teal-500 bg-teal-500/10 text-teal-300 font-bold shadow-sm"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate">{tmpl.name.split(":")[0]}</p>
                        <p className="text-[10px] text-slate-500 truncate">{tmpl.name.split(":")[1] || tmpl.badge}</p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 size={15} className="text-teal-400 shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Preview Viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/90 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
              {/* Document Sheet Simulation */}
              <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between min-h-[750px] printable-document print:max-w-none print:w-full print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none">
                {/* ========================================================
                    TEMPLATE 1: MODERN CORPORATE (DARK SLATE HEADER)
                ======================================================== */}
                {activeTemplate === "template1" && (
                  <div>
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h1 className="text-2xl font-black tracking-tight">{business.businessName || "UltraKey"}</h1>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">{business.address}</p>
                          <p className="text-xs text-slate-400 mt-0.5">GSTIN: {business.gstin || "36AAAAA0000A1Z5"}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="inline-block rounded-lg bg-teal-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-teal-300 border border-teal-500/30">
                            {docTitle}
                          </span>
                          <p className="text-sm font-bold text-white mt-2">{docNumber}</p>
                          <p className="text-xs text-slate-400">Date: 13 Aug 2026</p>
                          {isQuote && <p className="text-xs text-teal-300 font-semibold">Valid Until: 28 Aug 2026</p>}
                        </div>
                      </div>
                    </div>

                    {/* Client Details Box */}
                    <div className="p-8">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prepared For</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Acme Innovations Corp</p>
                        <p className="text-xs text-slate-600">contact@acme.com • +91 98450 11223</p>
                        <p className="text-xs text-slate-500 mt-0.5">404 Tech Park, Bengaluru, 560100</p>
                      </div>

                      {/* Items Table */}
                      <table className="w-full text-left text-xs mb-6">
                        <thead>
                          <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            <th className="py-2.5">Item Description</th>
                            <th className="py-2.5 text-center">Qty</th>
                            <th className="py-2.5 text-right">Unit Rate</th>
                            <th className="py-2.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sampleItems.map((item) => (
                            <tr key={item.id}>
                              <td className="py-3 font-semibold text-slate-800">{item.description}</td>
                              <td className="py-3 text-center text-slate-600">{item.qty}</td>
                              <td className="py-3 text-right text-slate-600">₹{item.rate.toLocaleString()}</td>
                              <td className="py-3 text-right font-bold text-slate-900">₹{item.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div className="flex justify-end pt-4 border-t border-slate-200">
                        <div className="w-64 space-y-2 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>GST (18%)</span>
                            <span>₹{gst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm text-slate-950 pt-2 border-t-2 border-slate-900">
                            <span>Total Amount</span>
                            <span className="text-indigo-600">₹{grandTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TEMPLATE 2: CLEAN MINIMAL
                ======================================================== */}
                {activeTemplate === "template2" && (
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                      <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{business.businessName || "UltraKey"}</h1>
                        <p className="text-xs text-slate-500 mt-1">{business.address}</p>
                        <p className="text-xs text-slate-400">GSTIN: {business.gstin || "36AAAAA0000A1Z5"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-light uppercase tracking-widest text-slate-600">{docTitle}</p>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-1">{docNumber}</p>
                        <p className="text-xs text-slate-400">Date: 13/08/2026</p>
                      </div>
                    </div>

                    {/* Client Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Billed To:</span>
                        <p className="font-bold text-slate-800">Acme Innovations Corp</p>
                        <p className="text-slate-500">contact@acme.com</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                        <p className="font-semibold text-emerald-600">Approved & Verified</p>
                      </div>
                    </div>

                    {/* Minimal Table */}
                    <table className="w-full text-left text-xs mb-6">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                          <th className="py-2">Description</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Price</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sampleItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3 text-slate-700">{item.description}</td>
                            <td className="py-3 text-center text-slate-500">{item.qty}</td>
                            <td className="py-3 text-right text-slate-500">₹{item.rate.toLocaleString()}</td>
                            <td className="py-3 text-right font-medium text-slate-900">₹{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Minimal Total */}
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <div className="w-60 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (GST 18%)</span>
                          <span>₹{gst.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                          <span>Grand Total</span>
                          <span>₹{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TEMPLATE 3: CREATIVE PITCH (INDIGO ACCENTS & PILLS)
                ======================================================== */}
                {activeTemplate === "template3" && (
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center rounded-2xl bg-indigo-50 border border-indigo-100 p-6 mb-6">
                      <div>
                        <span className="inline-block rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold uppercase text-white mb-2">
                          {docTitle}
                        </span>
                        <h1 className="text-2xl font-black text-indigo-950">{business.businessName || "UltraKey"}</h1>
                        <p className="text-xs text-indigo-700/80">{business.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-950">{docNumber}</p>
                        <p className="text-xs text-indigo-600">Issued: Aug 13, 2026</p>
                      </div>
                    </div>

                    {/* Items in modern cards */}
                    <div className="space-y-2.5 mb-6">
                      {sampleItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 transition text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{item.description}</p>
                            <p className="text-[11px] text-slate-400">Qty: {item.qty} × ₹{item.rate.toLocaleString()}</p>
                          </div>
                          <span className="font-black text-indigo-600 text-sm">₹{item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals in Pill Box */}
                    <div className="rounded-2xl bg-indigo-950 text-white p-5 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Total Payable</p>
                        <p className="text-xs text-slate-400">Includes all applicable GST (18%)</p>
                      </div>
                      <p className="text-2xl font-black text-white">₹{grandTotal.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TEMPLATE 4: FORMAL EXECUTIVE (BOXED STRUCTURE)
                ======================================================== */}
                {activeTemplate === "template4" && (
                  <div className="p-8">
                    <div className="border-4 border-slate-900 p-6 space-y-6">
                      <div className="flex justify-between border-b-2 border-slate-900 pb-4">
                        <div>
                          <h1 className="text-xl font-serif font-black uppercase text-slate-900">{business.businessName || "UltraKey"}</h1>
                          <p className="text-xs text-slate-600">{business.address}</p>
                          <p className="text-xs text-slate-600">CIN / Reg: {business.gstin || "36AAAAA0000A1Z5"}</p>
                        </div>
                        <div className="text-right">
                          <h2 className="text-lg font-serif font-bold uppercase tracking-widest text-slate-900">{docTitle}</h2>
                          <p className="text-xs font-bold font-mono text-slate-800">REF: {docNumber}</p>
                          <p className="text-xs text-slate-600">Date: 13-08-2026</p>
                        </div>
                      </div>

                      {/* Boxed Grid Table */}
                      <table className="w-full text-left text-xs border border-slate-900">
                        <thead className="bg-slate-100 border-b border-slate-900">
                          <tr className="font-bold text-slate-900">
                            <th className="p-2 border-r border-slate-900">Item</th>
                            <th className="p-2 border-r border-slate-900 text-center">Qty</th>
                            <th className="p-2 border-r border-slate-900 text-right">Rate</th>
                            <th className="p-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                          {sampleItems.map((item) => (
                            <tr key={item.id}>
                              <td className="p-2 border-r border-slate-300">{item.description}</td>
                              <td className="p-2 border-r border-slate-300 text-center">{item.qty}</td>
                              <td className="p-2 border-r border-slate-300 text-right">₹{item.rate.toLocaleString()}</td>
                              <td className="p-2 text-right font-bold">₹{item.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Total Box */}
                      <div className="flex justify-between items-end pt-4">
                        <div className="text-[11px] text-slate-500 font-serif max-w-xs">
                          Authorized Signatory Signature & Stamp
                          <div className="h-10 border-b border-slate-400 mt-2"></div>
                        </div>
                        <div className="border-2 border-slate-900 p-3 w-56 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-slate-900 pt-1 text-sm">
                            <span>Grand Total:</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Section */}
                <div className="border-t border-slate-100 p-4 bg-slate-50 text-center text-[11px] text-slate-400">
                  <p>Generated automatically via UltraKey Enterprise Billing. Valid and authenticated without physical signature.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
