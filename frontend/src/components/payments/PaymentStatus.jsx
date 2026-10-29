import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

const STATUS_CONFIG = {
  success: {
    title: "Payment successful",
    description:
      "The transaction has been completed successfully.",
    icon: CheckCircle2,
    wrapper:
      "border-emerald-200 bg-emerald-50",
    iconWrapper:
      "bg-emerald-100 text-emerald-600",
    text: "text-emerald-800",
  },

  paid: {
    title: "Payment successful",
    description:
      "The invoice has been marked as paid.",
    icon: CheckCircle2,
    wrapper:
      "border-emerald-200 bg-emerald-50",
    iconWrapper:
      "bg-emerald-100 text-emerald-600",
    text: "text-emerald-800",
  },

  pending: {
    title: "Payment pending",
    description:
      "Waiting for payment confirmation.",
    icon: Clock3,
    wrapper:
      "border-amber-200 bg-amber-50",
    iconWrapper:
      "bg-amber-100 text-amber-600",
    text: "text-amber-800",
  },

  processing: {
    title: "Payment processing",
    description:
      "Your payment is being processed.",
    icon: Loader2,
    wrapper:
      "border-blue-200 bg-blue-50",
    iconWrapper:
      "bg-blue-100 text-blue-600",
    text: "text-blue-800",
  },

  failed: {
    title: "Payment failed",
    description:
      "The transaction could not be completed.",
    icon: XCircle,
    wrapper:
      "border-red-200 bg-red-50",
    iconWrapper:
      "bg-red-100 text-red-600",
    text: "text-red-800",
  },

  cancelled: {
    title: "Payment cancelled",
    description:
      "The payment was cancelled.",
    icon: XCircle,
    wrapper:
      "border-slate-200 bg-slate-50",
    iconWrapper:
      "bg-slate-100 text-slate-500",
    text: "text-slate-700",
  },

  refunded: {
    title: "Payment refunded",
    description:
      "The payment amount has been refunded.",
    icon: AlertCircle,
    wrapper:
      "border-purple-200 bg-purple-50",
    iconWrapper:
      "bg-purple-100 text-purple-600",
    text: "text-purple-800",
  },
};

export default function PaymentStatus({
  status = "pending",
  amount,
  reference,
  compact = false,
}) {
  const config =
    STATUS_CONFIG[
      String(status).toLowerCase()
    ] ||
    STATUS_CONFIG.pending;

  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${config.wrapper} ${config.text}`}
      >
        <Icon
          size={13}
          className={
            status ===
            "processing"
              ? "animate-spin"
              : ""
          }
        />

        {config.title}
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`rounded-3xl border p-5 ${config.wrapper}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconWrapper}`}
        >
          <Icon
            size={21}
            className={
              status ===
              "processing"
                ? "animate-spin"
                : ""
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-bold ${config.text}`}
          >
            {config.title}
          </h3>

          <p
            className={`mt-1 text-xs opacity-70 ${config.text}`}
          >
            {config.description}
          </p>

          {(amount ||
            reference) && (
            <div className="mt-4 flex flex-wrap gap-4">
              {amount && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-50">
                    Amount
                  </p>

                  <p className="mt-0.5 text-sm font-bold">
                    ₹
                    {Number(
                      amount
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
              )}

              {reference && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-50">
                    Reference
                  </p>

                  <p className="mt-0.5 text-sm font-bold">
                    {reference}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}