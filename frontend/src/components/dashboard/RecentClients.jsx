import {
  ArrowRight,
  Mail,
} from "lucide-react";

import { Link } from "react-router-dom";
import useSettings from "../../hooks/useSettings";

export default function RecentClients({ data = [] }) {
  const { formatCurrency } = useSettings();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent clients
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Recently active customers
          </p>
        </div>

        <Link
          to="/admin/clients"
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* CLIENT DATA FROM BACKEND */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">

        {data.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              No clients found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Clients created in the system will appear here.
            </p>
          </div>
        ) : (
          data.map((client) => {

            const displayName =
              client.company_name ||
              client.name ||
              "Unnamed Client";

            const initials = displayName
              .split(" ")
              .filter(Boolean)
              .map((word) => word.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const invoiceCount = Number(
              client.invoice_count || 0
            );

            const outstanding = Number(
              client.outstanding || 0
            );

            return (
              <Link
                key={client.id}
                to={`/admin/clients/${client.id}`}
                className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >

                {/* AVATAR */}
                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                    {initials}
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
                  />

                </div>

                {/* CLIENT NAME */}
                <p className="mt-4 truncate text-xs font-bold text-slate-800">
                  {displayName}
                </p>

                {/* EMAIL */}
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <Mail size={11} />

                  <span className="truncate">
                    {client.email || "No email"}
                  </span>
                </div>

                {/* CLIENT INFORMATION */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                  {/* INVOICE COUNT */}
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400">
                      Invoices
                    </p>

                    <p className="mt-0.5 text-xs font-bold text-slate-700">
                      {invoiceCount}
                    </p>
                  </div>

                  {/* OUTSTANDING */}
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400">
                      Outstanding
                    </p>

                    <p
                      className={`mt-0.5 text-xs font-bold ${outstanding > 0
                          ? "text-amber-600"
                          : "text-emerald-600"
                        }`}
                    >
                      {formatCurrency(outstanding)}
                    </p>
                  </div>

                </div>

              </Link>
            );
          })
        )}

      </div>
    </div>
  );
}