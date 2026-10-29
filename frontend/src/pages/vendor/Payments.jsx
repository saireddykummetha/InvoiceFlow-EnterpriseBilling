import { useState, useEffect } from "react";
import {
  CheckCircle2,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import api from "../../services/api";

export default function VendorPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor-portal/payments/");
      if (res.data?.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.warn("Vendor payments error:", err?.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <WalletCards className="text-emerald-600 dark:text-emerald-400" size={24} />
            Vendor Payouts & Remittances
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete transaction ledger of bank transfers, UPI disbursements, and settlement receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-xs"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Invoice Reference</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Transaction UTR / Ref</th>
                <th className="py-3.5 px-4">Settlement Date</th>
                <th className="py-3.5 px-4">Disbursed Amount</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {p.payment_number}
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {p.invoice_number}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                      {p.method}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.reference}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      {p.payment_date}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{p.amount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={10} /> {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
