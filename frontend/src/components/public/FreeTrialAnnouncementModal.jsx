import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  FolderKanban,
  CreditCard,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function FreeTrialAnnouncementModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartTrial = () => {
    onClose();
    navigate("/signup");
  };

  const handleExplore = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
          className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-purple-950/80 text-white overflow-hidden z-10"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Announcement"
          >
            <X size={18} />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300">
              <Sparkles size={13} className="text-amber-400 animate-spin" />
              <span>SPECIAL ANNOUNCEMENT</span>
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Offer
            </span>
          </div>

          {/* Main Title */}
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white mb-2">
            🚀 5-Project <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Free Trial Active!</span>
          </h3>

          {/* Subtitle / Description */}
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Provision new business workspaces with an instant <strong className="text-white font-bold">5-project allowance</strong> + <strong className="text-emerald-400 font-bold">Zero credit card required</strong>. Experience complete multi-tenant operations immediately!
          </p>

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <FolderKanban size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">5 Full Projects</p>
                <p className="text-[11px] text-slate-400">Complete tasks & deliverables</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">4-Role Ecosystem</p>
                <p className="text-[11px] text-slate-400">Admin, Vendor & Client portals</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Instant Invoicing</p>
                <p className="text-[11px] text-slate-400">Razorpay & UPI integrated</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Zero Credit Card</p>
                <p className="text-[11px] text-slate-400">Instant OTP setup</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleStartTrial}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-600/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Claim Free 5-Project Trial</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={handleExplore}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold border border-white/10 transition-all cursor-pointer"
            >
              Explore Live Platform
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
