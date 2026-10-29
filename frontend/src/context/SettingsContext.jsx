import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiSettings from "../api/settings.js";

export const SettingsContext = createContext(null);

const EMPTY_SETTINGS = {
  general: {},
  business: {},
  quotation: {},
  quotes: {},
  invoice: {},
  invoices: {},
  payments: {},
  payment: {},
  emails: {},
  email: {},
  tax: {},
  translate: {},
  translations: {},
  pdf: {},
  extras: {},
  license: {},
};

function normalizeSettings(data) {
  if (!data) return EMPTY_SETTINGS;
  const source = data?.data || data;

  const quotation  = source.quotation  || source.quotes  || {};
  const invoice    = source.invoice    || source.invoices || {};
  const payments   = source.payments   || source.payment  || source.payment_settings || {};
  const emails     = source.emails     || source.email    || source.email_settings || {};
  const translate  = source.translate  || source.translations || {};

  const normalized = {
    general:      { ...(source.general  || {}) },
    business:     { ...(source.business || {}) },
    quotation:    { ...quotation },
    quotes:       { ...quotation },
    invoice:      { ...invoice },
    invoices:     { ...invoice },
    payments:     { ...payments },
    payment:      { ...payments },
    payment_settings: { ...payments },
    emails:       { ...emails },
    email:        { ...emails },
    tax:          { ...(source.tax  || {}) },
    translate:    { ...translate },
    translations: { ...translate },
    pdf:          { ...(source.pdf  || source.pdf_settings || {}) },
    extras:       { ...(source.extras || source.extra_settings || {}) },
    license:      { ...(source.license || {}) },
  };

  try {
    localStorage.setItem("app_settings", JSON.stringify(normalized));
  } catch (_) {}

  return normalized;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const CURRENCY_SYMBOLS_MAP = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  AED: "AED ",
  SGD: "S$",
  JPY: "¥",
  CNY: "¥",
  SAR: "SAR ",
  QAR: "QAR ",
  NZD: "NZ$",
  CHF: "CHF ",
  ZAR: "R ",
};

function getCurrencySymbol(settings) {
  if (settings?.payments?.currencySymbol) return settings.payments.currencySymbol;
  if (settings?.general?.currencySymbol) return settings.general.currencySymbol;
  if (settings?.business?.currencySymbol) return settings.business.currencySymbol;

  const currCode = (
    settings?.payments?.currency ||
    settings?.general?.currency ||
    settings?.business?.currency ||
    "INR"
  ).toUpperCase();

  return CURRENCY_SYMBOLS_MAP[currCode] || currCode || "₹";
}

function getDecimalPlaces(settings) {
  const v =
    settings?.payments?.decimalPlaces ??
    settings?.general?.decimalPlaces;
  return v !== undefined && v !== null && v !== "" ? Number(v) : 2;
}

function getThousandSep(settings) {
  return (
    settings?.payments?.thousandSeparator ??
    settings?.general?.thousandSeparator ??
    ","
  );
}

function getDecimalSep(settings) {
  return (
    settings?.payments?.decimalSeparator ??
    settings?.general?.decimalSeparator ??
    "."
  );
}

function buildFormatCurrency(settings) {
  return function formatCurrency(amount) {
    const num       = Number(amount) || 0;
    const symbol    = getCurrencySymbol(settings);
    const decimals  = getDecimalPlaces(settings);
    const thouSep   = getThousandSep(settings);
    const decSep    = getDecimalSep(settings);
    const position  = settings?.payments?.currencyPosition || settings?.general?.currencyPosition || "left";

    const parts     = num.toFixed(decimals).split(".");
    const intPart   = thouSep
      ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thouSep)
      : parts[0];
    const decPart   = decimals > 0 && parts[1] ? `${decSep}${parts[1]}` : "";
    const formatted = `${intPart}${decPart}`;

    if (!symbol) return formatted;
    return position === "right" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  };
}

