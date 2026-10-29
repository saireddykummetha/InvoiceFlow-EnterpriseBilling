import {
  CheckCircle2,
  Clock3,
  Eye,
  FileEdit,
  Send,
  XCircle,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";

const STATUS_FLOW = [
  {
    key: "draft",
    label: "Draft",
    icon: FileEdit,
  },
  {
    key: "sent",
    label: "Sent",
    icon: Send,
  },
  {
    key: "viewed",
    label: "Viewed",
    icon: Eye,
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2,
  },
];

export default function QuoteStatus({
  status = "draft",
  compact = false,
}) {
  if (compact) {
    return (
      <StatusBadge status={status} />
    );
  }

  const normalized =
    String(status).toLowerCase();

  const currentIndex =
    STATUS_FLOW.findIndex(
      (item) =>
        item.key === normalized
    );

  const rejected =
    normalized === "rejected";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">
          Quote status
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Track the quote lifecycle.
        </p>
      </div>

      {rejected ? (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-700">
          <XCircle size={20} />

          <div>
            <p className="text-sm font-bold">
              Quote rejected
            </p>

            <p className="mt-0.5 text-xs text-red-500">
              The client did not approve this quote.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {STATUS_FLOW.map(
            (item, index) => {
              const Icon = item.icon;

              const complete =
                currentIndex >=
                index;

              const current =
                currentIndex ===
                index;

              return (
                <div
                  key={item.key}
                  className="relative flex items-center gap-3"
                >
                  {index <
                    STATUS_FLOW.length -
                      1 && (
                    <div
                      className={`
                        absolute
                        left-4
                        top-9
                        h-6
                        w-px
                        ${
                          currentIndex >
                          index
                            ? "bg-slate-900"
                            : "bg-slate-200"
                        }
                      `}
                    />
                  )}

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      ${
                        complete
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    <Icon size={14} />
                  </div>

                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        complete
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </p>

                    {current && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Current status
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4">
        <StatusBadge
          status={status}
        />
      </div>
    </div>
  );
}