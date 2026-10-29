import {
  ArrowDownLeft,
  CalendarDays,
  CreditCard,
  ExternalLink,
} from "lucide-react";

import { motion } from "framer-motion";

import PaymentStatus from "./PaymentStatus";

export default function PaymentHistory({
  payments = [],
  loading = false,
  onSelect,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-2xl bg-slate-100"
            />
          )
        )}
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <CreditCard size={20} />
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-800">
          No payment history
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Successful and pending transactions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[1fr_150px_120px_140px_40px] gap-4 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
        <span>Transaction</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Status</span>
        <span />
      </div>

      <div className="divide-y divide-slate-100">
        {payments.map(
          (payment, index) => (
            <motion.div
              key={
                payment.id ||
                payment.reference ||
                index
              }
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay:
                  index * 0.03,
              }}
              onClick={() =>
                onSelect?.(
                  payment
                )
              }
              className={`grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1fr_150px_120px_140px_40px] md:items-center md:gap-4 ${
                onSelect
                  ? "cursor-pointer"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <ArrowDownLeft
                    size={17}
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {payment.reference ||
                      payment.transactionId ||
                      `PAY-${payment.id}`}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {payment.method ||
                      "Payment gateway"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays
                  size={13}
                />

                {payment.date ||
                  payment.createdAt ||
                  "—"}
              </div>

              <p className="text-sm font-bold text-slate-900">
                ₹
                {Number(
                  payment.amount || 0
                ).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </p>

              <div>
                <PaymentStatus
                  status={
                    payment.status ||
                    "pending"
                  }
                  compact
                />
              </div>

              <div className="hidden md:block">
                <ExternalLink
                  size={15}
                  className="text-slate-300"
                />
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}