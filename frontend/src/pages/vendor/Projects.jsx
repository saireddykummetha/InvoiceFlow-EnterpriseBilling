import  { useState, useEffect } from "react";
import {
  FolderKanban,
  Search,
  Clock,

} from "lucide-react";
import { getProjects } from "../../api/projects";
import toast from "react-hot-toast";

export default function VendorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects({ search });
        setProjects(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load assigned projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [search]);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderKanban className="text-blue-600 dark:text-blue-500" size={26} />
            My Assigned Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track projects assigned by your business administrator and monitor milestone goals.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search assigned projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
        />
      </div>

      {/* PROJECT GRID */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FolderKanban className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No assigned projects</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Projects assigned to your vendor organization by the admin will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-xs transition-all hover:shadow-md dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {proj.code || `PRJ-${proj.id}`}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                  </div>
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {proj.status?.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {proj.description || "No description provided."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                    Priority: <strong className="uppercase text-amber-600 dark:text-amber-400">{proj.priority}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                    <Clock size={12} className="text-slate-500 dark:text-slate-400" />
                    Due: {proj.end_date || "Open Timeline"}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Overall Progress</span>
                    <span className="text-slate-900 dark:text-white font-bold">{proj.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                      style={{ width: `${proj.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{proj.tasks_count || 0} active tasks</span>
                  <span>{proj.deliverables_count || 0} deliverables</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
