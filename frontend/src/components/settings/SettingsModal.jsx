import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Banknote,
  Bold,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  FileDown,
  FileText,
  Italic,
  KeyRound,
  Languages,
  Link,
  Loader2,
  Mail,
  Percent,
  Receipt,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Underline,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import useSettings from "../../hooks/useSettings";
import { useAuth } from "../../context/AuthContext";
import TemplatePreviewModal from "./TemplatePreviewModal";
import DynamicUpiQr from "../payments/DynamicUpiQr";

const LANGUAGE_PRESETS = {
  English: {
    language: "English",
    quoteLabel: "Quote",
    quoteLabelPlural: "Quotes",
    invoiceLabel: "Tax Invoice",
    invoiceLabelPlural: "Invoices",
    labelHrsQty: "Hrs/Qty",
    labelService: "Service",
    labelRatePrice: "Rate/Price",
    labelAdjust: "Adjust",
    labelSubTotal: "Sub Total",
    labelDiscount: "Discount",
    labelTotal: "Total",
    labelTotalDue: "Total Due",
  },
  Hindi: {
    language: "Hindi",
    quoteLabel: "कोटेशन",
    quoteLabelPlural: "कोटेशन्स",
    invoiceLabel: "कर इनवॉयस",
    invoiceLabelPlural: "इनवॉयस",
    labelHrsQty: "मात्रा/घंटे",
    labelService: "सेवा विवरण",
    labelRatePrice: "दर/मूल्य",
    labelAdjust: "समायोजन",
    labelSubTotal: "उप-कुल",
    labelDiscount: "छूट",
    labelTotal: "कुल राशि",
    labelTotalDue: "कुल देय",
  },
  Telugu: {
    language: "Telugu",
    quoteLabel: "కొటేషన్",
    quoteLabelPlural: "కొటేషన్లు",
    invoiceLabel: "పన్ను ఇన్వాయిస్",
    invoiceLabelPlural: "ఇన్వాయిస్లు",
    labelHrsQty: "పరిమాణం/గంటలు",
    labelService: "సేవ వివరాలు",
    labelRatePrice: "ధర/రేటు",
    labelAdjust: "సర్దుబాటు",
    labelSubTotal: "మొత్తం",
    labelDiscount: "రాయితీ",
    labelTotal: "మొత్తం మొత్తం",
    labelTotalDue: "చెల్లించాల్సిన మొత్తం",
  },
  Spanish: {
    language: "Spanish",
    quoteLabel: "Cotización",
    quoteLabelPlural: "Cotizaciones",
    invoiceLabel: "Factura",
    invoiceLabelPlural: "Facturas",
    labelHrsQty: "Horas/Cant",
    labelService: "Servicio",
    labelRatePrice: "Precio",
    labelAdjust: "Ajuste",
    labelSubTotal: "Subtotal",
    labelDiscount: "Descuento",
    labelTotal: "Total",
    labelTotalDue: "Total a Pagar",
  },
  French: {
    language: "French",
    quoteLabel: "Devis",
    quoteLabelPlural: "Devis",
    invoiceLabel: "Facture",
    invoiceLabelPlural: "Factures",
    labelHrsQty: "Heures/Qté",
    labelService: "Description",
    labelRatePrice: "Tarif",
    labelAdjust: "Ajustement",
    labelSubTotal: "Sous-total",
    labelDiscount: "Remise",
    labelTotal: "Total",
    labelTotalDue: "Net à payer",
  },
  German: {
    language: "German",
    quoteLabel: "Angebot",
    quoteLabelPlural: "Angebote",
    invoiceLabel: "Rechnung",
    invoiceLabelPlural: "Rechnungen",
    labelHrsQty: "Std/Menge",
    labelService: "Leistung",
    labelRatePrice: "Preis",
    labelAdjust: "Korrektur",
    labelSubTotal: "Zwischensumme",
    labelDiscount: "Rabatt",
    labelTotal: "Gesamt",
    labelTotalDue: "Fälliger Betrag",
  },
  Arabic: {
    language: "Arabic",
    quoteLabel: "عرض أسعار",
    quoteLabelPlural: "عروض أسعار",
    invoiceLabel: "فاتورة ضريبية",
    invoiceLabelPlural: "فواتير",
    labelHrsQty: "الكمية/الساعات",
    labelService: "الخدمة",
    labelRatePrice: "السعر",
    labelAdjust: "تعديل",
    labelSubTotal: "المجموع الفرعي",
    labelDiscount: "الخصم",
    labelTotal: "الإجمالي",
    labelTotalDue: "المبلغ المستحق",
  },
};

