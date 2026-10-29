import { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { getTasks, createTask, deleteTask } from "../../../api/tasks";
import { getProjects } from "../../../api/projects";
import { getVendors } from "../../../api/vendors";
import toast from "react-hot-toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const PRIORITY_STYLES = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  urgent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const STATUS_STYLES = {
  todo: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  submitted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  under_review: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  revision_required: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blocked: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Task Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    project: "",
    assigned_vendor: "",
    priority: "medium",
    due_date: "",
    estimated_hours: "",
    description: "",
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, vendorsData] = await Promise.all([
        getTasks({ search, status: statusFilter }),
        getProjects(),
        getVendors().catch(() => []),
      ]);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
      setVendors(vendorsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project) {
      toast.error("Title and project are required");
      return;
    }
    try {
      setSubmitting(true);
      await createTask(formData);
      toast.success("Task created successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        project: "",
        assigned_vendor: "",
        priority: "medium",
        due_date: "",
        estimated_hours: "",
        description: "",
      });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (e, taskId) => {
    e.stopPropagation();
    const taskToDelete = tasks.find(
      (t) => t.id === taskId || t._id === taskId
    );
    setDeleteConfirm({
      id: taskId,
      taskTitle: taskToDelete?.title || "Task"
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { id, taskTitle } = deleteConfirm;

    const toastId = toast.loading("Deleting task...", {
      position: "top-center",
    });

    try {
      await deleteTask(id);
      toast.success(
        `✅ "${taskTitle}" deleted successfully!`,
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete task",
        {
          id: toastId,
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-500" size={26} />
            Task Management & Operations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign work items to vendors, monitor progress, and review milestones.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "pending", "in_progress", "submitted", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <CheckCircle2 className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No tasks found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Create tasks under active projects and assign them to your registered vendors.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const statusClass = STATUS_STYLES[task.status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
            const priorityClass = PRIORITY_STYLES[task.priority] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

            return (
              <div
                key={task.id || task._id}
                onClick={() => {
                  if (task.project) {
                    navigate(`/admin/projects/${task.project}`);
                  } else {
                    toast.error('This task is not assigned to any project');
                  }
                }}
                className={`group flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 backdrop-blur-xl transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-slate-700 shadow-xs ${!task.project ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {task.project_code || `PRJ-${task.project}`}
                    </span>
                    <span className="text-slate-400">•</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {task.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description || "No description."}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    {task.assigned_vendor_name && (
                      <span>Vendor: <strong className="text-slate-800 dark:text-white">{task.assigned_vendor_name}</strong></span>
                    )}
                    {task.due_date && <span>Due: <strong className="text-slate-700 dark:text-slate-300">{task.due_date}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-24 text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{task.progress_percentage || 0}%</span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mt-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${task.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}>
                    {task.priority}
                  </span>

                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                    {task.status?.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-500" size={20} />
                Create New Task
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Select Project *
                </label>
                <select
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.code ? `[${p.code}] ` : ""}{p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Responsive Mobile Header"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Assign Vendor
                  </label>
                  <select
                    value={formData.assigned_vendor}
                    onChange={(e) => setFormData({ ...formData, assigned_vendor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id || v._id} value={v.id || v._id}>
                        {v.name} ({v.company_name || v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="15"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Task details and instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
