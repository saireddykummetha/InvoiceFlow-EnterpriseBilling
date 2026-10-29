import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
} from "lucide-react";
import { getDeliverable, adminReviewDeliverable } from "../../../api/deliverables";
import toast from "react-hot-toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

export default function DeliverableDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deliverable, setDeliverable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getDeliverable(id);
      setDeliverable(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deliverable details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAdminApproveClick = () => {
    setApproveConfirm(true);
  };

  const handleAdminApproveConfirm = async () => {
    const toastId = toast.loading("Approving deliverable...", {
      position: "top-center",
    });

    try {
      setReviewing(true);
      await adminReviewDeliverable(id, {
        action: "approve",
        feedback: feedback || "Admin quality check passed. Forwarded for client review.",
      });
      toast.success(
        "Deliverable approved and forwarded to Client!",
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
      fetchDetails();
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
      setApproveConfirm(false);
    }
  };

  const handleAdminApproveCancel = () => {
    setApproveConfirm(false);
  };

  const handleAdminReject = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("Please provide revision feedback for the vendor");
      return;
    }
    try {
      setReviewing(true);
      await adminReviewDeliverable(id, {
        action: "reject",
        feedback: feedback,
      });
      toast.success("Revision request sent to Vendor");
      setShowRejectModal(false);
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit rejection");
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!deliverable) {
    return <div className="p-8 text-center text-slate-400">Deliverable not found.</div>;
  }

  const isPendingAdmin = ["submitted", "admin_review"].includes(deliverable.status);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* TOP NAV */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => navigate("/admin/deliverables")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Deliverables Review
        </button>

        <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
          Deliverable #{deliverable.id}
        </span>
      </div>

      {/* HEADER CARD */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                {deliverable.version}
              </span>
              <span className="rounded-full border border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {deliverable.status?.replace("_", " ")}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{deliverable.title}</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Project: <strong className="text-slate-700 dark:text-slate-300">{deliverable.project_title}</strong> • Client: <strong className="text-slate-700 dark:text-slate-300">{deliverable.client_company || deliverable.client_name}</strong>
            </p>
          </div>

          {/* ACTION BUTTONS */}
          {isPendingAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={reviewing}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <XCircle size={16} />
                Request Revision
              </button>
              <button
                onClick={handleAdminApproveClick}
                disabled={reviewing}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} />
                Approve & Send to Client
              </button>
            </div>
          )}
        </div>

        {/* DETAILS BODY */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submission Description</h3>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {deliverable.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {deliverable.external_url && (
              <a
                href={deliverable.external_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:border-blue-500/40 transition-all shadow-xs"
              >
                <ExternalLink size={14} />
                Open External Preview / Repository Link
              </a>
            )}
            {deliverable.file_attachment && (
              <a
                href={deliverable.file_attachment}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:border-emerald-500/40 transition-all shadow-xs"
              >
                <Download size={14} />
                Download Attached Deliverable File
              </a>
            )}
          </div>
        </div>
      </div>

      {/* APPROVAL & AUDIT HISTORY */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-purple-600 dark:text-purple-400" />
          Approval Workflow & Review Trail
        </h2>

        {deliverable.approvals && deliverable.approvals.length > 0 ? (
          <div className="space-y-3">
            {deliverable.approvals.map((appr) => (
              <div
                key={appr.id}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40"
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                  appr.action === "approve" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {appr.action === "approve" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{appr.reviewer_role}</span>
                    <span className="text-[11px] text-slate-500">by {appr.reviewer_name || appr.reviewer_username}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">• {new Date(appr.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{appr.feedback || "No feedback note."}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No reviews recorded yet.</p>
        )}
      </div>

      {/* REJECT / REVISION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
              <AlertCircle size={20} />
              Request Revisions from Vendor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Specify what modifications or fixes are required before approving this deliverable.
            </p>
            <form onSubmit={handleAdminReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Revision Feedback *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="e.g. Please update the authorization headers and include automated test scripts..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer shadow-xs"
                >
                  Submit Revision Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={approveConfirm}
        title="Approve Deliverable"
        message="Approve this deliverable and send it for Client Review?"
        type="info"
        itemName={deliverable?.title || "Deliverable"}
        loading={reviewing}
        onClose={handleAdminApproveCancel}
        onConfirm={handleAdminApproveConfirm}
        confirmText="Approve & Send to Client"
      />
    </div>
  );
}
