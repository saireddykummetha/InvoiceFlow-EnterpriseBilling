import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  // MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Filter,
  UserPlus,
  Loader2,
  RefreshCw,
  Building2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import clientService from "../../../services/clientService";
import useSettings from "../../../hooks/useSettings";

export default function ClientList() {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ==========================================================
  // LOAD REAL CLIENTS FROM DATABASE
  // ==========================================================

  const loadClients = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("Loading clients...");
      const response = await clientService.getAll();
      console.log("Clients response:", response);

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.results)) {
        data = response.results;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.success && Array.isArray(response?.data)) {
        data = response.data;
      }

      console.log("Setting clients:", data);
      console.log("Number of clients:", data.length);
      setClients(data);
    } catch (error) {
      console.error("Load clients error:", error);
      console.error("Error response:", error?.response);

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to load clients"
      );
      
      // Set empty array on error to prevent infinite loading
      setClients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const name =
        client.name ||
        client.client_name ||
        "";

      const company =
        client.company ||
        client.company_name ||
        "";

      const email = client.email || "";
      const phone = client.phone || "";

      const clientStatus =
        client.status ||
        (client.is_active === false
          ? "inactive"
          : "active");

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        company.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" ||
        clientStatus === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [clients, search, status]);

  // ==========================================================
  // DYNAMIC STATISTICS
  // ==========================================================

  const totalClients = clients.length;

  const activeClients = clients.filter(
    (client) =>
      client.is_active !== false &&
      String(client.status || "Active")
        .toLowerCase() !== "inactive"
  ).length;

  const inactiveClients =
    totalClients - activeClients;

  const totalOutstanding = clients.reduce(
    (total, client) => {
      return (
        total +
        Number(
          client.outstanding ??
          client.outstanding_amount ??
          0
        )
      );
    },
    0
  );

  // ==========================================================
  // DELETE FROM DATABASE
  // ==========================================================

  const handleDeleteClick = (id) => {
    const clientToDelete = clients.find(
      (c) => c.id === id || c._id === id
    );
    setDeleteConfirm({
      id,
      name: clientToDelete?.name || clientToDelete?.client_name || "this client"
    });
    setOpenMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { id, name } = deleteConfirm;

    const toastId = toast.loading(
      "Deleting client...",
      {
        position: "top-center",
      }
    );

    try {
      setDeletingId(id);

      await clientService.delete(id);

      setClients((current) =>
        current.filter(
          (client) => client.id !== id && client._id !== id
        )
      );

      toast.success(
        `✅ "${name}" deleted successfully!`,
        {
          id: toastId,
          position: "top-center",
          duration: 3000,
        }
      );
    } catch (error) {
      console.error(
        "Delete client error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to delete client",
        {
          id: toastId,
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span className="text-sm font-medium">
            Loading clients...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-full">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              loadClients(true)
            }
            disabled={refreshing}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/clients/add")
            }
            className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />

            Add Client
          </button>

        </div>
      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          title="Total clients"
          value={totalClients}
          description="Clients "
        />

        <StatCard
          icon={UserPlus}
          title="Active clients"
          value={activeClients}
          description="Currently active"
        />

        <StatCard
          icon={Building2}
          title="Inactive clients"
          value={inactiveClients}
          description="Currently inactive"
        />

        <StatCard
          icon={Users}
          title="Outstanding"
          value={`₹${totalOutstanding.toLocaleString(
            "en-IN"
          )}`}
          description="Total outstanding"
        />

      </div>

      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-md">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search clients..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />

          </div>

          <div className="relative">

            <Filter
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="All">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {filteredClients.length === 0 ? (
          <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users size={28} />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              {clients.length === 0
                ? "No clients yet"
                : "No clients found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {clients.length === 0
                ? "Create your first client. The client will be stored in your Django database."
                : "Try changing your search or status filter."}
            </p>

            {clients.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/clients/add")
                }
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add your first client
              </button>
            )}

          </div>
        ) : (
          <>
            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Client
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Invoices
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Outstanding
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredClients.map(
                    (client, index) => {

                      const name =
                        client.name ||
                        client.client_name ||
                        "Unnamed Client";

                      const company =
                        client.company ||
                        client.company_name ||
                        "";

                      const invoiceCount =
                        client.invoice_count ??
                        client.invoiceCount ??
                        0;

                      const outstanding =
                        Number(
                          client.outstanding ??
                          client.outstanding_amount ??
                          0
                        );

                      const clientStatus =
                        client.status ||
                        (client.is_active === false
                          ? "inactive"
                          : "active");

                      return (
                        <tr
                          key={`cli_row_${client.id || index}_${index}`}
                          className="transition hover:bg-slate-50"
                        >

                          {/* CLIENT */}

                          <td className="px-6 py-4">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/clients/${client.id || client._id}`
                                )
                              }
                              className="flex items-center gap-3 text-left"
                            >

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                                {name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-semibold text-slate-900 hover:underline">
                                  {name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {company ||
                                    "Individual client"}
                                </p>

                              </div>

                            </button>

                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-4">

                            <div className="space-y-1">

                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail size={14} />
                                {client.email ||
                                  "No email"}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Phone size={13} />
                                {client.phone ||
                                  "No phone"}
                              </div>

                            </div>

                          </td>

                          {/* INVOICES */}

                          <td className="px-6 py-4">

                            <span className="text-sm font-semibold text-slate-700">
                              {invoiceCount}
                            </span>

                          </td>

                          {/* OUTSTANDING */}

                          <td className="px-6 py-4">

                            <span className="text-sm font-semibold text-slate-900">
                              {formatCurrency(outstanding)}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">

                            <StatusBadge
                              status={
                                clientStatus
                              }
                            />

                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-4 text-right">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() => navigate(`/admin/clients/${client.id || client._id}`)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                                title="View Client"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => navigate(`/admin/clients/${client.id || client._id}/edit`)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Edit Client"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === (client.id || client._id)}
                                onClick={() => handleDeleteClick(client.id || client._id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Delete Client"
                              >
                                {deletingId === client.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* ==================================================
                MOBILE CARDS
            ================================================== */}

            <div className="divide-y divide-slate-100 md:hidden">

              {filteredClients.map(
                (client, index) => {

                  const name =
                    client.name ||
                    client.client_name ||
                    "Unnamed Client";

                  const company =
                    client.company ||
                    client.company_name ||
                    "";

                  const outstanding =
                    Number(
                      client.outstanding ??
                      client.outstanding_amount ??
                      0
                    );

                  return (
                    <div
                      key={`cli_mob_${client.id || index}_${index}`}
                      className="p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/clients/${client.id || client._id}`
                            )
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                            {name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-900">
                              {name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {company ||
                                "Individual client"}
                            </p>

                          </div>

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/clients/${client.id || client._id}/edit`
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                          <Pencil size={17} />
                        </button>

                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-[11px] text-slate-400">
                            Invoices
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-900">
                            {client.invoice_count || 0}
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-[11px] text-slate-400">
                            Outstanding
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-900">
                            {formatCurrency(client.outstanding || 0)}
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-[11px] text-slate-400">
                            Status
                          </p>

                          <StatusBadge
                            status={clientStatus}
                            size="sm"
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
}

// ============================================================
// STATUS
// ============================================================

function StatusBadge({ status, size = "md" }) {
  const active =
    String(status).toLowerCase() ===
    "active";

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-100 text-slate-500"
        }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active
          ? "bg-emerald-500"
          : "bg-slate-400"
          }`}
      />

      {status === "active" ? "Active" : status === "inactive" ? "Inactive" : status || "Active"}
    </span>
  );
}

// ============================================================
// CUSTOM DELETE CONFIRMATION MODAL
// ============================================================

function DeleteConfirmModal({ isOpen, clientName, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete Client
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Are you sure you want to delete <strong>"{clientName}"</strong>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500 shadow-md shadow-red-600/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}