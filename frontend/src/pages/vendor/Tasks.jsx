import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  MessageSquare,
  Play,
  Check,
  Send,
} from "lucide-react";
import { getTasks, updateTask, addTaskComment } from "../../api/tasks";
import toast from "react-hot-toast";

export default function VendorTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data || []);
      if (data && data.length > 0 && !selectedTask) {
        setSelectedTask(data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [selectedTask]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdateStatus = async (taskId, newStatus, newProgress) => {
    try {
      const payload = { status: newStatus };
      if (newProgress !== undefined) payload.progress_percentage = newProgress;
      if (newStatus === "completed") payload.progress_percentage = 100;

      const updated = await updateTask(taskId, payload);
      toast.success(`Task status updated to ${newStatus.replace("_", " ")}`);

      setTasks(tasks.map((t) => ((t.id === taskId || t._id === taskId) ? updated : t)));
      if (selectedTask?.id === taskId || selectedTask?._id === taskId) setSelectedTask(updated);
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    try {
      setSendingComment(true);
      await addTaskComment(selectedTask.id || selectedTask._id, { message: commentText });
      toast.success("Comment posted");
      setCommentText("");
      // Refresh task
      const updatedList = await getTasks();
      setTasks(updatedList || []);
      const refSelected = updatedList.find((t) => t.id === selectedTask.id || t._id === selectedTask.id || (selectedTask._id && t.id === selectedTask._id));
      if (refSelected) setSelectedTask(refSelected);
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="text-blue-600 dark:text-blue-500" size={26} />
            My Assigned Tasks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update work status, log progress percentages, and collaborate directly with the business admin.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <CheckCircle2 className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No assigned tasks</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Tasks assigned to your vendor profile by the business administrator will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TASK SELECTION COLUMN */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Active Tasks ({tasks.length})
            </h2>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {tasks.map((t) => {
                const isSelected = (selectedTask?.id && (selectedTask.id === t.id || selectedTask.id === t._id)) || (selectedTask?._id && (selectedTask._id === t.id || selectedTask._id === t._id));
                return (
                  <div
                    key={t.id || t._id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? "border-blue-500/60 bg-blue-50/70 dark:bg-blue-600/10 shadow-lg shadow-blue-500/5"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h4>
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {t.progress_percentage || 0}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      Project: {t.project_title || "General"}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{t.due_date ? `Due: ${t.due_date}` : "No deadline"}</span>
                      <span className="capitalize text-slate-700 dark:text-slate-300 font-semibold">{t.status?.replace("_", " ")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TASK DETAIL & ACTION COLUMN */}
          {selectedTask && (
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-xs space-y-5">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {selectedTask.project_code || "TASK"}
                  </span>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selectedTask.title}</h2>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedTask.description || "No specific instructions provided."}
                  </p>
                </div>

                {/* STATUS UPDATER BUTTONS */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Update Task Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedTask.id || selectedTask._id, "in_progress", Math.max(selectedTask.progress_percentage || 0, 25))}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 cursor-pointer"
                    >
                      <Play size={14} /> Start Working (In Progress)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTask.id || selectedTask._id, "submitted", 90)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> Mark as Submitted
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTask.id || selectedTask._id, "completed", 100)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 cursor-pointer"
                    >
                      <Check size={14} /> Mark Completed (100%)
                    </button>
                  </div>
                </div>

                {/* PROGRESS SLIDER */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Adjust Progress</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedTask.progress_percentage || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress_percentage || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleUpdateStatus(selectedTask.id || selectedTask._id, selectedTask.status, val);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* COMMENTS & COLLABORATION */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                  Task Discussions & Admin Notes
                </h3>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map((c, idx) => (
                      <div key={c.id || c._id || idx} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">{c.author_name || c.author_username}</span>
                          <span className="text-slate-400 dark:text-slate-500">{new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{c.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">No comments yet on this task.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Add progress note or ask admin a question..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !commentText.trim()}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
