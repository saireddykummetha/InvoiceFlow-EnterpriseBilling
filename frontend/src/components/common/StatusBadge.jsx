import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  CircleDollarSign,
  Send,
  FileText,
} from "lucide-react";

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: CheckCircle2,
  },

  success: {
    label: "Success",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: CheckCircle2,
  },

  approved: {
    label: "Approved",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: CheckCircle2,
  },

  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
    icon: Clock3,
  },

  sent: {
    label: "Sent",
    className:
      "bg-blue-50 text-blue-700 ring-blue-600/10",
    icon: Send,
  },

  draft: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-600 ring-slate-500/10",
    icon: FileText,
  },

  overdue: {
    label: "Overdue",
    className:
      "bg-red-50 text-red-700 ring-red-600/10",
    icon: AlertCircle,
  },

  rejected: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 ring-red-600/10",
    icon: XCircle,
  },

  failed: {
    label: "Failed",
    className:
      "bg-red-50 text-red-700 ring-red-600/10",
    icon: XCircle,
  },

  partial: {
    label: "Partially Paid",
    className:
      "bg-orange-50 text-orange-700 ring-orange-600/10",
    icon: CircleDollarSign,
  },

  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: CheckCircle2,
  },

  inactive: {
    label: "Inactive",
    className:
      "bg-slate-100 text-slate-600 ring-slate-500/10",
    icon: XCircle,
  },
};

export default function StatusBadge({
  status,
  label,
}) {
  const key = String(status || "")
    .toLowerCase()
    .replaceAll(" ", "_");

  const config =
    STATUS_CONFIG[key] ||
    STATUS_CONFIG.pending;

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-xs
        font-semibold
        ring-1
        ring-inset
        ${config.className}
      `}
    >
      <Icon size={13} />

      {label || config.label}
    </span>
  );
}