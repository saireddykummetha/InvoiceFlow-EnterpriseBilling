import {
  Building2,
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  Phone,
  Receipt,
  WalletCards,
} from "lucide-react";

import { motion } from "framer-motion";

import StatusBadge from "../common/StatusBadge";

export default function ClientDetails({
  client,
}) {
  if (!client) {
    return null;
  }

  const stats = [
    {
      label: "Quotes",
      value: client.quoteCount || 0,
      icon: FileText,
    },
    {
      label: "Invoices",
      value: client.invoiceCount || 0,
      icon: Receipt,
    },
    {
      label: "Payments",
      value: client.paymentCount || 0,
      icon: WalletCards,
    },
  ];

  return (
    <div className="space-y-5">
      {/* PROFILE */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl font-bold text-white">
            {client.name
              ?.split(" ")
              .map(
                (part) =>
                  part.charAt(0)
              )
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-950">
                {client.name}
              </h2>

              <StatusBadge
                status={
                  client.status ||
                  "active"
                }
              />
            </div>

            <p className="mt-1 text-sm text-slate-400">
              {client.company ||
                "Business client"}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {client.email && (
                <Detail
                  icon={Mail}
                  label="Email"
                  value={client.email}
                />
              )}

              {client.phone && (
                <Detail
                  icon={Phone}
                  label="Phone"
                  value={client.phone}
                />
              )}

              {client.address && (
                <Detail
                  icon={MapPin}
                  label="Address"
                  value={client.address}
                />
              )}

              {client.createdAt && (
                <Detail
                  icon={CalendarDays}
                  label="Created"
                  value={client.createdAt}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(
          (stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index * 0.05,
                }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon size={18} />
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-950">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {stat.label}
                </p>
              </motion.div>
            );
          }
        )}
      </div>

      {/* FINANCIAL */}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <WalletCards size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Billing summary
              </h3>

              <p className="text-xs text-slate-400">
                Customer financial overview
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <AmountRow
              label="Total billed"
              value={
                client.totalBilled
              }
            />

            <AmountRow
              label="Total paid"
              value={
                client.totalPaid
              }
              positive
            />

            <AmountRow
              label="Outstanding"
              value={
                client.outstanding
              }
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Building2 size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Business information
              </h3>

              <p className="text-xs text-slate-400">
                Registered customer details
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="Company"
              value={
                client.company ||
                "—"
              }
            />

            <InfoItem
              label="GSTIN"
              value={
                client.gstin || "—"
              }
            />

            <InfoItem
              label="City"
              value={
                client.city || "—"
              }
            />

            <InfoItem
              label="State"
              value={
                client.state || "—"
              }
            />

            <InfoItem
              label="Postal code"
              value={
                client.postalCode ||
                "—"
              }
            />

            <InfoItem
              label="Country"
              value={
                client.country ||
                "India"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={15}
        className="mt-0.5 shrink-0 text-slate-400"
      />

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-xs font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function AmountRow({
  label,
  value,
  positive = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`
          text-sm
          font-bold
          ${
            positive
              ? "text-emerald-600"
              : "text-slate-900"
          }
        `}
      >
        ₹
        {Number(
          value || 0
        ).toLocaleString(
          "en-IN"
        )}
      </span>
    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}