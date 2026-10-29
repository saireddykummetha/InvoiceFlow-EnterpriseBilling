import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

import { motion } from "framer-motion";

export default function ReportCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
}) {
  const positive =
    Number(trend) > 0;

  const negative =
    Number(trend) < 0;

  const styles = {
    default:
      "bg-white border-slate-200 text-slate-900",

    dark:
      "bg-slate-950 border-slate-950 text-white",

    success:
      "bg-emerald-600 border-emerald-600 text-white",

    warning:
      "bg-amber-500 border-amber-500 text-white",

    danger:
      "bg-red-600 border-red-600 text-white",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -2,
      }}
      className={`rounded-3xl border p-5 shadow-sm ${styles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            variant === "default"
              ? "bg-slate-100 text-slate-700"
              : "bg-white/10 text-white"
          }`}
        >
          {Icon && (
            <Icon size={18} />
          )}
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
              variant === "default"
                ? positive
                  ? "bg-emerald-50 text-emerald-600"
                  : negative
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-100 text-slate-500"
                : "bg-white/10 text-white"
            }`}
          >
            {positive ? (
              <ArrowUpRight
                size={12}
              />
            ) : negative ? (
              <ArrowDownRight
                size={12}
              />
            ) : (
              <Minus size={12} />
            )}

            {Math.abs(
              Number(trend)
            ).toFixed(1)}
            %
          </div>
        )}
      </div>

      <p
        className={`mt-5 text-xs font-medium ${
          variant === "default"
            ? "text-slate-400"
            : "text-white/60"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>

      {(subtitle ||
        trendLabel) && (
        <p
          className={`mt-2 text-[11px] ${
            variant === "default"
              ? "text-slate-400"
              : "text-white/60"
          }`}
        >
          {trendLabel ||
            subtitle}
        </p>
      )}
    </motion.div>
  );
}