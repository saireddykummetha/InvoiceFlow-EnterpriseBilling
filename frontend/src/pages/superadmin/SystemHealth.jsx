import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Shield,
  RefreshCw,

} from "lucide-react";
import api from "../../services/api";

export default function SuperAdminSystemHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/health/");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn("Health fetch error:", err?.message);
      setData({ services: [], audit_logs: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="text-emerald-600 dark:text-emerald-400" size={24} />
            System Health & Infrastructure Diagnostics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status of services, database cluster latency, and platform security audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHealth}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-xs cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(data?.services || []).map((srv, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{srv.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={10} /> Operational
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Latency</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono">{srv.latency}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Uptime</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{srv.uptime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AUDIT LOGS */}
      <div className="rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="text-indigo-600 dark:text-indigo-400" size={18} />
          Real-time Audit Log Trail
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {(data?.audit_logs || []).map((log, idx) => (
            <div key={log.id || log._id || idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">by {log.actor} ({log.ip})</span>
                </div>
              </div>
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{String(log.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
