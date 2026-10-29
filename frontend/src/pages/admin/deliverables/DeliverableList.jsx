import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Search,
  Eye,
} from "lucide-react";
import { getDeliverables } from "../../../api/deliverables";
import toast from "react-hot-toast";

const STATUS_BADGES = {
  submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  admin_review: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  revision_required: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  admin_approved: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  client_review: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  client_changes_requested: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  client_approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function DeliverableList() {
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const data = await getDeliverables({ status: statusFilter, search });
      setDeliverables(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="text-purple-600 dark:text-purple-400" size={26} />
            Deliverables & Review Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review vendor submissions, approve & forward to clients, or request revisions.
          </p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search deliverables, projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "submitted", "client_review", "client_approved", "revision_required"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE / LIST */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : deliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FileCheck className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No deliverables in queue</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Vendor deliverable submissions will appear here for Admin review and Client routing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliverables.map((deliv) => {
            const badgeClass = STATUS_BADGES[deliv.status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

            return (
              <div
                key={deliv.id}
                onClick={() => navigate(`/admin/deliverables/${deliv.id}`)}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        {deliv.version} • {deliv.project_title}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {deliv.title}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                      {deliv.status?.replace("_", " ")}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {deliv.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                      Vendor: <strong className="text-slate-900 dark:text-white">{deliv.vendor_name}</strong>
                    </span>
                    {deliv.client_company && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                        Client: <strong className="text-slate-900 dark:text-white">{deliv.client_company}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(deliv.created_at).toLocaleDateString()}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:underline flex items-center gap-1">
                    Inspect & Review <Eye size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
