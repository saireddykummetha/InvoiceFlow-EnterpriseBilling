import { useState, useEffect } from "react";
import {
  FileCheck,
  Upload,
  Plus,
  ExternalLink,
  Download,
} from "lucide-react";
import { getDeliverables, createDeliverable } from "../../api/deliverables";
import { getProjects } from "../../api/projects";
import toast from "react-hot-toast";

const STATUS_MAP = {
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  admin_review: { label: "Admin Review", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  revision_required: { label: "Revision Required", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  admin_approved: { label: "Admin Approved", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  client_review: { label: "Client Review", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  client_changes_requested: { label: "Client Changes Requested", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  client_approved: { label: "Client Approved 🎉", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-400 border-green-500/20" },
};

export default function VendorDeliverables() {
  const [deliverables, setDeliverables] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    project: "",
    task: "",
    version: "v1.0",
    description: "",
    external_url: "",
  });
  const [file, setFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delivData, projsData] = await Promise.all([
        getDeliverables(),
        getProjects(),
      ]);
      setDeliverables(delivData || []);
      setProjects(projsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project) {
      toast.error("Title and project are required");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("project", formData.project);
      if (formData.task) fd.append("task", formData.task);
      fd.append("version", formData.version);
      fd.append("description", formData.description);
      if (formData.external_url) fd.append("external_url", formData.external_url);
      if (file) fd.append("file_attachment", file);

      await createDeliverable(fd);
      toast.success("Deliverable submitted for Admin review!");
      setShowModal(false);
      setFormData({
        title: "",
        project: "",
        task: "",
        version: "v1.0",
        description: "",
        external_url: "",
      });
      setFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit deliverable");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="text-purple-600 dark:text-purple-400" size={26} />
            My Deliverable Submissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit milestone outputs, upload build artifacts, and track multi-tier review approvals.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 transition-all cursor-pointer"
        >
          <Upload size={18} />
          Submit Deliverable
        </button>
      </div>

      {/* DELIVERABLES LIST */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : deliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FileCheck className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No deliverables submitted</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            When you finish tasks, submit your deliverables here for admin quality checks and client sign-off.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            Submit Work Deliverable
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((deliv) => {
            const statusConfig = STATUS_MAP[deliv.status] || STATUS_MAP.submitted;

            return (
              <div
                key={deliv.id || deliv._id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-xs transition-all hover:shadow-md dark:hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{deliv.version}</span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{deliv.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Project: <strong className="text-slate-700 dark:text-slate-300">{deliv.project_title}</strong>
                      {deliv.task_title && ` • Task: ${deliv.task_title}`}
                    </p>
                  </div>

                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {deliv.description || "No description."}
                </p>

                {/* ADMIN & CLIENT FEEDBACK CALLOUTS */}
                {deliv.admin_notes && (
                  <div className="mt-3.5 p-3 rounded-xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 text-xs text-blue-700 dark:text-blue-300">
                    <strong>Admin Review Feedback:</strong> {deliv.admin_notes}
                  </div>
                )}
                {deliv.client_notes && (
                  <div className="mt-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-300">
                    <strong>Client Review Feedback:</strong> {deliv.client_notes}
                  </div>
                )}

                {/* ATTACHMENTS & LINKS */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
                  <div className="flex items-center gap-3">
                    {deliv.external_url && (
                      <a
                        href={deliv.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink size={13} /> Open Repository / Preview Link
                      </a>
                    )}
                    {deliv.file_attachment && (
                      <a
                        href={deliv.file_attachment}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <Download size={13} /> Download File
                      </a>
                    )}
                  </div>

                  <span className="text-slate-400 dark:text-slate-500">
                    Submitted on {new Date(deliv.created_at || deliv.createdAt || new Date().toISOString()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMIT DELIVERABLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload className="text-purple-600 dark:text-purple-400" size={20} />
              Submit Milestone Deliverable
            </h3>

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile UI Components Build v1.0"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select Project *
                  </label>
                  <select
                    required
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Version Tag
                  </label>
                  <input
                    type="text"
                    placeholder="v1.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  External Preview / Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Attach Deliverable File / ZIP
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Deliverable Notes & Verification Steps
                </label>
                <textarea
                  rows="3"
                  placeholder="Detail testing steps, test accounts, and architectural notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
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
                  className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? "Submitting..." : "Submit Deliverable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
