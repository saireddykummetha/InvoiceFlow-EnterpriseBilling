import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function VendorViewModal({
  open,
  vendor,
  onClose,
  onEdit,
  onDelete,
}) {
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  if (!open || !vendor) return null;

  const company = vendor.company_name || "";
  const name = vendor.name || "";
  const title = company || name || "Vendor Details";
  const subtitle = company && name ? `Contact: ${name}` : "";
  const categoryDisplay = vendor.category_display || vendor.category || "Goods & Materials";
  const isActive = vendor.is_active !== false;

  const fullAddress = [
    vendor.address,
    vendor.city,
    vendor.state,
    vendor.postal_code,
    vendor.country,
  ]
    .filter(Boolean)
    .join(", ") || "No address specified";

  const handleCopyBankDetails = () => {
    const lines = [
      `Vendor: ${company || name}`,
      vendor.bank_name ? `Bank: ${vendor.bank_name}` : null,
      vendor.account_name ? `Account Name: ${vendor.account_name}` : null,
      vendor.account_number ? `Account Number: ${vendor.account_number}` : null,
      vendor.ifsc_code ? `IFSC / Swift: ${vendor.ifsc_code}` : null,
      vendor.upi_id ? `UPI ID: ${vendor.upi_id}` : null,
      vendor.payment_terms ? `Payment Terms: ${vendor.payment_terms}` : null,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedBank(true);
    toast.success("Bank details copied to clipboard!");
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleCopyContact = () => {
    const lines = [
      `Vendor: ${company || name}`,
      name ? `Contact: ${name}` : null,
      vendor.email ? `Email: ${vendor.email}` : null,
      vendor.phone ? `Phone: ${vendor.phone}` : null,
      vendor.tax_number ? `GSTIN: ${vendor.tax_number}` : null,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedContact(true);
    toast.success("Contact details copied to clipboard!");
    setTimeout(() => setCopiedContact(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Building2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    <Tag size={10} />
                    {categoryDisplay}
                  </span>
                  {vendor.payment_terms && (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Terms: {vendor.payment_terms}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-xl p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  title="Delete Vendor"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={handleCopyContact}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {copiedContact ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
                <span>Copy Contact</span>
              </button>

              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Mail size={13} />
                  <span>Send Email</span>
                </a>
              )}

              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Phone size={13} />
                  <span>Call Vendor</span>
                </a>
              )}

              {vendor.website && (
                <a
                  href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <ExternalLink size={13} />
                  <span>Website</span>
                </a>
              )}
            </div>

            {/* Grid Information Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Contact Information */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-blue-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contact Details
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">Contact Person:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Email:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {vendor.email || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Phone:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {vendor.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tax & Registration */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tax & Registration
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">GSTIN / Tax Number:</span>
                    <p className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {vendor.tax_number || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">PAN Number:</span>
                    <p className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {vendor.pan_number || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Payment Terms:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {vendor.payment_terms || "Net 30"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Billing / Shipping Address
                  </h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {fullAddress}
                </p>
              </div>

              {/* Banking & Payout Details */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 sm:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Bank & Payout Information
                    </h4>
                  </div>
                  {(vendor.bank_name || vendor.account_number || vendor.upi_id) && (
                    <button
                      type="button"
                      onClick={handleCopyBankDetails}
                      className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-300"
                    >
                      {copiedBank ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>Copy Bank Info</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-slate-400">Bank Name:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {vendor.bank_name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Account Holder:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {vendor.account_name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Account Number:</span>
                    <p className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {vendor.account_number || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">IFSC / Swift Code:</span>
                    <p className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {vendor.ifsc_code || "—"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-400">UPI ID / VPA:</span>
                    <p className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {vendor.upi_id || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {vendor.notes && (
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Internal Notes
                  </h4>
                  <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {vendor.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={13} />
              <span>
                Added on:{" "}
                {vendor.created_at
                  ? new Date(vendor.created_at).toLocaleDateString()
                  : "—"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
