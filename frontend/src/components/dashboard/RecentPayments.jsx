import {
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { Link } from "react-router-dom";
import useSettings from "../../hooks/useSettings";

export default function RecentPayments({ payments = [] }) {
  const { formatCurrency } = useSettings();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent payments
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Latest received transactions
          </p>
        </div>

        <Link
          to="/admin/payments"
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {payments.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-400">
            No payments found.
          </div>
        ) : (
          payments.map((payment) => {
            const success =
              String(payment.status || "").toLowerCase() === "success";

            return (
              <div
                key={payment.id}
                className="flex items-center gap-3 px-5 py-4"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${success
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                    }`}
                >
                  {success ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <Clock3 size={17} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {payment.invoice}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-slate-400">
                    {payment.method}
                  </p>
                </div>

                <p className="text-xs font-bold text-slate-900">
                  {formatCurrency(payment.amount || 0)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}