import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = "dark",
  onClick,
}) {
  const variants = {
    dark: {
      wrapper:
        "bg-slate-950 text-white border-slate-950",
      icon:
        "bg-white/10 text-white",
      subtitle:
        "text-slate-400",
    },

    white: {
      wrapper:
        "bg-white text-slate-950 border-slate-200",
      icon:
        "bg-slate-100 text-slate-700",
      subtitle:
        "text-slate-400",
    },

    emerald: {
      wrapper:
        "bg-emerald-600 text-white border-emerald-600",
      icon:
        "bg-white/10 text-white",
      subtitle:
        "text-emerald-100",
    },

    blue: {
      wrapper:
        "bg-blue-600 text-white border-blue-600",
      icon:
        "bg-white/10 text-white",
      subtitle:
        "text-blue-100",
    },

    amber: {
      wrapper:
        "bg-amber-500 text-white border-amber-500",
      icon:
        "bg-white/10 text-white",
      subtitle:
        "text-amber-100",
    },
  };

  const style =
    variants[variant] ||
    variants.white;

  const numericTrend =
    Number(trend);

  const positive =
    numericTrend > 0;

  const negative =
    numericTrend < 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.25,
      }}
      onClick={onClick}
      className={`
        rounded-3xl
        border
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-md
        ${
          onClick
            ? "cursor-pointer"
            : ""
        }
        ${style.wrapper}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            ${style.icon}
          `}
        >
          {Icon && <Icon size={20} />}
        </div>

        {trend !== undefined && (
          <div
            className={`
              inline-flex
              items-center
              gap-1
              rounded-full
              px-2
              py-1
              text-[11px]
              font-bold
              ${
                variant === "white"
                  ? positive
                    ? "bg-emerald-50 text-emerald-600"
                    : negative
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  : "bg-white/10 text-white"
              }
            `}
          >
            {positive ? (
              <ArrowUpRight size={13} />
            ) : negative ? (
              <ArrowDownRight size={13} />
            ) : (
              <Minus size={13} />
            )}

            {Math.abs(
              numericTrend
            ).toFixed(1)}
            %
          </div>
        )}
      </div>

      <div className="mt-6">
        <p
          className={`
            text-sm font-medium
            ${
              variant === "white"
                ? "text-slate-500"
                : "text-white/70"
            }
          `}
        >
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {value}
        </p>

        {(subtitle ||
          trendLabel) && (
          <p
            className={`
              mt-2 text-xs
              ${style.subtitle}
            `}
          >
            {trendLabel ||
              subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}