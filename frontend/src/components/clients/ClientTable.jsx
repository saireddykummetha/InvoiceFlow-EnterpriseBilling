import {
  Eye,
  Mail,
  Pencil,
  Phone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";

export default function ClientTable({
  clients = [],
  loading = false,
  onEdit,
  onView,
}) {
  const navigate = useNavigate();

  const columns = [
    {
      key: "name",
      label: "Client",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
            {getInitials(client.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {client.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {client.company ||
                "Individual client"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "email",
      label: "Contact",
      render: (client) => (
        <div className="space-y-1">
          {client.email && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail size={13} />
              <span className="max-w-[180px] truncate">
                {client.email}
              </span>
            </div>
          )}

          {client.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Phone size={13} />
              <span>
                {client.phone}
              </span>
            </div>
          )}
        </div>
      ),
    },

    {
      key: "totalBilled",
      label: "Total billed",
      render: (client) => (
        <span className="font-semibold text-slate-800">
          ₹
          {Number(
            client.totalBilled || 0
          ).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "outstanding",
      label: "Outstanding",
      render: (client) => (
        <span
          className={
            Number(
              client.outstanding || 0
            ) > 0
              ? "font-semibold text-amber-600"
              : "font-semibold text-emerald-600"
          }
        >
          ₹
          {Number(
            client.outstanding || 0
          ).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (client) => (
        <StatusBadge
          status={
            client.status || "active"
          }
        />
      ),
    },

    {
      key: "actions",
      label: "Actions",
      sortable: false,
      cellClassName:
        "text-right",
      render: (client) => (
        <div className="flex justify-end gap-1">
          <ActionButton
            title="View client"
            icon={Eye}
            onClick={() =>
              onView
                ? onView(client)
                : navigate(
                    `/admin/clients/${client.id}`
                  )
            }
          />

          <ActionButton
            title="Edit client"
            icon={Pencil}
            onClick={() =>
              onEdit
                ? onEdit(client)
                : navigate(
                    `/admin/clients/${client.id}/edit`
                  )
            }
          />
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        emptyTitle="No clients found"
        emptyDescription="Add your first client to start creating quotes and invoices."
        rowKey="id"
        onRowClick={(client) =>
          navigate(
            `/admin/clients/${client.id}`
          )
        }
      />
    </motion.div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <Icon size={15} />
    </button>
  );
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) =>
        word.charAt(0)
      )
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL"
  );
}