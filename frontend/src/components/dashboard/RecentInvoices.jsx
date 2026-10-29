import {
  ArrowRight,
  FileText,
} from "lucide-react";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSettings from "../../hooks/useSettings";

export default function RecentInvoices({ invoices = [] }) {
  const { formatCurrency } = useSettings();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent invoices
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Latest invoice activity
          </p>
        </div>

        <Link
          to="/admin/invoices"
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {invoices.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-400">
            No invoices found.
          </div>
        ) : (
          invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-3 px-5 py-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FileText size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {invoice.invoice_number}
                </p>

                <p className="mt-1 truncate text-[11px] text-slate-400">
                  {invoice.client}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">
                  {formatCurrency(invoice.total || 0)}
                </p>

                <Status status={invoice.status} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function Status({ status }) {
  const normalized = String(status || "").toLowerCase();

  const styles = {
    paid: "bg-emerald-50 text-emerald-600",
    pending: "bg-amber-50 text-amber-600",
    sent: "bg-amber-50 text-amber-600",
    partially_paid: "bg-amber-50 text-amber-600",
    overdue: "bg-red-50 text-red-600",
    draft: "bg-slate-100 text-slate-500",
  };

  const label = normalized.replaceAll("_", " ");

  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ${styles[normalized] || "bg-slate-100 text-slate-500"
        }`}
    >
      {label}
    </span>
  );
}