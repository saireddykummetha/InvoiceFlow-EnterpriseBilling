import {
  Check,
  Loader2,
  Save,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export default function SettingsSaveBar({
  dirty = false,
  loading = false,
  saved = false,
  onSave,
}) {
  return (
    <AnimatePresence>
      {(dirty || saved) && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 20,
          }}
          className="sticky bottom-4 z-20 mt-6"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex items-center gap-2">
              {saved && !dirty ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Check size={15} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Changes saved
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Your settings are up to date.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Save size={15} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Unsaved changes
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Save to apply these settings.
                    </p>
                  </div>
                </>
              )}
            </div>

            {dirty && (
              <button
                type="button"
                onClick={onSave}
                disabled={loading}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save changes
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}