function buildFormatDate(settings) {
  return function formatDate(dateString) {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);

    const format = settings?.general?.dateFormat || "DD/MM/YYYY";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    if (format === "MM/DD/YYYY") return `${month}/${day}/${year}`;
    if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
    if (format === "DD-MM-YYYY") return `${day}-${month}-${year}`;
    if (format === "D MMM, YYYY") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${monthNames[d.getMonth()]}, ${year}`;
    }
    return `${day}/${month}/${year}`;
  };
}

function buildTranslateLabel(settings) {
  return function translateLabel(key, fallback = key) {
    const t = settings?.translate || settings?.translations || {};
    return t[key] || fallback;
  };
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function SettingsProvider({ children, isAuthenticated }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("app_settings");
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return EMPTY_SETTINGS;
  });
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  /* Sync dark-mode class dynamically from settings */
  useEffect(() => {
    const isDark = Boolean(
      settings?.extras?.defaultDark ||
      settings?.extras?.darkMode
    );
    document.documentElement.classList.toggle("dark", isDark);
  }, [settings?.extras?.defaultDark, settings?.extras?.darkMode]);

  /* Load settings from backend */
  const loadSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response  = await apiSettings.getSettings();
      const normalized = normalizeSettings(response);
      setSettings(normalized);
      return normalized;
    } catch (err) {
      if (err?.response?.status !== 401) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load settings."
        );
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setSettings(EMPTY_SETTINGS);
      localStorage.removeItem("app_settings");
      setError(null);
    }
  }, [isAuthenticated, loadSettings]);

  /* Update one section - then re-fetch to keep everything in sync */
  const updateSettings = useCallback(async (section, sectionData) => {
    if (!section) throw new Error("Settings section is required.");
    setSaving(true);
    try {
      await apiSettings.updateSettingsSection(section, sectionData);
      const response  = await apiSettings.getSettings();
      const normalized = normalizeSettings(response);
      setSettings(normalized);
      window.dispatchEvent(new CustomEvent("app-settings-updated", { detail: normalized }));
      return normalized;
    } finally {
      setSaving(false);
    }
  }, []);

  /* Update all sections at once */
  const updateAllSettings = useCallback(async (data) => {
    setSaving(true);
    try {
      await apiSettings.updateSettings(data);
      const response  = await apiSettings.getSettings();
      const normalized = normalizeSettings(response);
      setSettings(normalized);
      window.dispatchEvent(new CustomEvent("app-settings-updated", { detail: normalized }));
      return normalized;
    } finally {
      setSaving(false);
    }
  }, []);

  /* Listen for settings update events across components */
  useEffect(() => {
    const handleSettingsUpdated = (e) => {
      if (e?.detail) {
        setSettings(e.detail);
      }
    };
    const handleStorage = (e) => {
      if (e.key === "app_settings" && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch (_) {}
      }
    };
    window.addEventListener("app-settings-updated", handleSettingsUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("app-settings-updated", handleSettingsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /* Derived format helpers - re-built whenever settings changes */
  const formatCurrency  = useMemo(() => buildFormatCurrency(settings),  [settings]);
  const formatDate      = useMemo(() => buildFormatDate(settings),      [settings]);
  const translateLabel  = useMemo(() => buildTranslateLabel(settings),  [settings]);

  /* Invoice defaults helper */
  const getInvoiceDefaults = useCallback(() => {
    const inv = settings?.invoice || settings?.invoices || {};
    const tx = settings?.tax || {};
    const prefix = inv.prefix || "INV";
    const nextNum = Number(inv.nextNumber || 1);
    const invoiceNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;
    const dueDays = Number(inv.dueDays || inv.defaultDueDays || 15);
    
    const d = new Date();
    d.setDate(d.getDate() + dueDays);
    const dueDate = d.toISOString().split("T")[0];
    const issueDate = new Date().toISOString().split("T")[0];

    const defaultTaxRate = Number(
      inv.defaultTaxRate ??
      tx.defaultRate ??
      (Number(tx.cgstRate || 0) + Number(tx.sgstRate || 0)) ??
      18
    );

    return {
      prefix,
      nextNumber: nextNum,
      invoiceNumber,
      dueDays,
      dueDate,
      issueDate,
      terms: inv.terms || inv.defaultTerms || "",
      notes: inv.footer || inv.defaultFooter || "",
      taxRate: defaultTaxRate,
      discountType: inv.defaultDiscountType || "amount",
      autoRoundOff: inv.autoRoundOff !== false,
      selectedTemplate: inv.selectedTemplate || "template1",
    };
  }, [settings]);

  /* Quotation defaults helper */
  const getQuoteDefaults = useCallback(() => {
    const quo = settings?.quotation || settings?.quotes || {};
    const tx = settings?.tax || {};
    const prefix = quo.prefix || "QUO";
    const nextNum = Number(quo.nextNumber || 1);
    const quoteNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;
    const validityDays = Number(quo.validityDays || quo.quotesValidFor || 15);

    const d = new Date();
    d.setDate(d.getDate() + validityDays);
    const expiryDate = d.toISOString().split("T")[0];
    const issueDate = new Date().toISOString().split("T")[0];

    const defaultTaxRate = Number(
      quo.defaultTaxRate ??
      tx.defaultRate ??
      (Number(tx.cgstRate || 0) + Number(tx.sgstRate || 0)) ??
      18
    );

    return {
      prefix,
      nextNumber: nextNum,
      quoteNumber,
      validityDays,
      expiryDate,
      issueDate,
      terms: quo.terms || quo.defaultTerms || "",
      notes: quo.footer || quo.defaultFooter || "",
      taxRate: defaultTaxRate,
      discountType: quo.defaultDiscountType || "amount",
      selectedTemplate: quo.selectedTemplate || "template1",
    };
  }, [settings]);

  /* Business info helper */
  const getBusinessInfo = useCallback(() => {
    const b = settings?.business || {};
    const gen = settings?.general || {};
    return {
      businessName: b.businessName || b.companyName || "My Business",
      companyName: b.companyName || b.businessName || "My Business",
      legalName: b.legalName || "",
      businessType: b.businessType || "",
      registrationNumber: b.registrationNumber || "",
      email: b.email || "",
      phone: b.phone || "",
      website: b.website || "",
      address: b.address || "",
      city: b.city || "",
      state: b.state || "",
      country: b.country || "India",
      postalCode: b.postalCode || "",
      taxNumber: b.taxNumber || b.gstin || "",
      gstin: b.gstin || b.taxNumber || "",
      logo: b.logo || b.logoUrl || "",
      logoUrl: b.logoUrl || b.logo || "",
      vatNumber: b.vatNumber || "",
      abnNumber: b.abnNumber || "",
      extraInfo: b.extraInfo || "",
      currency: b.currency || gen.currency || "INR",
      timezone: b.timezone || gen.timezone || "Asia/Kolkata",
    };
  }, [settings]);

  /* Payment details helper */
  const getPaymentDetails = useCallback(() => {
    const p = settings?.payments || settings?.payment || settings?.payment_settings || {};
    const b = settings?.business || {};

    const bankName = p.bankName || "";
    const accountName = p.accountName || b.businessName || b.companyName || "";
    const accountNumber = p.accountNumber || "";
    const ifscCode = p.ifscCode || p.ifsc || "";

    let bankDetailsText = p.bankDetailsText || "";
    if (!bankDetailsText && (bankName || accountNumber)) {
      const lines = [];
      if (bankName) lines.push(`Bank Name: ${bankName}`);
      if (accountName) lines.push(`Account Name: ${accountName}`);
      if (accountNumber) lines.push(`Account Number: ${accountNumber}`);
      if (ifscCode) lines.push(`IFSC Code: ${ifscCode}`);
      bankDetailsText = lines.join("\n");
    }

    return {
      bankDetailsText,
      genericPaymentText: p.genericPaymentText || "",
      upiId: p.upiId || "",
      upiEnabled: Boolean(p.upiEnabled),
      razorpayEnabled: Boolean(p.razorpayEnabled),
      razorpayKeyId: p.razorpayKeyId || "",
      razorpaySecretKey: p.razorpaySecretKey || "",
      razorpayWebhookSecret: p.razorpayWebhookSecret || "",
      razorpayEmail: p.razorpayEmail || "",
      bankTransferEnabled: Boolean(p.bankTransferEnabled),
      bankName,
      accountName,
      accountNumber,
      ifscCode,
      cashEnabled: Boolean(p.cashEnabled),
      cashBranch: p.cashBranch || "",
      cashInstructions: p.cashInstructions || "",
      cashReceiptNote: p.cashReceiptNote || "",
      onlineEnabled: Boolean(p.onlineEnabled),
    };
  }, [settings]);

  /* Tax configuration helper */
  const getTaxConfig = useCallback(() => {
    const t = settings?.tax || {};
    return {
      enabled: t.enabled !== false,
      taxName: t.taxName || "GST",
      defaultRate: Number(t.defaultRate || 0),
      cgstRate: Number(t.cgstRate || 0),
      sgstRate: Number(t.sgstRate || 0),
      igstRate: Number(t.igstRate || 0),
      gstNumber: t.gstNumber || settings?.business?.taxNumber || "",
      hsnSacEnabled: Boolean(t.hsnSacEnabled),
    };
  }, [settings]);

  /* PDF styling helper */
  const getPdfConfig = useCallback(() => {
    const p = settings?.pdf || settings?.pdf_settings || {};
    return {
      pageSize: p.pageSize || "A4",
      accentColor: p.accentColor || "#4f46e5",
      showLogo: p.showLogo !== false,
      showSignature: Boolean(p.showSignature),
      footerText: p.footerText || "",
    };
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      saving,
      error,
      updateSettings,
      updateAllSettings,
      refreshSettings:  loadSettings,
      reloadSettings:   loadSettings,
      formatCurrency,
      formatDate,
      translateLabel,
      getInvoiceDefaults,
      getQuoteDefaults,
      getBusinessInfo,
      getPaymentDetails,
      getTaxConfig,
      getPdfConfig,
    }),
    [
      settings,
      loading,
      saving,
      error,
      updateSettings,
      updateAllSettings,
      loadSettings,
      formatCurrency,
      formatDate,
      translateLabel,
      getInvoiceDefaults,
      getQuoteDefaults,
      getBusinessInfo,
      getPaymentDetails,
      getTaxConfig,
      getPdfConfig,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export default SettingsContext;