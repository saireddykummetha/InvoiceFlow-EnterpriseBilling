import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2, X, CheckCircle, Info } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  type = "danger", // 'danger', 'warning', 'info'
  itemName,
  loading = false,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={24} />;
      case "warning":
        return <AlertTriangle size={24} />;
      case "info":
        return <Info size={24} />;
      default:
        return <AlertTriangle size={24} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
        return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
      case "warning":
        return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
      case "info":
        return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
      default:
        return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20";
      default:
        return "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getIconBg()}`}>
                  {getIcon()}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {message}
              </p>

              {itemName && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                  Target: {itemName}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={onConfirm}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60 ${getConfirmButtonStyle()}`}
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : type === "danger" ? (
                    <Trash2 size={15} />
                  ) : (
                    <CheckCircle size={15} />
                  )}
                  {loading ? "Processing..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
