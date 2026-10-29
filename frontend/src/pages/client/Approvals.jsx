import  { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertCircle,
} from "lucide-react";
import { getClientApprovals } from "../../api/clientPortal";
import { clientReviewDeliverable } from "../../api/deliverables";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function ClientApprovals() {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  // Changes requested modal
  const [selectedDeliv, setSelectedDeliv] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await getClientApprovals();
      setDeliverables(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deliverables for approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApproveClick = (id, title) => {
    setApproveConfirm({ id, title });
  };

  const handleApproveConfirm = async () => {
    if (!approveConfirm) return;

    const { id, title } = approveConfirm;

    const toastId = toast.loading("Approving deliverable...", {
      position: "top-center",
    });

    try {
      setReviewing(true);
      await clientReviewDeliverable(id, {
        action: "approve",
        feedback: "Approved by client. Looks excellent!",
      });
      toast.success(
        "Deliverable successfully approved!",
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      fetchApprovals();
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to approve deliverable",
        {
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setReviewing(false);
      setApproveConfirm(null);
    }
  };

  const handleApproveCancel = () => {
    setApproveConfirm(null);
  };

  const handleRequestChanges = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !selectedDeliv) {
      toast.error("Please specify the requested modifications");
      return;
    }

    try {
      setReviewing(true);
      await clientReviewDeliverable(selectedDeliv.id, {
        action: "request_changes",
        feedback: feedback,
      });
      toast.success("Change request sent to business team");
      setShowChangesModal(false);
      setSelectedDeliv(null);
      setFeedback("");
      fetchApprovals();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit change request");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="text-emerald-500 dark:text-emerald-400" size={26} />
            Deliverables & Approvals Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review submitted milestone outputs, verify build quality, and provide formal sign-off.
          </p>
        </div>
      </div>

      {/* DELIVERABLES LIST */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : deliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FileCheck className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No deliverables pending review</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            When the business team completes a project milestone, you will receive a notification and the output will appear here for sign-off.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {deliverables.map((deliv) => {
            const isApproved = ["client_approved", "completed"].includes(deliv.status);
            const isPending = ["admin_approved", "client_review"].includes(deliv.status);

            return (
              <div
                key={deliv.id}
                className={`rounded-3xl border p-6 backdrop-blur-xl transition-all ${
                  isPending
                    ? "border-emerald-500/40 bg-white dark:bg-slate-900/80 shadow-xl shadow-emerald-500/5"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{deliv.version}</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{deliv.title}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : isPending
                          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}>
                        {deliv.status?.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Project: <strong className="text-slate-700 dark:text-slate-300">{deliv.project_title}</strong>
                    </p>
                  </div>

                  {/* APPROVAL / REVISION BUTTONS */}
                  {isPending && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedDeliv(deliv);
                          setShowChangesModal(true);
                        }}
                        disabled={reviewing}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                      >
                        <AlertCircle size={15} />
                        Request Changes
                      </button>

                      <button
                        onClick={() => handleApproveClick(deliv.id, deliv.title)}
                        disabled={reviewing}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                        Approve Deliverable
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {deliv.description || "No description provided."}
                </p>

                {/* ADMIN APPROVAL NOTE IF PRESENT */}
                {deliv.admin_notes && (
                  <div className="mt-3 p-3 rounded-xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 text-xs text-blue-700 dark:text-blue-300">
                    <strong>Admin Verification:</strong> {deliv.admin_notes}
                  </div>
                )}

                {/* ATTACHMENTS */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs">
                  <div className="flex items-center gap-4">
                    {deliv.external_url && (
                      <a
                        href={deliv.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink size={14} /> Open Live Preview / Repo Link
                      </a>
                    )}
                    {deliv.file_attachment && (
                      <a
                        href={deliv.file_attachment}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <Download size={14} /> Download Deliverable Artifact
                      </a>
                    )}
                  </div>

                  <span className="text-slate-400 dark:text-slate-500">
                    Submitted on {new Date(deliv.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUEST CHANGES MODAL */}
      {showChangesModal && selectedDeliv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setShowChangesModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle size={20} />
                Request Milestone Modifications
              </h3>
              <button
                type="button"
                onClick={() => setShowChangesModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Describe the adjustments or fixes needed before final sign-off.
            </p>

            <form onSubmit={handleRequestChanges} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Change Request Details *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="e.g. Please update the logo alignment on mobile view and check the currency symbol..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangesModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  Send Change Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!approveConfirm}
        title="Approve Deliverable"
        message="Approve this deliverable and mark it as completed?"
        type="info"
        itemName={approveConfirm?.title || "Deliverable"}
        loading={reviewing}
        onClose={handleApproveCancel}
        onConfirm={handleApproveConfirm}
        confirmText="Approve"
      />
    </div>
  );
}
