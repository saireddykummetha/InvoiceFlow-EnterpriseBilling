import  { useState, useEffect } from "react";
import {
  FolderKanban,
  Search,
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  Layers,

} from "lucide-react";
import api from "../../services/api";

const STATUS_COLORS = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  in_progress: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  under_review: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export default function SuperAdminProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setProjects(
          data.map((p) => ({
            id: p.id,
            code: p.code || `PRJ-${p.id}`,
            title: p.title || "Project Workspace",
            business_name: p.business?.business_name || p.business_name || "Enterprise Hub",
            client_name: p.client?.name || p.client_name || "Client Account",
            budget: Number(p.budget || 0),
            status: p.status || "active",
            progress: p.progress || (p.status === "completed" ? 100 : 0),
            members_count: p.members?.length || 0,
            created_at: p.created_at?.split("T")[0] || "-",
          }))
        );
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.warn("Failed to load projects:", err?.message);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in_progress").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderKanban className="text-purple-600 dark:text-purple-400" size={26} />
            Cross-Tenant Projects & Workspaces
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global portfolio of all client deliverables, milestones, and team operations across tenants.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Workspaces</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{totalProjects}</p>
          <p className="mt-1 text-xs text-slate-400">Across all businesses</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active / In Progress</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{activeProjects}</p>
          <p className="mt-1 text-xs text-slate-400">Live operational tracks</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Projects</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedProjects}</p>
          <p className="mt-1 text-xs text-slate-400">Successfully finalized</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aggregate Value</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
              $
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">${totalBudget.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">Total contracted budget</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by project title, code, tenant, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none shadow-xs"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_progress">In Progress</option>
          <option value="under_review">Under Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* PROJECTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-700"}`}>
                  {p.status?.replace("_", " ")?.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  {p.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                {p.title}
              </h3>

              <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-purple-500 shrink-0" />
                  Tenant: <strong className="text-slate-800 dark:text-slate-200">{p.business_name}</strong>
                </p>
                <p className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400 shrink-0" />
                  Client: <span className="text-slate-700 dark:text-slate-300">{p.client_name}</span>
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Milestone Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">
                Budget: ${p.budget.toLocaleString()}
              </span>
              <span>{p.members_count} Members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
