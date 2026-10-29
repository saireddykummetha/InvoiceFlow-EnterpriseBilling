import { useState, useEffect } from "react";
import {
  FolderKanban,
  Calendar,
  // Search,
  // CheckCircle2,
  // Clock,
  
  // Layers,
  // ExternalLink,
} from "lucide-react";
import { getClientProjects } from "../../api/clientPortal";
import toast from "react-hot-toast";

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getClientProjects();
        setProjects(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderKanban className="text-blue-600 dark:text-blue-500" size={26} />
            My Active Service Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of milestones, deliverables, and operational progress for your business contracts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FolderKanban className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No active projects</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Your initialized service projects will be displayed here once started by the business administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-xs transition-all hover:shadow-md dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {proj.code || `PRJ-${proj.id}`}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                  </div>
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {proj.status?.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {proj.description || "No description provided."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                    <Calendar size={12} className="text-slate-500 dark:text-slate-400" />
                    Due: {proj.end_date || "Open Timeline"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                    Budget: <strong className="text-emerald-600 dark:text-emerald-400">${Number(proj.budget || 0).toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Overall Milestone Completion</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{proj.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                      style={{ width: `${proj.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{proj.tasks_count || 0} milestone tasks</span>
                  <span>{proj.deliverables_count || 0} deliverables submitted</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
