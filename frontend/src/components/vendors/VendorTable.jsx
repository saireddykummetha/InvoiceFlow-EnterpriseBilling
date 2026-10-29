import { useState } from "react";
import {
  Building2,
  Eye,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Tag,
  Trash2,
  Landmark,
} from "lucide-react";

export default function VendorTable({
  vendors = [],
  onView,
  onEdit,
  onDelete,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 mb-3">
          <Building2 size={28} />
        </div>
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No vendors found
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          No vendor records match your search or filter criteria. Click "Add Vendor" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <tr>
            <th scope="col" className="py-3.5 pl-6 pr-3">
              Vendor / Company
            </th>
            <th scope="col" className="px-3 py-3.5">
              Category
            </th>
            <th scope="col" className="px-3 py-3.5">
              Contact Info
            </th>
            <th scope="col" className="px-3 py-3.5">
              Tax ID / GSTIN
            </th>
            <th scope="col" className="px-3 py-3.5">
              Banking / Terms
            </th>
            <th scope="col" className="px-3 py-3.5 text-center">
              Status
            </th>
            <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {vendors.map((vendor) => {
            const company = vendor.company_name || "";
            const name = vendor.name || "";
            const displayName = company || name || "Unnamed Vendor";
            const subName = company && name ? name : null;
            const categoryDisplay =
              vendor.category_display || vendor.category || "Goods";
            const isActive = vendor.is_active !== false;

            return (
              <tr
                key={vendor.id}
                className="group transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
              >
                {/* Vendor / Company */}
                <td className="py-4 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-semibold text-xs dark:bg-blue-500/10 dark:text-blue-400">
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onView(vendor)}
                        className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400 text-left block"
                      >
                        {displayName}
                      </button>
                      {subName && (
                        <p className="truncate text-xs text-slate-400">
                          {subName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 py-4">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Tag size={11} className="text-slate-400" />
                    {categoryDisplay}
                  </span>
                </td>

                {/* Contact Info */}
                <td className="px-3 py-4">
                  <div className="space-y-0.5 text-xs">
                    {vendor.email ? (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 truncate max-w-[180px]"
                      >
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </a>
                    ) : null}
                    {vendor.phone ? (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                      >
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{vendor.phone}</span>
                      </a>
                    ) : null}
                    {!vendor.email && !vendor.phone && (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </td>

                {/* Tax ID / GSTIN */}
                <td className="px-3 py-4">
                  {vendor.tax_number ? (
                    <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                      {vendor.tax_number}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                {/* Banking / Terms */}
                <td className="px-3 py-4">
                  <div className="space-y-0.5 text-xs">
                    {vendor.bank_name ? (
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Landmark size={12} className="text-blue-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{vendor.bank_name}</span>
                      </div>
                    ) : null}
                    <span className="inline-block text-[11px] text-slate-400">
                      {vendor.payment_terms || "Net 30"}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-3 py-4 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 pl-3 pr-6 text-right">
                  <div className="relative inline-block text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(vendor)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        title="View Vendor Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(vendor)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        title="Edit Vendor"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(vendor)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        title="Delete Vendor"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
