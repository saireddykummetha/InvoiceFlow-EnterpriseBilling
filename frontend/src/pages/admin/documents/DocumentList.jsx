import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  Building2,
  Lock,
  Globe,
  Users,
} from "lucide-react";
import { getDocuments, createDocument, deleteDocument } from "../../../api/documents";
import { getProjects } from "../../../api/projects";
import toast from "react-hot-toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const ACCESS_LABELS = {
  admin_only: { label: "Admin Only", icon: Lock, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  project_members: { label: "Project & Vendors", icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  client_visible: { label: "Client & Team", icon: Building2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  public_tenant: { label: "Public Workspace", icon: Globe, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
};

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Upload modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [accessLevel, setAccessLevel] = useState("project_members");
  const [file, setFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsData, projsData] = await Promise.all([
        getDocuments({ search }),
        getProjects(),
      ]);
      setDocuments(docsData || []);
      setProjects(projsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", title || file.name);
      fd.append("file", file);
      fd.append("access_level", accessLevel);
      if (project) fd.append("project", project);

      await createDocument(fd);
      toast.success("Document uploaded successfully!");
      setShowModal(false);
      setTitle("");
      setFile(null);
      setProject("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    const docToDelete = documents.find(
      (d) => d.id === id || d._id === id
    );
    setDeleteConfirm({
      id,
      docTitle: docToDelete?.title || docToDelete?.filename || "Document"
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { id, docTitle } = deleteConfirm;

    const toastId = toast.loading(
      "Deleting document...",
      {
        position: "top-center",
      }
    );

    try {
      await deleteDocument(id);
      toast.success(
        `✅ "${docTitle}" deleted successfully!`,
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
        "Failed to delete document",
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
            <FileText className="text-blue-600 dark:text-blue-400" size={26} />
            Secure Document Repository
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store, categorize, and control role-based access for specifications, contracts, and assets.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all cursor-pointer"
        >
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search documents by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
        />
      </div>

      {/* DOCUMENT GRID */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No documents uploaded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Upload blueprints, NDAs, and project resources to share securely with clients and vendors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const access = ACCESS_LABELS[doc.access_level] || ACCESS_LABELS.project_members;
            const AccessIcon = access.icon;

            return (
              <div
                key={doc.id || doc._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-xs transition-all hover:shadow-md dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h4>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{doc.file_size || "File"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(doc.id || doc._id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    {doc.project_title && (
                      <p className="text-slate-500 dark:text-slate-400">
                        Project: <strong className="text-slate-700 dark:text-slate-300">{doc.project_title}</strong>
                      </p>
                    )}
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${access.color}`}>
                      <AccessIcon size={12} />
                      {access.label}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">{new Date(doc.created_at || doc.createdAt || Date.now).toLocaleDateString()}</span>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL */}
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
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="text-blue-600 dark:text-blue-500" size={20} />
                Upload New Document
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Service Agreement v2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Attach File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tag to Project (Optional)
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Workspace General --</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Access Authorization Level
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="admin_only">Admin Only (Confidential)</option>
                  <option value="project_members">Project Members & Assigned Vendors</option>
                  <option value="client_visible">Client & Project Team</option>
                  <option value="public_tenant">All Workspace Members</option>
                </select>
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
                  className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        type="danger"
        itemName={deleteConfirm?.docTitle}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Permanently"
      />
    </div>
  );
}
