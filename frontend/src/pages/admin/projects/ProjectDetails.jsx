import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FolderKanban,
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  MessageSquare,
  Trash2,
  Edit3,
  UserPlus,
  Send,
  ExternalLink,
} from "lucide-react";
import {
  getProject,
  updateProject,
  deleteProject,
  assignVendorToProject,
  removeVendorFromProject,
} from "../../../api/projects";
import { getVendors } from "../../../api/vendors";
import { getTasks, createTask } from "../../../api/tasks";
import { getDeliverables } from "../../../api/deliverables";
import toast from "react-hot-toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorRole, setVendorRole] = useState("Assigned Vendor");

  // Confirm dialogs
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(false);
  const [removeVendorConfirm, setRemoveVendorConfirm] = useState(null);

  // Task form
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_vendor: "",
    due_date: "",
    estimated_hours: "",
  });

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projData, tasksData, delivsData, vendorsData] = await Promise.all([
        getProject(id),
        getTasks({ project_id: id }),
        getDeliverables({ project_id: id }),
        getVendors().catch(() => []),
      ]);
      
      if (!projData) {
        toast.error("Project not found");
        navigate('/admin/projects');
        return;
      }
      
      setProject(projData);
      setTasks(tasksData || []);
      setDeliverables(delivsData || []);
      setAllVendors(vendorsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project details");
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleAssignVendor = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) {
      toast.error("Please select a vendor");
      return;
    }
    try {
      await assignVendorToProject(id, { vendor_id: selectedVendorId, role: vendorRole });
      toast.success("Vendor assigned to project");
      setShowVendorModal(false);
      fetchProjectData();
    } catch (err) {
      console.error('Assign vendor error:', err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to assign vendor";
      toast.error(errMsg);
    }
  };

  const handleRemoveVendorClick = (vendorId) => {
    const vendorToRemove = project?.vendors?.find(
      (v) => v.id === vendorId || v._id === vendorId
    );
    setRemoveVendorConfirm({
      id: vendorId,
      vendorName: vendorToRemove?.name || vendorToRemove?.company_name || "Vendor"
    });
  };

  const handleRemoveVendorConfirm = async () => {
    if (!removeVendorConfirm) return;

    const { id } = removeVendorConfirm;

    const toastId = toast.loading("Removing vendor...", {
      position: "top-center",
    });

    try {
      await removeVendorFromProject(id, id);
      toast.success(
        "Vendor removed from project",
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      fetchProjectData();
    } catch (err) {
      console.error('Remove vendor error:', err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to remove vendor";
      toast.error(
        errMsg,
        {
          id: toastId,
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setRemoveVendorConfirm(null);
    }
  };

  const handleRemoveVendorCancel = () => {
    setRemoveVendorConfirm(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    try {
      await createTask({
        ...taskForm,
        project: id,
        assigned_vendor: taskForm.assigned_vendor || null,
      });
      toast.success("Task created!");
      setShowTaskModal(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        assigned_vendor: "",
        due_date: "",
        estimated_hours: "",
      });
      fetchProjectData();
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  const handleDeleteProjectClick = () => {
    setDeleteProjectConfirm(true);
  };

  const handleDeleteProjectConfirm = async () => {
    const toastId = toast.loading("Deleting project...", {
      position: "top-center",
    });

    try {
      await deleteProject(id);
      toast.success(
        "Project deleted successfully",
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      navigate("/admin/projects");
    } catch (err) {
      toast.error(
        "Failed to delete project",
        {
          id: toastId,
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setDeleteProjectConfirm(false);
    }
  };

  const handleDeleteProjectCancel = () => {
    setDeleteProjectConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-400">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate("/admin/projects")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteProjectClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* PROJECT HEADER CARD */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-blue-400">
                {project.code || `PRJ-${project.id}`}
              </span>
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                {project.status?.replace("_", " ")}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-white">
              {project.title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-3xl">
              {project.description || "No project description."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client</span>
              <p className="text-sm font-semibold text-white">
                {project.client_company || project.client_name || "Unassigned"}
              </p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</span>
              <p className="text-sm font-semibold text-emerald-400">
                ${Number(project.budget || 0).toLocaleString()}
              </p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline</span>
              <p className="text-xs font-medium text-slate-300">
                {project.start_date || "N/A"} → {project.end_date || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Project Completion Progress</span>
            <span className="text-blue-400">{project.progress_percentage || 0}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, project.progress_percentage || 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* THREE SECTION GRID: ASSIGNED VENDORS, TASKS, DELIVERABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: ASSIGNED VENDORS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Assigned Vendors
            </h2>
            <button
              onClick={() => setShowVendorModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <UserPlus size={14} />
              Add Vendor
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            {project.members && project.members.length > 0 ? (
              project.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{m.vendor_name}</p>
                    <p className="text-xs text-slate-400">{m.vendor_company || m.role}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveVendorClick(m.vendor)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No vendors assigned yet.</p>
            )}
          </div>
        </div>

        {/* SECTION 2 & 3: TASKS & DELIVERABLES */}
        <div className="lg:col-span-2 space-y-6">
          {/* TASKS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Project Tasks ({tasks.length})
              </h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <Plus size={14} />
                New Task
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{task.title}</h4>
                        <span className="text-[10px] font-bold uppercase rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                        {task.assigned_vendor_name && (
                          <span>Assigned: <strong className="text-slate-300">{task.assigned_vendor_name}</strong></span>
                        )}
                        {task.due_date && <span>Due: {task.due_date}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-blue-400">{task.progress_percentage || 0}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No tasks added to this project.</p>
              )}
            </div>
          </div>

          {/* DELIVERABLES & APPROVALS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck size={18} className="text-purple-400" />
                Submitted Deliverables ({deliverables.length})
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              {deliverables.length > 0 ? (
                deliverables.map((deliv) => (
                  <div
                    key={deliv.id}
                    onClick={() => navigate(`/admin/deliverables/${deliv.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-blue-500/40 transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-400">{deliv.version}</span>
                        <h4 className="text-sm font-bold text-white">{deliv.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{deliv.description}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Submitted by: {deliv.vendor_name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        {deliv.status?.replace("_", " ")}
                      </span>
                      <ExternalLink size={16} className="text-slate-500" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No deliverables submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ASSIGN VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Assign Vendor to Project</h3>
            <form onSubmit={handleAssignVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Select Vendor *
                </label>
                <select
                  required
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Vendor --</option>
                  {allVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.company_name || v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assignment Role
                </label>
                <input
                  type="text"
                  value={vendorRole}
                  onChange={(e) => setVendorRole(e.target.value)}
                  placeholder="e.g. Lead Developer, QA Specialist"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Assign Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Payment Gateway Module"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Assign Vendor
                  </label>
                  <select
                    value={taskForm.assigned_vendor}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_vendor: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Vendor --</option>
                    {allVendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="20"
                    value={taskForm.estimated_hours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Task instructions and expectations..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteProjectConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        type="danger"
        itemName={project?.name || "Project"}
        onClose={handleDeleteProjectCancel}
        onConfirm={handleDeleteProjectConfirm}
        confirmText="Delete Permanently"
      />

      <ConfirmDialog
        open={!!removeVendorConfirm}
        title="Remove Vendor"
        message="Are you sure you want to remove this vendor from the project?"
        type="warning"
        itemName={removeVendorConfirm?.vendorName}
        onClose={handleRemoveVendorCancel}
        onConfirm={handleRemoveVendorConfirm}
        confirmText="Remove Vendor"
      />
    </div>
  );
}
