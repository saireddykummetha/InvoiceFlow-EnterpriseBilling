import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Building2,
  Layers,
  CreditCard,
  Sparkles,
  Lock,
} from "lucide-react";
import { getProjects, createProject, getProjectStats } from "../../../api/projects";
import { getClients } from "../../../api/clients";
import { getVendors } from "../../../api/vendors";
import api from "../../../services/api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  assigned: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  in_progress: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  under_review: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  client_review: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  client_approved: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0, under_review: 0, total_budget: 0 });
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [subscriptionUsage, setSubscriptionUsage] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Project Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    client: "",
    priority: "medium",
    status: "active",
    budget: "",
    start_date: "",
    end_date: "",
    description: "",
    vendor_ids: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projData, statsData, clientsData, vendorsData, subData] = await Promise.all([
        getProjects({ search, status: statusFilter }),
        getProjectStats(),
        getClients().catch(() => []),
        getVendors().catch(() => []),
        api.get("/subscriptions/usage/").then((r) => r.data?.data).catch(() => null),
      ]);
      setProjects(projData || []);
      setStats(statsData || { total: 0, active: 0, completed: 0, pending: 0, under_review: 0, total_budget: 0 });
      setClients(clientsData || []);
      setVendors(vendorsData || []);
      if (subData) setSubscriptionUsage(subData);
    } catch (err) {
      console.error("Error loading projects:", err);
      // quiet fail on background route load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    if (subscriptionUsage?.trial_exhausted || (subscriptionUsage?.upgrade_required && subscriptionUsage?.is_trial)) {
      setShowUpgradeModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        client: formData.client || null,
        priority: formData.priority || "medium",
        status: formData.status || "active",
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description?.trim() || "",
        vendor_ids: formData.vendor_ids || [],
      };
      if (formData.code?.trim()) {
        payload.code = formData.code.trim();
      }

      await createProject(payload);
      toast.success("Project created successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        code: "",
        client: "",
        priority: "medium",
        status: "active",
        budget: "",
        start_date: "",
        end_date: "",
        description: "",
        vendor_ids: [],
      });
      fetchData();
    } catch (err) {
      console.error('Create project error:', err);
      console.error('Error response:', err.response?.data);
      const errCode = err.response?.data?.code;
      const data = err.response?.data;
      let errMsg = "Failed to create project";

      if (typeof data === "string") {
        errMsg = data;
      } else if (data?.message) {
        errMsg = data.message;
      } else if (data?.error) {
        errMsg = data.error;
      } else if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        errMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : typeof val === "string" ? `${firstKey}: ${val}` : "Failed to create project";
      }

      if (errCode === "TRIAL_EXHAUSTED" || errCode === "PROJECT_LIMIT_REACHED") {
        setShowModal(false);
        setShowUpgradeModal(true);
        toast.error(errMsg);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <FolderKanban className="text-blue-600 dark:text-blue-400" size={26} />
              Projects & Operations Hub
            </h1>

            {subscriptionUsage && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  subscriptionUsage.is_trial
                    ? subscriptionUsage.trial_exhausted
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
              >
                <CreditCard size={13} />
                {subscriptionUsage.is_trial
                  ? subscriptionUsage.trial_exhausted
                    ? "Free Trial Completed (5/5)"
                    : `Free Trial: ${subscriptionUsage.projects.used} / 5`
                  : `${subscriptionUsage.plan_name}: ${subscriptionUsage.projects.used} / ${subscriptionUsage.projects.limit}`}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage end-to-end client deliverables, vendor assignments, and milestone progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {subscriptionUsage?.trial_exhausted && (
            <button
              onClick={() => navigate("/admin/subscription")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:scale-105 transition"
            >
              <Sparkles size={15} />
              Upgrade Plan
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition-all cursor-pointer ${
              subscriptionUsage?.trial_exhausted
                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-purple-500"
                : "bg-blue-600 text-white shadow-blue-600/25 hover:bg-blue-500"
            }`}
          >
            {subscriptionUsage?.trial_exhausted ? <Lock size={16} /> : <Plus size={18} />}
            Create Project
          </button>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Projects</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">All registered workspaces</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active / In Progress</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Live operational tracks</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Under Review</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.under_review}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pending admin/client review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Successfully finalized</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search projects by title, code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
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
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* PROJECTS GRID / TABLE */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/20">
          <FolderKanban className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Create your first project or adjust search filters to explore active workspaces.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/admin/projects/${proj.id}`)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[proj.status] || "bg-slate-100 text-slate-700"}`}>
                    {proj.status?.replace("_", " ")?.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {proj.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                  {proj.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  {proj.members?.length || 0} Members
                </span>

                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition">
                  View Track <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Project</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud ERP Migration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Client Association
                  </label>
                  <select
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">No Client (Internal)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.contact_person || c.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Assign Vendors
                </label>
                <select
                  multiple
                  value={formData.vendor_ids}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, vendor_ids: selected });
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  size={3}
                >
                  {vendors.length === 0 ? (
                    <option value="" disabled>No vendors available</option>
                  ) : (
                    vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name || v.company_name || v.email}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple vendors</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline milestones, objectives, and deliverables..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPGRADE REQUIRED MODAL */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUpgradeModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-purple-300 dark:border-purple-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl text-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 mb-4">
              <Sparkles size={32} />
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider mb-2">
              Free Trial Completed
            </span>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              You've reached your free 5 projects!
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Your free trial included 5 projects (5/5 used). To continue creating new client projects and assigning vendors, upgrade to a paid plan.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/admin/subscription");
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition active:scale-95 cursor-pointer"
              >
                Upgrade Now →
              </button>

              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
