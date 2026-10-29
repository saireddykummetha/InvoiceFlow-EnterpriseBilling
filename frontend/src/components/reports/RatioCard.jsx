import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingUp,
} from "lucide-react";

import { motion } from "framer-motion";

export default function RatioCard({
  title,
  value,
  description,
  ratio,
  suffix = "%",
  icon: Icon = TrendingUp,
  inverse = false,
}) {
  const numericRatio =
    Number(ratio) || 0;

  const isPositive = inverse
    ? numericRatio < 0
    : numericRatio > 0;

  const isNegative = inverse
    ? numericRatio > 0
    : numericRatio < 0;

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
      whileHover={{
        y: -2,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={18} />
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : isNegative
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={12} />
          ) : isNegative ? (
            <ArrowDownRight size={12} />
          ) : (
            <Minus size={12} />
          )}

          {Math.abs(numericRatio).toFixed(1)}
          {suffix}
        </div>
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-[11px] leading-5 text-slate-400">
          {description}
        </p>
      )}
    </motion.div>
  );
}