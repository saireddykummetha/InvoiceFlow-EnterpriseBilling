import {
  CheckCircle2,
  RotateCcw,
  Settings,
} from "lucide-react";

import { motion } from "framer-motion";

export default function SettingsHeader({
  title,
  description,
  dirty = false,
  saved = false,
  onReset,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Settings size={19} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            {description && (
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saved && !dirty && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600"
            >
              <CheckCircle2
                size={13}
              />
              Saved
            </motion.div>
          )}

          {dirty && (
            <div className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600">
              Unsaved changes
            </div>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw
                size={14}
              />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}