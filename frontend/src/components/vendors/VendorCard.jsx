import {
  Building2,
  Eye,
  Landmark,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  ShieldCheck,
  Tag,
  Trash2,
  User,
} from "lucide-react";

export default function VendorCard({
  vendor,
  onView,
  onEdit,
  onDelete,
}) {
  const company = vendor.company_name || "";
  const name = vendor.name || "";
  const displayName = company || name || "Unnamed Vendor";
  const subName = company && name ? name : null;
  const categoryDisplay =
    vendor.category_display || vendor.category || "Goods";
  const isActive = vendor.is_active !== false;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-sm text-white shadow-sm shadow-blue-500/20">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4
                onClick={() => onView(vendor)}
                className="cursor-pointer truncate text-base font-bold text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
              >
                {displayName}
              </h4>
              {subName && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {subName}
                </p>
              )}
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Category & Terms Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Tag size={10} className="text-slate-400" />
            {categoryDisplay}
          </span>
          {vendor.payment_terms && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {vendor.payment_terms}
            </span>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
          {vendor.email && (
            <a
              href={`mailto:${vendor.email}`}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{vendor.email}</span>
            </a>
          )}
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <Phone size={13} className="text-slate-400 shrink-0" />
              <span>{vendor.phone}</span>
            </a>
          )}
          {vendor.tax_number && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
              <span className="font-mono text-[11px]">{vendor.tax_number}</span>
            </div>
          )}
          {vendor.bank_name && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Landmark size={13} className="text-blue-500 shrink-0" />
              <span className="truncate">{vendor.bank_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onView(vendor)}
          className="inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <Eye size={14} />
          <span>View Profile</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(vendor)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title="Edit Vendor"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(vendor)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            title="Delete Vendor"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
