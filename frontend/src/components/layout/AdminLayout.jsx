import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useApp();
  const { user, isImpersonating, impersonationMeta, stopImpersonation } = useAuth();

  const handleReturnToSuperAdmin = () => {
    stopImpersonation();
    toast.success("Returned to Super Admin Console");
    window.location.href = "/superadmin/tenants";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* SUPER ADMIN IMPERSONATION BANNER */}
      {isImpersonating && (
        <div className="sticky top-0 z-[100] bg-slate-950 text-white px-4 py-2 shadow-xl border-b-2 border-purple-500 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-purple-600 text-white text-[11px] font-black">
              ⚡
            </span>
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px]">
              Super Admin Impersonation Session
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-[11px]">
              <span className="text-slate-400">Actor:</span>
              <strong className="text-white">{impersonationMeta?.actor?.name || impersonationMeta?.actor?.email || "Super Admin"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-md text-[11px]">
              <span className="text-purple-300">Acting As:</span>
              <strong className="text-amber-300">{impersonationMeta?.acting_as?.email || user?.email || "Admin"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-[11px]">
              <span className="text-slate-400">Business:</span>
              <strong className="text-emerald-400">{impersonationMeta?.business?.name || user?.business_name || "Apex Technologies"}</strong>
            </span>
            {impersonationMeta?.started && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-400">
                <span>Started:</span>
                <span className="font-mono text-slate-300">{impersonationMeta.started}</span>
              </span>
            )}
            {impersonationMeta?.reason && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-slate-400">
                <span>Reason:</span>
                <span className="italic text-slate-300">{impersonationMeta.reason}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleReturnToSuperAdmin}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition shadow-sm cursor-pointer shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Exit Impersonation</span>
          </button>
        </div>
      )}

      <Sidebar role="ADMIN" />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"}`}>
        <Navbar role="ADMIN" />

        <main
          key={location.pathname}
          className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}