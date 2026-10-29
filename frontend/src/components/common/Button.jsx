import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-slate-950 text-white shadow-sm hover:bg-slate-800",

  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

  soft:
    "bg-slate-100 text-slate-700 hover:bg-slate-200",

  danger:
    "bg-red-600 text-white hover:bg-red-700",

  success:
    "bg-emerald-600 text-white hover:bg-emerald-700",

  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",

  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  xl: "h-12 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  icon,
  className = "",
  onClick,
}) {
  const isDisabled =
    disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={
        !isDisabled
          ? { y: -1 }
          : undefined
      }
      whileTap={
        !isDisabled
          ? { scale: 0.98 }
          : undefined
      }
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold
        transition
        duration-200
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2
          size={17}
          className="animate-spin"
        />
      ) : (
        icon
      )}

      {children}
    </motion.button>
  );
}