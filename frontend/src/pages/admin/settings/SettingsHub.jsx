import { useEffect, useState } from "react";
import { Settings, SlidersHorizontal} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import SettingsModal from "../../../components/settings/SettingsModal";

export default function SettingsHub({
  initialCategory = null,
  onModalClose,
}) {

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeCategory, setActiveCategory] = useState(
    initialCategory || tabParam || "general"
  );

  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (initialCategory || tabParam) {
      setActiveCategory(initialCategory || tabParam);
    }
    setModalOpen(true);
  }, [initialCategory, tabParam]);

  const handleClose = () => {
    setModalOpen(false);
    onModalClose?.();
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      {/* Clean minimal centered Settings Icon State */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-md shadow-indigo-500/10 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Settings size={36} className="animate-spin-slow" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            System Settings & Preferences
          </h1>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            Configure business profile, GST rates, invoice defaults, and system preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition"
        >
          <SlidersHorizontal size={15} />
          <span>Open Settings Modal</span>
        </button>
      </div>

      {/* SYSTEM SETTINGS CONFIGURATION MODAL POPUP */}
      <SettingsModal
        open={modalOpen}
        category={activeCategory}
        onClose={handleClose}
        onSaved={() => {}}
      />
    </div>
  );
}