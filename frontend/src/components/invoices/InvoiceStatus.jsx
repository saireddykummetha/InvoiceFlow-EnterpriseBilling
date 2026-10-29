import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileEdit,
  Send,
  AlertCircle,
  XCircle,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";

const FLOW = [
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
    key: "pending",
    label: "Payment pending",
    icon: Clock3,
  },
  {
    key: "paid",
    label: "Paid",
    icon: CheckCircle2,
  },
];

export default function InvoiceStatus({
  status = "draft",
  compact = false,
}) {
  const normalized =
    String(status).toLowerCase();

  if (compact) {
    return (
      <StatusBadge
        status={normalized}
      />
    );
  }

  const isOverdue =
    normalized === "overdue";

  const isCancelled =
    normalized === "cancelled";

  if (isCancelled) {
    return (
      <StatusBox
        icon={XCircle}
        title="Invoice cancelled"
        description="This invoice is no longer active."
        status={status}
      />
    );
  }

  if (isOverdue) {
    return (
      <StatusBox
        icon={AlertCircle}
        title="Payment overdue"
        description="The invoice has passed its due date."
        status={status}
        danger
      />
    );
  }

  let currentIndex =
    FLOW.findIndex(
      (item) =>
        item.key === normalized
    );

  if (
    normalized === "partial"
  ) {
    currentIndex = 2;
  }

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">
          Invoice status
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Payment lifecycle
        </p>
      </div>

      <div className="space-y-4">
        {FLOW.map(
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
                  FLOW.length - 1 && (
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

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <StatusBadge
            status={status}
          />

          {normalized ===
            "paid" && (
            <CircleDollarSign
              size={18}
              className="text-emerald-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBox({
  icon: Icon,
  title,
  description,
  status,
  danger = false,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl p-4 ${
          danger
            ? "bg-red-50 text-red-700"
            : "bg-slate-50 text-slate-700"
        }`}
      >
        <Icon
          size={20}
          className="mt-0.5 shrink-0"
        />

        <div>
          <p className="text-sm font-bold">
            {title}
          </p>

          <p className="mt-1 text-xs opacity-70">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <StatusBadge
          status={status}
        />
      </div>
    </div>
  );
}