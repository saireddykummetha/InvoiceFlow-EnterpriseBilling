import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Globe,
  Mail,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "../../services/api";

export default function SuperAdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/superadmin/tenants/?search=${encodeURIComponent(search)}`);
      if (res.data?.success) {
        setTenants(res.data.data);
      }
    } catch (err) {
      console.warn("Error fetching tenants:", err?.message);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={24} />
            Ecosystem Tenants & Organizations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View all registered business workspaces, billing profiles, and instance owners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTenants}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search by business name, email, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* TENANTS GRID */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map((b) => (
            <div
              key={b.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                    {b.business_name.charAt(0)}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Active Tenant
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{b.business_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{b.legal_name || "Enterprise Workspace"}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{b.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe size={13} className="text-slate-400 shrink-0" />
                    <span>{b.city ? `${b.city}, ${b.country}` : "Global Cloud Node"}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{b.clients_count || 0} Clients • {b.vendors_count || 0} Vendors</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Owner: {b.owner?.name || b.owner?.username || "Admin"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