const SETTING_CONFIGS = {
  general: {
    title: "General Settings",
    subtitle: "Configure regional, date, currency, and timezone preferences",
    icon: Settings,
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  business: {
    title: "Business Profile",
    subtitle: "Manage company identity, contact numbers, and registered office",
    icon: Building2,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  tax: {
    title: "Tax & GST Configuration",
    subtitle: "Manage GST rates, CGST/SGST/IGST breakdown, and tax defaults",
    icon: Percent,
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  payments: {
    title: "Payment Gateways & Methods",
    subtitle: "Configure Razorpay, UPI IDs, direct bank accounts, and cash settlement",
    icon: CreditCard,
    color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  invoice: {
    title: "Invoice Defaults",
    subtitle: "Set invoice prefix, sequence counter, default payment terms, and notes",
    icon: Receipt,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  quotation: {
    title: "Quotation Settings",
    subtitle: "Set quotation prefix, validity timeframe, and default proposal scope",
    icon: FileText,
    color: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  },
  emails: {
    title: "Email & SMTP Configuration",
    subtitle: "Configure outbound mail server, ports, credentials, and sender name",
    icon: Mail,
    color: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  },
  pdf: {
    title: "PDF Customizer",
    subtitle: "Configure document paper format, primary accent color, and branding",
    icon: FileDown,
    color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  },
  translate: {
    title: "Language & Localization",
    subtitle: "Set default workspace language and custom translation phrases",
    icon: Languages,
    color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  },
  extras: {
    title: "System Extras",
    subtitle: "Configure dark mode preferences, debug logs, and maintenance mode",
    icon: SlidersHorizontal,
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  license: {
    title: "License & System Info",
    subtitle: "Verify software tier, workspace activation key, and version info",
    icon: KeyRound,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
};

export default function SettingsModal({
  open,
  category: initialCategory = "general",
  onClose,
  onSaved,
}) {
  const { settings, updateSettings } = useSettings();
  const { updateUser } = useAuth();
  const [category, setCategory] = useState(initialCategory || "general");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("quotation");

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory, open]);

  const config = SETTING_CONFIGS[category] || SETTING_CONFIGS.general;
  const Icon = config.icon;

  useEffect(() => {
    if (open && category) {
      const current = settings?.[category] || {};
      setForm({ ...current });
    }
  }, [open, category, settings]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    try {
      setSaving(true);
      await updateSettings(category, form);
      if (category === "business") {
        updateUser?.({
          name: form.companyName || form.businessName,
          company_name: form.companyName || form.businessName,
        });
      }
      toast.success(`${config.title} updated successfully`);
      onSaved?.(form);
      onClose?.();
    } catch (err) {
      console.error(`Save ${category} error:`, err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        `Unable to save ${config.title}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="settings-modal"
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !saving) {
                onClose?.();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {config.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {config.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* RENDER CATEGORY-SPECIFIC FIELDS */}
                {category === "general" && (
                  <div className="space-y-6">
                    {/* Notice Banner */}
                    <div className="rounded-2xl bg-indigo-50/80 p-3.5 border border-indigo-100 text-xs text-indigo-900 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300">
                      <p className="font-semibold">
                        Here you will find all of the General application settings. Configure your financial year and pre-defined line items.
                      </p>
                    </div>

                    {/* Section 1: Financial Year Configuration */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Financial Year Cycle
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Financial Year Start
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The start date of your financial year (e.g. 01 Apr for India).
                          </p>
                          <input
                            type="text"
                            placeholder="01 Apr"
                            value={form.financialYearStart || ""}
                            onChange={(e) => update("financialYearStart", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Financial Year End
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The end date of your financial year (e.g. 31 Mar for India).
                          </p>
                          <input
                            type="text"
                            placeholder="31 Mar"
                            value={form.financialYearEnd || ""}
                            onChange={(e) => update("financialYearEnd", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Pre-defined Line Items */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                          Pre-defined Line Items
                        </label>
                        <p className="text-[11px] text-slate-400 mb-2">
                          Comma-separated list of common items shown as suggestions when adding line items.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="e.g. Web Design, Hosting, Maintenance, Support"
                          value={form.predefinedItems || ""}
                          onChange={(e) => update("predefinedItems", e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono leading-relaxed"
                        />
                      </div>

                      {/* Interactive Item Tags Preview */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Active Suggestion Pills:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(form.predefinedItems || "")
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                              >
                                + {item}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Regional & Localization Defaults */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Regional & Time Preferences
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Default Currency
                          </label>
                          <select
                            value={form.currency || ""}
                            onChange={(e) => update("currency", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          >
                            <option value="INR">Indian Rupee (₹ - INR)</option>
                            <option value="USD">US Dollar ($ - USD)</option>
                            <option value="EUR">Euro (€ - EUR)</option>
                            <option value="GBP">British Pound (£ - GBP)</option>
                            <option value="AED">UAE Dirham (AED)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Date Format
                          </label>
                          <select
                            value={form.dateFormat || ""}
                            onChange={(e) => update("dateFormat", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Timezone
                          </label>
                          <select
                            value={form.timezone || ""}
                            onChange={(e) => update("timezone", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          >
                            <option value="Asia/Kolkata">India (IST - UTC+5:30)</option>
                            <option value="UTC">UTC (Universal Time)</option>
                            <option value="Asia/Dubai">Dubai (GST - UTC+4)</option>
                            <option value="America/New_York">New York (ET)</option>
                            <option value="Europe/London">London (GMT/BST)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {category === "business" && (
                  <div className="space-y-5">
                    {/* Notice banner */}
                    <div className="rounded-2xl bg-blue-50/80 p-3.5 border border-blue-100 text-xs text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300">
                      <p className="font-semibold">
                        All of the Business Details below will be displayed on the Quotes & Invoices.
                      </p>
                    </div>

                    {/* Logo Upload Section */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Logo
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Logo Preview */}
                        <div className="flex h-16 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 overflow-hidden shadow-sm">
                          {form.logoUrl || form.logo ? (
                            <img
                              src={form.logoUrl || form.logo}
                              alt="Business Logo Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              {form.businessName || form.companyName || ""}
                            </span>
                          )}
                        </div>

                        {/* Upload Button */}
                        <div className="space-y-1.5 flex-1">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-700">
                            <span>Add or Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    update("logoUrl", reader.result);
                                    update("logo", reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {form.logoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                update("logoUrl", "");
                                update("logo", "");
                              }}
                              className="ml-3 text-xs text-red-500 hover:underline font-semibold"
                            >
                              Remove Logo
                            </button>
                          )}

                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Logo of your business. If no logo is added, the name of your business will be used instead.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Business Name & Website */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. UltraKey Tech"
                          value={form.businessName || form.companyName || ""}
                          onChange={(e) => {
                            update("businessName", e.target.value);
                            update("companyName", e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Website
                        </label>
                        <input
                          type="text"
                          placeholder="https://example.com"
                          value={form.website || ""}
                          onChange={(e) => update("website", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Contact Info Row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Business Email
                        </label>
                        <input
                          type="email"
                          placeholder="billing@company.com"
                          value={form.email || ""}
                          onChange={(e) => update("email", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.phone || ""}
                          onChange={(e) => update("phone", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Address
                      </label>
                      <p className="text-[11px] text-slate-400 mb-1.5">
                        Add your full address and format it anyway you like. Basic HTML is allowed.
                      </p>
                      <textarea
                        rows={3}
                        placeholder="Street 12, Cyber City, Hyderabad, 500001, India"
                        value={form.address || ""}
                        onChange={(e) => update("address", e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                      />
                    </div>

                    {/* Extra Business Info */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Extra Business Info
                      </label>
                      <p className="text-[11px] text-slate-400 mb-1.5">
                        Extra business info such as Business Number, phone number or email address. Basic HTML is allowed. You can add your VAT number or ABN here.
                      </p>
                      <textarea
                        rows={3}
                        placeholder="GSTIN: 22AAAAA0000A1Z5&#10;CIN: U72200TG2020PTC123456&#10;MSME Reg: UDYAM-TS-00-12345"
                        value={form.extraBusinessInfo || form.extraInfo || ""}
                        onChange={(e) => {
                          update("extraBusinessInfo", e.target.value);
                          update("extraInfo", e.target.value);
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {category === "tax" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Tax Name
                        </label>
                        <select
                          value={form.taxName || "GST"}
                          onChange={(e) => update("taxName", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        >
                          <option value="GST">GST (Goods & Services Tax)</option>
                          <option value="VAT">VAT (Value Added Tax)</option>
                          <option value="Tax">Sales Tax</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Default Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={form.defaultRate ?? 18}
                          onChange={(e) => update("defaultRate", Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          CGST (%)
                        </label>
                        <input
                          type="number"
                          value={form.cgstRate ?? 9}
                          onChange={(e) => update("cgstRate", Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          SGST (%)
                        </label>
                        <input
                          type="number"
                          value={form.sgstRate ?? 9}
                          onChange={(e) => update("sgstRate", Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          IGST (%)
                        </label>
                        <input
                          type="number"
                          value={form.igstRate ?? 18}
                          onChange={(e) => update("igstRate", Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="tax-enabled-toggle"
                        checked={form.enabled !== false}
                        onChange={(e) => update("enabled", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="tax-enabled-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Enable automated GST / tax calculation on invoices & quotes
                      </label>
                    </div>
                  </div>
                )}

                {category === "payments" && (
                  <div className="space-y-6">
                    {/* Context notice */}
                    <div className="rounded-2xl bg-violet-50/80 p-3.5 border border-violet-100 text-xs text-violet-900 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300">
                      <p className="font-semibold">
                        Here you will find all of the Payment related settings.
                      </p>
                    </div>

                    {/* Section 1: Currency & Number Formatting */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Currency & Formatting
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Currency Symbol
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The symbol used for your currency (e.g. ₹, $, €).
                          </p>
                          <input
                            type="text"
                            placeholder="₹"
                            value={form.currencySymbol ?? "₹"}
                            onChange={(e) => update("currencySymbol", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Currency Position
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Where to display the currency symbol relative to the amount.
                          </p>
                          <select
                            value={form.currencyPosition || "left"}
                            onChange={(e) => update("currencyPosition", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          >
                            <option value="left">Left ($100.00)</option>
                            <option value="right">Right (100.00$)</option>
                            <option value="left_space">Left with space ($ 100.00)</option>
                            <option value="right_space">Right with space (100.00 $)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Thousand Separator
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Character used as thousands separator. Leave blank for none.
                          </p>
                          <input
                            type="text"
                            placeholder=","
                            value={form.thousandSeparator ?? ","}
                            onChange={(e) => update("thousandSeparator", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-mono text-center outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Decimal Separator
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Character used as decimal separator.
                          </p>
                          <input
                            type="text"
                            placeholder="."
                            value={form.decimalSeparator ?? "."}
                            onChange={(e) => update("decimalSeparator", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-mono text-center outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Number of Decimals
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Number of decimal places to display.
                          </p>
                          <input
                            type="number"
                            min="0"
                            max="4"
                            value={form.decimalPlaces ?? 2}
                            onChange={(e) => update("decimalPlaces", Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-center outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Payment Page & Portal */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Payment Page & Portal
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Payment Page
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Choose a page to use for PayPal and other payment gateway messages and confirmations.
                        </p>
                        <select
                          value={form.paymentPage || "payment"}
                          onChange={(e) => update("paymentPage", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        >
                          <option value="payment">Payment</option>
                          <option value="checkout">Checkout Portal</option>
                          <option value="invoice_pay">Invoice Direct Pay</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Payment Page Footer
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          The footer will be displayed at the bottom of the payment page. Basic HTML is allowed.
                        </p>
                        <textarea
                          rows={2}
                          placeholder='Thanks for choosing <a href="https://ultrakeyit.com" target="_blank">Ultrakey IT Solutions Private Limited</a> | <a href="mailto:support@ultrakeyit.com">support@ultrakeyit.com</a>'
                          value={form.paymentPageFooter || ""}
                          onChange={(e) => update("paymentPageFooter", e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 3: Payment Methods (Bank & Generic) */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Payment Methods & Instructions
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Bank Details
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Add your bank account details if you wish to allow direct bank deposits. HTML is allowed.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="Bank Name: State Bank of India&#10;Account: 123456789012&#10;IFSC: SBIN0001234&#10;Branch: Hitec City, Hyderabad"
                          value={form.bankDetailsText || form.bankInstructions || ""}
                          onChange={(e) => {
                            update("bankDetailsText", e.target.value);
                            update("bankInstructions", e.target.value);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Generic Payment
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Set a generic message or include further instructions for the user on how to pay. HTML is allowed.
                        </p>
                        <textarea
                          rows={3}
                          placeholder='Pay Invoice amount via one of the options mentioned in the below&#10;<a href="https://pages.razorpay.com/ultrakeyitinvoices" target="_blank">1. Click here for Online Payment through Razorpay</a>'
                          value={form.genericPaymentText || ""}
                          onChange={(e) => update("genericPaymentText", e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono text-indigo-700 dark:text-indigo-300"
                        />
                      </div>
                    </div>

                    {/* Section 4: Gateways (Razorpay, UPI, Gateway Email) */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Payment Gateway Integration
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Razorpay / Gateway Email
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Enter your PayPal or gateway email to enable online payments on invoices.
                        </p>
                        <input
                          type="email"
                          placeholder="payments@yourbusiness.com"
                          value={form.gatewayEmail || form.paypalEmail || ""}
                          onChange={(e) => {
                            update("gatewayEmail", e.target.value);
                            update("paypalEmail", e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-violet-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      {/* Razorpay section */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Razorpay API Keys</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.razorpayEnabled !== false}
                            onChange={(e) => update("razorpayEnabled", e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                          />
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="Razorpay Key ID (rzp_live_...)"
                            value={form.razorpayKeyId || ""}
                            onChange={(e) => update("razorpayKeyId", e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                          />
                          <input
                            type="password"
                            placeholder="Razorpay Key Secret"
                            value={form.razorpaySecretKey || ""}
                            onChange={(e) => update("razorpaySecretKey", e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                          />
                        </div>

                        <div>
                          <input
                            type="password"
                            placeholder="Razorpay Webhook Secret (e.g. whsec_...)"
                            value={form.razorpayWebhookSecret || ""}
                            onChange={(e) => update("razorpayWebhookSecret", e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                          />
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Required to verify webhook events from Razorpay Dashboard.
                          </p>
                        </div>
                      </div>

                      {/* UPI QR section */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone size={16} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Direct UPI / QR</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.upiEnabled !== false}
                            onChange={(e) => update("upiEnabled", e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                          />
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="UPI ID (e.g. company@okhdfcbank)"
                            value={form.upiId || ""}
                            onChange={(e) => update("upiId", e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                          />
                          <input
                            type="text"
                            placeholder="UPI Payee Name"
                            value={form.upiName || ""}
                            onChange={(e) => update("upiName", e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                          />
                        </div>

                        {/* Live Dynamic UPI QR Preview */}
                        {form.upiId && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                            <div className="text-left">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Live Dynamic QR Preview
                              </span>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Scan with your phone camera or any UPI app to verify.
                              </p>
                            </div>
                            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                              <DynamicUpiQr
                                upiId={form.upiId}
                                payeeName={form.upiName || form.companyName || "Merchant"}
                                amount={1.00}
                                invoiceNumber="TEST-001"
                                size={70}
                                showApps={false}
                                showCopy={false}
                                showDetails={false}
                                allowEnlarge={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Manual Cash Payment section */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Banknote size={16} className="text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Manual Cash Payment</span>
                          </div>
                          <input
                            type="checkbox"
                            id="cash-enabled-toggle"
                            checked={form.cashEnabled !== false}
                            onChange={(e) => update("cashEnabled", e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">
                              Counter / Collection Branch
                            </label>
                            <input
                              type="text"
                              placeholder="Main Billing Counter, Cyber City Office"
                              value={form.cashBranch || ""}
                              onChange={(e) => update("cashBranch", e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">
                              Cash Receipt Note
                            </label>
                            <input
                              type="text"
                              placeholder="Physical cash receipt issued on handover"
                              value={form.cashReceiptNote || ""}
                              onChange={(e) => update("cashReceiptNote", e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            Cash Settlement Instructions
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Pay directly in cash at our billing counter. A stamped physical receipt will be generated immediately."
                            value={form.cashInstructions || ""}
                            onChange={(e) => update("cashInstructions", e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700 resize-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {category === "invoice" && (
                  <div className="space-y-6">
                    {/* Context notice */}
                    <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-100 text-xs text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300">
                      <p className="font-semibold">
                        Here you will find all the settings for invoices.
                      </p>
                    </div>

                    {/* Section 1: Numbering & Format */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Numbering & Format
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Prefix
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Prefix before each Invoice number. Can be left blank if you don't need a prefix.
                          </p>
                          <input
                            type="text"
                            placeholder="INV-"
                            value={form.prefix || ""}
                            onChange={(e) => update("prefix", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold uppercase outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Suffix
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Suffix after each Invoice number. Can be left blank if you don't need a suffix.
                          </p>
                          <input
                            type="text"
                            placeholder="/2026"
                            value={form.suffix || ""}
                            onChange={(e) => update("suffix", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold uppercase outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="inv-auto-increment"
                            checked={form.autoIncrement !== false}
                            onChange={(e) => update("autoIncrement", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <label htmlFor="inv-auto-increment" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              Auto Increment
                            </label>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Yes, increment Invoice numbers by one. Recommended.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Next Number
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The next number to use for auto incrementing. Can use leading zeros.
                          </p>
                          <input
                            type="text"
                            placeholder="0001"
                            value={form.nextNumber || ""}
                            onChange={(e) => update("nextNumber", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Due Date
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Number of days each Invoice is due after the created date. This will automatically set the date in the 'Due Date' field. Can be overridden on individual Invoices.
                          </p>
                          <input
                            type="number"
                            min="1"
                            value={form.defaultDueDays ?? form.dueDays ?? ""}
                            onChange={(e) => {
                              update("defaultDueDays", Number(e.target.value));
                              update("dueDays", Number(e.target.value));
                            }}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div className="flex items-start gap-2.5 pt-6">
                          <input
                            type="checkbox"
                            id="inv-hide-adjust"
                            checked={form.hideAdjust === true}
                            onChange={(e) => update("hideAdjust", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <label htmlFor="inv-hide-adjust" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              Hide Adjust Field
                            </label>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Yes, hide the Adjust field on line items. I won't need this field.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Terms & Conditions & Footer */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Terms & Content
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Terms & Conditions
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Terms and conditions displayed on the Invoice. Can be overridden on individual Invoices.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="Payment due within 15 days of invoice date. Late fees apply after grace period."
                          value={form.defaultTerms ?? form.terms ?? ""}
                          onChange={(e) => {
                            update("defaultTerms", e.target.value);
                            update("terms", e.target.value);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Footer
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          The footer will be displayed at the bottom of each Invoice. Basic HTML is allowed.
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Thank you for your business! For queries, contact billing@company.com"
                          value={form.defaultFooter ?? form.footer ?? ""}
                          onChange={(e) => {
                            update("defaultFooter", e.target.value);
                            update("footer", e.target.value);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 3: Admin Notices */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Admin Notices
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        These settings allow you to choose which notices may be displayed in your Admin area. (Note: this is different from admin emails, which you can configure on the Email Settings tab.)
                      </p>

                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Show me notices when</p>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.noticeViewed !== false}
                              onChange={(e) => update("noticeViewed", e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            Invoice Viewed
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.noticePaid !== false}
                              onChange={(e) => update("noticePaid", e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            Invoice Paid
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Template Design & Dynamic Live Preview */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Template Design
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Select a template and view the live dynamic preview before saving.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPreviewType("invoice");
                            setPreviewOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 transition border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 shadow-sm"
                        >
                          <Eye size={13} />
                          <span>Live Full Preview</span>
                        </button>
                      </div>

                      {/* Template Picker */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "template1", name: "Template 1", desc: "Modern Corporate", color: "from-slate-900 to-indigo-950" },
                          { id: "template2", name: "Template 2", desc: "Clean Minimal", color: "from-slate-100 to-slate-200 text-slate-800" },
                          { id: "template3", name: "Template 3", desc: "Tech Indigo", color: "from-indigo-600 to-blue-700" },
                        ].map((tmpl) => {
                          const isSelected = (form.selectedTemplate || "template1") === tmpl.id;
                          return (
                            <div
                              key={tmpl.id}
                              onClick={() => update("selectedTemplate", tmpl.id)}
                              className={`cursor-pointer rounded-2xl border-2 p-3 transition text-center relative overflow-hidden ${isSelected
                                  ? "border-amber-600 bg-amber-50/50 shadow-md dark:border-amber-500 dark:bg-amber-500/10"
                                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                                }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white shadow">
                                  <CheckCircle2 size={12} />
                                </div>
                              )}
                              <div className={`h-12 w-full rounded-xl bg-gradient-to-br ${tmpl.color} mb-2 flex items-center justify-center shadow-inner`}>
                                <Receipt size={18} className={tmpl.id === "template2" ? "text-slate-700" : "text-white/90"} />
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{tmpl.name}</p>
                              <span className="text-[10px] font-semibold text-slate-400">{tmpl.desc}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dynamic Invoice Live Preview Box */}
                      <div
                        onClick={() => {
                          setPreviewType("invoice");
                          setPreviewOpen(true);
                        }}
                        className="cursor-pointer group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-400 transition dark:border-slate-700 dark:bg-slate-900 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Live Preview: {(form.selectedTemplate || "template1").toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            {form.prefix ?? "INV-"}-0001 (Click for Full Preview)
                          </span>
                        </div>

                        {/* TEMPLATE 1: MODERN SLATE */}
                        {(!form.selectedTemplate || form.selectedTemplate === "template1") && (
                          <div className="rounded-xl border border-slate-800 bg-slate-950 text-white p-4 text-[11px] space-y-3 shadow-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-white text-sm">UltraKey Tech</p>
                                <p className="text-slate-400 text-[10px]">Cyber City, Hyderabad • GSTIN: 36AAAAA0000A1Z5</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-block rounded-lg bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                                  Tax Invoice
                                </span>
                                <p className="text-slate-400 mt-0.5 text-[10px]">Due: {form.defaultDueDays || form.dueDays || 15} Days</p>
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-2 space-y-1.5">
                              <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                                <span>Service / Product</span>
                                <span>Total</span>
                              </div>
                              <div className="flex justify-between text-slate-200">
                                <span>Enterprise Software License & Deployment</span>
                                <span className="font-bold text-white">₹82,600.00</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-xs">
                              <span className="text-slate-400">Total Due</span>
                              <span className="text-indigo-400 text-sm">₹82,600.00</span>
                            </div>
                          </div>
                        )}

                        {/* TEMPLATE 2: CLEAN MINIMAL */}
                        {form.selectedTemplate === "template2" && (
                          <div className="rounded-xl border-2 border-slate-200 bg-white text-slate-900 p-4 text-[11px] space-y-3 shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div>
                                <p className="font-light tracking-tight text-slate-900 text-sm uppercase">UltraKey Tech</p>
                                <p className="text-slate-400 text-[10px]">Hyderabad, India</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Invoice</p>
                                <p className="text-slate-700 font-mono text-[10px]">Date: 13 Aug 2026</p>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-slate-600">
                              <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
                                <span>Description</span>
                                <span>Amount</span>
                              </div>
                              <div className="flex justify-between text-slate-800">
                                <span>Enterprise Software License & Deployment</span>
                                <span className="font-medium">₹82,600.00</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-xs text-slate-900">
                              <span className="text-slate-500">Balance Due</span>
                              <span className="text-slate-900 text-sm">₹82,600.00</span>
                            </div>
                          </div>
                        )}

                        {/* TEMPLATE 3: TECH INDIGO */}
                        {form.selectedTemplate === "template3" && (
                          <div className="rounded-xl bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-4 text-[11px] space-y-3 shadow-lg border border-indigo-500/30">
                            <div className="flex items-center justify-between rounded-xl bg-white/10 p-2.5 backdrop-blur-sm border border-white/10">
                              <div>
                                <span className="inline-block rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-black uppercase text-white mb-0.5">
                                  Invoice #{form.prefix || "INV-"}-0001
                                </span>
                                <p className="font-black text-white text-sm">UltraKey Tech</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-indigo-300">Due in {form.defaultDueDays || form.dueDays || 15} Days</p>
                              </div>
                            </div>

                            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-indigo-500/20 space-y-1">
                              <div className="flex justify-between text-indigo-200 text-[10px]">
                                <span>Enterprise Software License & Deployment</span>
                                <span className="font-black text-white">₹82,600.00</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center rounded-lg bg-indigo-600 px-3 py-2 text-white font-black text-xs shadow">
                              <span className="text-indigo-100">Amount Due</span>
                              <span className="text-sm">₹82,600.00</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custom CSS */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Custom CSS
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Add custom CSS to your Invoice.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="body { font-family: 'Inter', sans-serif; }"
                          value={form.customCss || "body {}"}
                          onChange={(e) => update("customCss", e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono text-amber-600 dark:text-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === "quotation" && (
                  <div className="space-y-6">
                    {/* Context notice */}
                    <div className="rounded-2xl bg-teal-50/80 p-3.5 border border-teal-100 text-xs text-teal-900 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-300">
                      <p className="font-semibold">
                        Here you will find all of the Quote related settings. Configure how quotes are created, managed, and displayed.
                      </p>
                    </div>

                    {/* Section 1: Numbering & Format */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Numbering & Format
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Prefix
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Prefix before each Quote number. Can be left blank if you don't need a prefix.
                          </p>
                          <input
                            type="text"
                            placeholder="AK-XX"
                            value={form.prefix ?? "AK-XX"}
                            onChange={(e) => update("prefix", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold uppercase outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Suffix
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Suffix after each Quote number. Can be left blank if you don't need a suffix.
                          </p>
                          <input
                            type="text"
                            placeholder="/2026"
                            value={form.suffix || ""}
                            onChange={(e) => update("suffix", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold uppercase outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="quote-auto-increment"
                            checked={form.autoIncrement !== false}
                            onChange={(e) => update("autoIncrement", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <label htmlFor="quote-auto-increment" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              Auto Increment
                            </label>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Yes, increment Quote numbers by one. Recommended.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Next Number
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The next number to use for auto incrementing. Can use leading zeros.
                          </p>
                          <input
                            type="text"
                            placeholder="0001"
                            value={form.nextNumber ?? "0001"}
                            onChange={(e) => update("nextNumber", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Quotes Valid For
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Number of days each Quote is valid for. This will automatically set the date in the 'Valid Until' field. Can be overridden on individual Quotes.
                          </p>
                          <input
                            type="number"
                            min="1"
                            value={form.validityDays ?? 15}
                            onChange={(e) => update("validityDays", Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div className="flex items-start gap-2.5 pt-6">
                          <input
                            type="checkbox"
                            id="quote-hide-adjust"
                            checked={form.hideAdjust === true}
                            onChange={(e) => update("hideAdjust", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <label htmlFor="quote-hide-adjust" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              Hide Adjust Field
                            </label>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Yes, hide the Adjust field on line items. I won't need this field.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Terms & Conditions & Footer */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Terms & Content
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Terms & Conditions
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Terms and conditions displayed on the Quote. Can be overridden on individual Quotes.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="Quote valid for 15 days from issue date. 50% deposit required upon acceptance."
                          value={form.defaultTerms ?? form.terms ?? ""}
                          onChange={(e) => {
                            update("defaultTerms", e.target.value);
                            update("terms", e.target.value);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Footer
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          The footer will be displayed at the bottom of each Quote. Basic HTML is allowed.
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Thank you for considering our proposal! For questions, please reach out to hello@company.com"
                          value={form.defaultFooter ?? form.footer ?? ""}
                          onChange={(e) => {
                            update("defaultFooter", e.target.value);
                            update("footer", e.target.value);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 3: Accepting Quotes */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Accepting Quotes
                      </h3>

                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="quote-accept-btn"
                          checked={form.showAcceptButton !== false}
                          onChange={(e) => update("showAcceptButton", e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <label htmlFor="quote-accept-btn" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                            Accept Quote Button
                          </label>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                            Yes, show the "Accept Quote" button on Quotes.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Accepted Quote Action
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Actions to perform automatically when client accepts a Quote.
                        </p>
                        <select
                          value={form.acceptedAction || "convert_and_send"}
                          onChange={(e) => update("acceptedAction", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        >
                          <option value="convert_and_send">Convert Quote to Invoice and send to client</option>
                          <option value="convert_draft">Convert Quote to Invoice (Save as Draft)</option>
                          <option value="mark_accepted">Mark as Accepted only</option>
                        </select>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Accept Quote Text
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Text to add on the 'Accept Quote' popup. Basic HTML is allowed.
                          </p>
                          <textarea
                            rows={2}
                            placeholder="By accepting this quote, you authorize us to begin project setup."
                            value={form.acceptText || ""}
                            onChange={(e) => update("acceptText", e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Accepted Quote Message
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Message to display if client accepts the Quote. Basic HTML is allowed.
                          </p>
                          <textarea
                            rows={2}
                            placeholder="Thank you! Your quote has been accepted and we have notified the team."
                            value={form.acceptedMessage || ""}
                            onChange={(e) => update("acceptedMessage", e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="quote-decline-req"
                            checked={form.declineReasonRequired === true}
                            onChange={(e) => update("declineReasonRequired", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <label htmlFor="quote-decline-req" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              Decline Reason Required
                            </label>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Yes, make the "Reason for declining" field required.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Declined Quote Message
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            Message to display if client declines the Quote. Basic HTML is allowed. Leave blank for the default message.
                          </p>
                          <textarea
                            rows={2}
                            placeholder="Thank you for your feedback. We appreciate your consideration."
                            value={form.declinedMessage || ""}
                            onChange={(e) => update("declinedMessage", e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Admin Notices */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Admin Notices
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        These settings allow you to choose which notices may be displayed in your Admin area. (Note: this is different from admin emails, which you can configure on the Email Settings tab.)
                      </p>

                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Show me notices when</p>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.noticeViewed !== false}
                              onChange={(e) => update("noticeViewed", e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            Quote Viewed
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.noticeAccepted !== false}
                              onChange={(e) => update("noticeAccepted", e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            Quote Accepted
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Template Design & Dynamic Live Preview */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Template Design
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Select a template and view the live dynamic preview before saving.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPreviewType("quotation");
                            setPreviewOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 transition border border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-300 shadow-sm"
                        >
                          <Eye size={13} />
                          <span>Live Full Preview</span>
                        </button>
                      </div>

                      {/* Template Picker */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "template1", name: "Template 1", desc: "Modern Slate", color: "from-slate-900 to-teal-900" },
                          { id: "template2", name: "Template 2", desc: "Clean Minimal", color: "from-slate-100 to-slate-200 text-slate-800" },
                          { id: "template3", name: "Template 3", desc: "Creative Pitch", color: "from-teal-600 to-indigo-700" },
                        ].map((tmpl) => {
                          const isSelected = (form.selectedTemplate || "template1") === tmpl.id;
                          return (
                            <div
                              key={tmpl.id}
                              onClick={() => update("selectedTemplate", tmpl.id)}
                              className={`cursor-pointer rounded-2xl border-2 p-3 transition text-center relative overflow-hidden ${isSelected
                                  ? "border-teal-600 bg-teal-50/50 shadow-md dark:border-teal-500 dark:bg-teal-500/10"
                                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                                }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white shadow">
                                  <CheckCircle2 size={12} />
                                </div>
                              )}
                              <div className={`h-12 w-full rounded-xl bg-gradient-to-br ${tmpl.color} mb-2 flex items-center justify-center shadow-inner`}>
                                <FileText size={18} className={tmpl.id === "template2" ? "text-slate-700" : "text-white/90"} />
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{tmpl.name}</p>
                              <span className="text-[10px] font-semibold text-slate-400">{tmpl.desc}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dynamic Live Preview Box */}
                      <div
                        onClick={() => {
                          setPreviewType("quotation");
                          setPreviewOpen(true);
                        }}
                        className="cursor-pointer group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-400 transition dark:border-slate-700 dark:bg-slate-900 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Live Preview: {(form.selectedTemplate || "template1").toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-teal-50 px-2 py-0.5 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            {form.prefix ?? "AK-XX"}-0001 (Click for Full Preview)
                          </span>
                        </div>

                        {/* TEMPLATE 1: MODERN SLATE */}
                        {(!form.selectedTemplate || form.selectedTemplate === "template1") && (
                          <div className="rounded-xl border border-slate-800 bg-slate-950 text-white p-4 text-[11px] space-y-3 shadow-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-white text-sm">UltraKey Tech</p>
                                <p className="text-slate-400 text-[10px]">Cyber City, Hyderabad • GSTIN: 36AAAAA0000A1Z5</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-block rounded-lg bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-teal-300 border border-teal-500/30">
                                  Quotation Proposal
                                </span>
                                <p className="text-slate-400 mt-0.5 text-[10px]">Valid: {form.validityDays || 15} Days</p>
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-2 space-y-1.5">
                              <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                                <span>Scope & Deliverable</span>
                                <span>Amount</span>
                              </div>
                              <div className="flex justify-between text-slate-200">
                                <span>Enterprise Full-Stack Application</span>
                                <span className="font-bold text-white">₹45,000.00</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-xs">
                              <span className="text-slate-400">Grand Total</span>
                              <span className="text-teal-400 text-sm">₹45,000.00</span>
                            </div>
                          </div>
                        )}

                        {/* TEMPLATE 2: CLEAN MINIMAL */}
                        {form.selectedTemplate === "template2" && (
                          <div className="rounded-xl border-2 border-slate-200 bg-white text-slate-900 p-4 text-[11px] space-y-3 shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div>
                                <p className="font-light tracking-tight text-slate-900 text-sm uppercase">UltraKey Tech</p>
                                <p className="text-slate-400 text-[10px]">Hyderabad, India</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Estimate</p>
                                <p className="text-slate-700 font-mono text-[10px]">Date: 13 Aug 2026</p>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-slate-600">
                              <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
                                <span>Description</span>
                                <span>Price</span>
                              </div>
                              <div className="flex justify-between text-slate-800">
                                <span>Enterprise Full-Stack Application</span>
                                <span className="font-medium">₹45,000.00</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-xs text-slate-900">
                              <span className="text-slate-500">Total Payable</span>
                              <span className="text-slate-900 text-sm">₹45,000.00</span>
                            </div>
                          </div>
                        )}

                        {/* TEMPLATE 3: CREATIVE PITCH */}
                        {form.selectedTemplate === "template3" && (
                          <div className="rounded-xl bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-4 text-[11px] space-y-3 shadow-lg border border-indigo-500/30">
                            <div className="flex items-center justify-between rounded-xl bg-white/10 p-2.5 backdrop-blur-sm border border-white/10">
                              <div>
                                <span className="inline-block rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-black uppercase text-white mb-0.5">
                                  Verified Proposal
                                </span>
                                <p className="font-black text-white text-sm">UltraKey Tech</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-teal-300">Quote #{form.prefix ?? "AK-XX"}-0001</p>
                                <p className="text-[10px] text-indigo-200">Valid: {form.validityDays || 15} Days</p>
                              </div>
                            </div>

                            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-indigo-500/20 space-y-1">
                              <div className="flex justify-between text-indigo-200 text-[10px]">
                                <span>Enterprise Full-Stack Application</span>
                                <span className="font-black text-white">₹45,000.00</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center rounded-lg bg-indigo-600 px-3 py-2 text-white font-black text-xs shadow">
                              <span className="text-indigo-100">Total Investment</span>
                              <span className="text-sm">₹45,000.00</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custom CSS */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Custom CSS
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Add custom CSS to your Quote.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="body { font-family: 'Inter', sans-serif; }"
                          value={form.customCss || "body {}"}
                          onChange={(e) => update("customCss", e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === "emails" && (
                  <div className="space-y-6">
                    {/* Context Notice */}
                    <div className="rounded-2xl bg-sky-50/80 p-3.5 border border-sky-100 text-xs text-sky-900 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300">
                      <p className="font-semibold">
                        Here you will find all of the Email related settings. (PRO) The Easy Translate Extension adds a few extra options here for customizing emails.
                      </p>
                    </div>

                    {/* Section 1: General Email Configuration */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Sender Details & Copies
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Email Address
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The email address to send and receive notifications (probably your business email).
                          </p>
                          <input
                            type="email"
                            placeholder="billing@ultrakeyit.com"
                            value={form.emailAddress || form.fromEmail || ""}
                            onChange={(e) => {
                              update("emailAddress", e.target.value);
                              update("fromEmail", e.target.value);
                            }}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Email Name
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The name on emails to send and receive notifications (probably your Business name).
                          </p>
                          <input
                            type="text"
                            placeholder="Ultrakey IT Solutions"
                            value={form.emailName || form.fromName || ""}
                            onChange={(e) => {
                              update("emailName", e.target.value);
                              update("fromName", e.target.value);
                            }}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="email-bcc-client"
                            checked={form.bccOnClientEmails !== false}
                            onChange={(e) => update("bccOnClientEmails", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <label htmlFor="email-bcc-client" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              Bcc on Client Emails
                            </label>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Yes, send myself a copy of all client emails (Bcc). Recommended. This ensures you have a copy of the email on hand.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SMTP Transport Server Settings */}
                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/50 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            SMTP Server Host
                          </label>
                          <input
                            type="text"
                            placeholder="smtp.gmail.com"
                            value={form.smtpHost || ""}
                            onChange={(e) => update("smtpHost", e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            SMTP Port
                          </label>
                          <input
                            type="number"
                            placeholder="587"
                            value={form.smtpPort || 587}
                            onChange={(e) => update("smtpPort", Number(e.target.value))}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Quote Available Email Template */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Quote Available
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Sent to the client manually, when you click the email button.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded dark:bg-teal-900/30 dark:text-teal-300">
                          Quote Mail
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Quote %number% from %client_name%"
                          value={form.quoteSubject ?? "Quote %number% from %client_name% is ready"}
                          onChange={(e) => update("quoteSubject", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Content
                          </label>
                          <div className="flex items-center gap-1 text-[11px] bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-lg">
                            <button type="button" className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold shadow-xs">Visual</button>
                            <button type="button" className="px-2 py-0.5 rounded text-slate-500">Code</button>
                          </div>
                        </div>

                        {/* Visual formatting toolbar */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100/70 dark:bg-slate-800 dark:border-slate-700">
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Bold size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Italic size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Underline size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Link size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignLeft size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignCenter size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignRight size={13} /></button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Hi %client_first_name%,&#10;&#10;You have a new quote available ( %number% ) which can be viewed at %link%."
                          value={form.quoteContent ?? "Hi %client_first_name%,\n\nYou have a new quote available ( %number% ) which can be viewed at %link%."}
                          onChange={(e) => update("quoteContent", e.target.value)}
                          className="w-full p-3 rounded-b-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Button text
                        </label>
                        <input
                          type="text"
                          placeholder="View this quote online"
                          value={form.quoteButtonText ?? "View this quote online"}
                          onChange={(e) => update("quoteButtonText", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Section 3: Invoice Available Email Template */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Invoice Available
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Sent to the client manually, when you click the email button.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded dark:bg-indigo-900/30 dark:text-indigo-300">
                          Invoice Mail
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Invoice %number% from %client_name%"
                          value={form.invoiceSubject ?? "Invoice %number% from %client_name% is available"}
                          onChange={(e) => update("invoiceSubject", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Content
                          </label>
                          <div className="flex items-center gap-1 text-[11px] bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-lg">
                            <button type="button" className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold shadow-xs">Visual</button>
                            <button type="button" className="px-2 py-0.5 rounded text-slate-500">Code</button>
                          </div>
                        </div>

                        {/* Visual formatting toolbar */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100/70 dark:bg-slate-800 dark:border-slate-700">
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Bold size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Italic size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Underline size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Link size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignLeft size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignCenter size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignRight size={13} /></button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Hi %client_first_name%,&#10;&#10;You have a new invoice available ( %number% ) which can be viewed at %link%."
                          value={form.invoiceContent ?? "Hi %client_first_name%,\n\nYou have a new invoice available ( %number% ) which can be viewed at %link%."}
                          onChange={(e) => update("invoiceContent", e.target.value)}
                          className="w-full p-3 rounded-b-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Button text
                        </label>
                        <input
                          type="text"
                          placeholder="View this invoice online"
                          value={form.invoiceButtonText ?? "View this invoice online"}
                          onChange={(e) => update("invoiceButtonText", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Section 4: Payment Received Email Template */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Payment Received
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Sent to the client automatically, when they make a payment.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded dark:bg-emerald-900/30 dark:text-emerald-300">
                          Auto Receipt
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Payment Received for Invoice %number%"
                          value={form.paymentReceivedSubject ?? "Payment Received for Invoice %number%"}
                          onChange={(e) => update("paymentReceivedSubject", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Content
                          </label>
                          <div className="flex items-center gap-1 text-[11px] bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-lg">
                            <button type="button" className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold shadow-xs">Visual</button>
                            <button type="button" className="px-2 py-0.5 rounded text-slate-500">Code</button>
                          </div>
                        </div>

                        {/* Visual formatting toolbar */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100/70 dark:bg-slate-800 dark:border-slate-700">
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Bold size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Italic size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Underline size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Link size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignLeft size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignCenter size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignRight size={13} /></button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Hi %client_first_name%,&#10;&#10;Thank you for your payment of %last_payment% towards invoice %number%."
                          value={form.paymentReceivedContent ?? "Hi %client_first_name%,\n\nThank you for your payment of %last_payment% towards invoice %number%.\nYour updated balance can be viewed at %link%."}
                          onChange={(e) => update("paymentReceivedContent", e.target.value)}
                          className="w-full p-3 rounded-b-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 5: Payment Reminder Automation */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Payment Reminder
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Sent to the client automatically on the chosen days.
                        </p>
                      </div>

                      {/* When to send checkboxes */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            When to Send
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const allDays = ["-7", "-1", "0", "1", "7", "14", "21", "30"];
                              const current = form.reminderDays || [];
                              const next = current.length === allDays.length ? [] : allDays;
                              update("reminderDays", next);
                            }}
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 cursor-pointer"
                          >
                            Select / Deselect All
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { id: "-7", label: "7 days before Due Date" },
                            { id: "-1", label: "1 day before Due Date" },
                            { id: "0", label: "On the Due Date" },
                            { id: "1", label: "1 day after Due Date" },
                            { id: "7", label: "7 days after Due Date" },
                            { id: "14", label: "14 days after Due Date" },
                            { id: "21", label: "21 days after Due Date" },
                            { id: "30", label: "30 days after Due Date" },
                          ].map((day) => {
                            const currentDays = form.reminderDays || ["-1", "0", "7"];
                            const isChecked = currentDays.includes(day.id);
                            return (
                              <label
                                key={day.id}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-medium cursor-pointer transition ${isChecked
                                    ? "border-sky-500 bg-sky-50/70 text-sky-900 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30"
                                    : "border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let next = [...currentDays];
                                    if (e.target.checked) {
                                      if (!next.includes(day.id)) next.push(day.id);
                                    } else {
                                      next = next.filter((d) => d !== day.id);
                                    }
                                    update("reminderDays", next);
                                  }}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <span className="leading-tight">{day.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Reminder: Invoice %number% payment due on %due_date%"
                          value={form.reminderSubject ?? "Reminder: Invoice %number% payment is due"}
                          onChange={(e) => update("reminderSubject", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Content
                          </label>
                          <div className="flex items-center gap-1 text-[11px] bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-lg">
                            <button type="button" className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold shadow-xs">Visual</button>
                            <button type="button" className="px-2 py-0.5 rounded text-slate-500">Code</button>
                          </div>
                        </div>

                        {/* Visual formatting toolbar */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100/70 dark:bg-slate-800 dark:border-slate-700">
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Bold size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Italic size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Underline size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Link size={13} /></button>
                          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignLeft size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignCenter size={13} /></button>
                          <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignRight size={13} /></button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Hi %client_first_name%,&#10;&#10;This is a friendly reminder that payment for Invoice %number% ( %amount% ) is due on %due_date%."
                          value={form.reminderContent ?? "Hi %client_first_name%,\n\nThis is a friendly reminder that payment for Invoice %number% ( %amount% ) is due on %due_date%.\nYou can view and pay your invoice online at %link%."}
                          onChange={(e) => update("reminderContent", e.target.value)}
                          className="w-full p-3 rounded-b-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 6: Wildcards For Emails */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Wildcards For Emails
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        The following wildcards can be used in email subject and content above.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { code: "%client_name%", desc: "The client's business name" },
                          { code: "%client_first_name%", desc: "Client first name" },
                          { code: "%number%", desc: "Invoice/quote number" },
                          { code: "%link%", desc: "View invoice online" },
                          { code: "%amount%", desc: "Invoice total amount" },
                          { code: "%last_payment%", desc: "Amount of last payment" },
                          { code: "%due_date%", desc: "Invoice due date" },
                          { code: "%total%", desc: "Invoice total (ex payments)" },
                        ].map((wildcard) => (
                          <div key={wildcard.code} className="p-2 rounded-xl bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                            <code className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 block">{wildcard.code}</code>
                            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">{wildcard.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 7: Footer Text */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Footer Text
                        </label>
                        <div className="flex items-center gap-1 text-[11px] bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-lg">
                          <button type="button" className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold shadow-xs">Visual</button>
                          <button type="button" className="px-2 py-0.5 rounded text-slate-500">Code</button>
                        </div>
                      </div>

                      {/* Visual formatting toolbar */}
                      <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100/70 dark:bg-slate-800 dark:border-slate-700">
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Bold size={13} /></button>
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Italic size={13} /></button>
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Underline size={13} /></button>
                        <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><Link size={13} /></button>
                        <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignLeft size={13} /></button>
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignCenter size={13} /></button>
                        <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><AlignRight size={13} /></button>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Enter footer text shown at bottom of emails"
                        value={form.emailFooterText || ""}
                        onChange={(e) => update("emailFooterText", e.target.value)}
                        className="w-full p-3 rounded-b-xl border border-slate-200 bg-white text-xs outline-none focus:border-sky-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                      />
                    </div>

                    {/* Section 8: Mail Example Live Template Preview */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Mail size={15} className="text-sky-600 dark:text-sky-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Mail Example: Email Invoice / Quotation Mail Template
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-sky-50 px-2 py-0.5 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                          Live Rendered Simulation
                        </span>
                      </div>

                      {/* Email simulation box */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950 text-xs space-y-4 max-w-md mx-auto shadow-inner">
                        {/* Logo header */}
                        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white font-black text-xs shadow">
                            {(settings?.business?.companyName || settings?.business?.businessName || "?")[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{settings?.business?.companyName || settings?.business?.businessName || ""}</p>
                            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{form.emailName || form.fromName || ""}</p>
                          </div>
                        </div>

                        {/* Body - renders the saved invoice email content template */}
                        <div className="space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          <p>{(form.invoiceContent || "")
                            .replace(/%client_first_name%/g, "Client")
                            .replace(/%number%/g, "INV-0001")
                            .replace(/%link%/g, window.location.origin + "/invoice/INV-0001")
                            .replace(/%amount%/g, "")
                            .replace(/%due_date%/g, "")
                          }</p>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 text-white font-bold text-xs text-center shadow-md hover:bg-slate-800 transition dark:bg-sky-600"
                          >
                            {form.invoiceButtonText || ""}
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-200/80 pt-3 text-center text-[10px] text-slate-400 dark:border-slate-800">
                          {form.emailFooterText || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {category === "pdf" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Page Format
                        </label>
                        <select
                          value={form.pageSize || "A4"}
                          onChange={(e) => update("pageSize", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        >
                          <option value="A4">A4 (Standard)</option>
                          <option value="Letter">US Letter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Accent Theme Color
                        </label>
                        <input
                          type="color"
                          value={form.accentColor || "#4f46e5"}
                          onChange={(e) => update("accentColor", e.target.value)}
                          className="w-full h-10 p-1 rounded-xl border border-slate-200 bg-white cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === "translate" && (
                  <div className="space-y-6">
                    {/* Context Notice */}
                    <div className="rounded-2xl bg-indigo-50/80 p-3.5 border border-indigo-100 text-xs text-indigo-900 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300">
                      <p className="font-semibold mb-1">
                        Here you can translate strings into your own language, or simply change the text to suit your needs.
                      </p>
                      <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                        Select a language preset below to translate all quotes, invoices, and table headers dynamically, or customize any field directly.
                      </p>
                    </div>

                    {/* Language Preset Selector */}
                    <div className="rounded-2xl border border-indigo-200 p-4 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                          Language Preset
                        </label>
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2 py-0.5">
                          Instant 1-Click Translation
                        </span>
                      </div>
                      <select
                        value={form.language || "English"}
                        onChange={(e) => {
                          const selected = e.target.value;
                          const preset = LANGUAGE_PRESETS[selected];
                          if (preset) {
                            setForm((prev) => ({ ...prev, ...preset }));
                            toast.success(`Applied ${selected} translation preset`);
                          } else {
                            update("language", selected);
                          }
                        }}
                        className="w-full h-11 px-3.5 rounded-xl border border-indigo-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 cursor-pointer shadow-2xs"
                      >
                        <option value="English">English (Default)</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                        <option value="Arabic">Arabic (العربية)</option>
                      </select>
                    </div>

                    {/* Section 1: Document Labels */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Document Titles & Plurals
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Quote Label
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            You can change this from Quote to Estimate or Proposal (or any other word you like).
                          </p>
                          <input
                            type="text"
                            placeholder="Quote"
                            value={form.quoteLabel ?? "Quote"}
                            onChange={(e) => update("quoteLabel", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Quote Label Plural
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The plural of the above.
                          </p>
                          <input
                            type="text"
                            placeholder="Quotes"
                            value={form.quoteLabelPlural ?? "Quotes"}
                            onChange={(e) => update("quoteLabelPlural", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Invoice Label
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            You can change this from Invoice to Tax Invoice (or any other word you like).
                          </p>
                          <input
                            type="text"
                            placeholder="Invoice"
                            value={form.invoiceLabel ?? "Tax Invoice"}
                            onChange={(e) => update("invoiceLabel", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Invoice Label Plural
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">
                            The plural of the above.
                          </p>
                          <input
                            type="text"
                            placeholder="Invoices"
                            value={form.invoiceLabelPlural ?? "Invoices"}
                            onChange={(e) => update("invoiceLabelPlural", e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Line Items & Calculation Labels */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Table Headers & Financial Terms
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Hrs/Qty
                          </label>
                          <input
                            type="text"
                            placeholder="Hrs/Qty"
                            value={form.labelHrsQty ?? "Hrs/Qty"}
                            onChange={(e) => update("labelHrsQty", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Service
                          </label>
                          <input
                            type="text"
                            placeholder="Service"
                            value={form.labelService ?? "Service"}
                            onChange={(e) => update("labelService", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Rate/Price
                          </label>
                          <input
                            type="text"
                            placeholder="Rate/Price"
                            value={form.labelRatePrice ?? "Rate/Price"}
                            onChange={(e) => update("labelRatePrice", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Adjust
                          </label>
                          <input
                            type="text"
                            placeholder="Adjust"
                            value={form.labelAdjust ?? "Adjust"}
                            onChange={(e) => update("labelAdjust", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Sub Total
                          </label>
                          <input
                            type="text"
                            placeholder="Sub Total"
                            value={form.labelSubTotal ?? "Sub Total"}
                            onChange={(e) => update("labelSubTotal", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Discount
                          </label>
                          <input
                            type="text"
                            placeholder="Discount"
                            value={form.labelDiscount ?? "Discount"}
                            onChange={(e) => update("labelDiscount", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Total
                          </label>
                          <input
                            type="text"
                            placeholder="Total"
                            value={form.labelTotal ?? "Total"}
                            onChange={(e) => update("labelTotal", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Total Due
                          </label>
                          <input
                            type="text"
                            placeholder="Total Due"
                            value={form.labelTotalDue ?? "Total Due"}
                            onChange={(e) => update("labelTotalDue", e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Live Translated Document Simulation */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Languages size={15} className="text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Live Translated Document Preview
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {form.invoiceLabel ?? "Tax Invoice"} Sample
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-950 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 dark:text-white">UltraKey IT Solutions</span>
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] uppercase">
                            {form.invoiceLabel ?? "Tax Invoice"}
                          </span>
                        </div>

                        {/* Mock line item table with translated headers */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden dark:border-slate-800">
                          <div className="grid grid-cols-4 bg-slate-200/70 dark:bg-slate-800 p-2 font-bold text-[10px] uppercase text-slate-600 dark:text-slate-400">
                            <span>{form.labelService ?? "Service"}</span>
                            <span className="text-center">{form.labelHrsQty ?? "Hrs/Qty"}</span>
                            <span className="text-right">{form.labelRatePrice ?? "Rate/Price"}</span>
                            <span className="text-right">{form.labelTotal ?? "Total"}</span>
                          </div>
                          <div className="grid grid-cols-4 p-2 text-[11px] bg-white dark:bg-slate-900">
                            <span className="font-medium text-slate-800 dark:text-slate-200">Custom Software Architecture</span>
                            <span className="text-center text-slate-600 dark:text-slate-400">1</span>
                            <span className="text-right text-slate-600 dark:text-slate-400">₹50,000.00</span>
                            <span className="text-right font-bold text-slate-900 dark:text-slate-100">₹50,000.00</span>
                          </div>
                        </div>

                        {/* Summary calculations */}
                        <div className="space-y-1.5 pt-1 text-[11px]">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{form.labelSubTotal ?? "Sub Total"}:</span>
                            <span>₹50,000.00</span>
                          </div>
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>{form.labelDiscount ?? "Discount"}:</span>
                            <span>-₹5,000.00</span>
                          </div>
                          <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                            <span>{form.labelTotalDue ?? "Total Due"}:</span>
                            <span className="text-indigo-600 dark:text-indigo-400">₹45,000.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {category === "extras" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode by Default</p>
                          <p className="text-[11px] text-slate-400">Force dark theme for new sessions</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.defaultDark === true}
                          onChange={(e) => update("defaultDark", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === "license" && (
                  <div className="space-y-6">
                    {/* Header notice */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Manage your software license and activation details.
                      </p>

                      {/* Dynamic status banner */}
                      {!(form.licenseKey || form.purchaseCode) ? (
                        <div className="rounded-2xl bg-amber-50/90 p-4 border border-amber-200 text-xs text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>License Not Configured</span>
                          </div>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">
                            Please enter your license details below.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-emerald-50/90 p-4 border border-emerald-200 text-xs text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                            <span>License Active & Verified</span>
                          </div>
                          <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold dark:bg-emerald-900/40 dark:text-emerald-300">
                            Enterprise Edition
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Section 1: Activation Inputs */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        License Credentials
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Company Name
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          The company name associated with this license.
                        </p>
                        <input
                          type="text"
                          placeholder="e.g. Ultrakey IT Solutions Pvt. Ltd."
                          value={form.companyName || form.licensedTo || ""}
                          onChange={(e) => {
                            update("companyName", e.target.value);
                            update("licensedTo", e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Purchase Code
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          The purchase code received after buying the product.
                        </p>
                        <input
                          type="text"
                          placeholder="e.g. abc123-def456-7890-xyz"
                          value={form.purchaseCode || ""}
                          onChange={(e) => update("purchaseCode", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          License Key
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Your unique license key for activation.
                        </p>
                        <input
                          type="text"
                          placeholder="e.g. UKEY-9921-X481-PROD-2026"
                          value={form.licenseKey || ""}
                          onChange={(e) => update("licenseKey", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-amber-700 dark:text-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          License Expiry Date
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          The date on which the license expires and must be renewed.
                        </p>
                        <input
                          type="date"
                          value={form.expiryDate || form.licenseExpiry || ""}
                          onChange={(e) => {
                            update("expiryDate", e.target.value);
                            update("licenseExpiry", e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 2: Product & Tier Summary */}
                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-amber-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">UltraKey IT Suite</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-300">
                          Production Release
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>Software Version: <strong className="text-slate-800 dark:text-slate-200">2.4.0-production</strong></div>
                        <div>Tier: <strong className="text-slate-800 dark:text-slate-200">Commercial Extended</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SIZE INTERACTIVE TEMPLATE PREVIEW MODAL */}
      <TemplatePreviewModal
        open={previewOpen}
        type={previewType}
        selectedTemplate={form.selectedTemplate || "template1"}
        onSelectTemplate={(tmpl) => update("selectedTemplate", tmpl)}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
