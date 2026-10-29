import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Download,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

import vendorService from "../../../services/vendorService";
import VendorTable from "../../../components/vendors/VendorTable";
import VendorCard from "../../../components/vendors/VendorCard";
import VendorModal from "../../../components/vendors/VendorModal";
import VendorViewModal from "../../../components/vendors/VendorViewModal";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "goods", label: "Goods & Materials" },
  { value: "services", label: "Services & Consulting" },
  { value: "raw_materials", label: "Raw Materials" },
  { value: "logistics", label: "Logistics & Shipping" },
  { value: "utilities", label: "Utilities & Rent" },
  { value: "it_software", label: "IT & Software" },
  { value: "contractor", label: "Contractor & Freelance" },
  { value: "equipment", label: "Machinery & Equipment" },
  { value: "other", label: "Other" },
];

export default function VendorList() {


  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({
    total_vendors: 0,
    active_vendors: 0,
    inactive_vendors: 0,
    tax_registered: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & View Mode
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);

  // Delete modal state
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadVendors = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [vendorsRes, statsRes] = await Promise.all([
        vendorService.getAll(),
        vendorService.getStats().catch(() => null),
      ]);

      const list = Array.isArray(vendorsRes)
        ? vendorsRes
        : Array.isArray(vendorsRes?.data)
        ? vendorsRes.data
        : [];
      setVendors(list);

      if (statsRes) {
        setStats(statsRes);
      } else {
        // Compute locally
        const total = list.length;
        const active = list.filter((v) => v.is_active !== false).length;
        const tax = list.filter((v) => Boolean(v.tax_number)).length;
        setStats({
          total_vendors: total,
          active_vendors: active,
          inactive_vendors: total - active,
          tax_registered: tax,
        });
      }
    } catch (err) {
      console.error("Load vendors error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load vendors list."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  // Filtered list
  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();

    return vendors.filter((v) => {
      // Search
      const matchName = (v.name || "").toLowerCase().includes(q);
      const matchCompany = (v.company_name || "").toLowerCase().includes(q);
      const matchEmail = (v.email || "").toLowerCase().includes(q);
      const matchPhone = (v.phone || "").toLowerCase().includes(q);
      const matchTax = (v.tax_number || "").toLowerCase().includes(q);
      const matchCity = (v.city || "").toLowerCase().includes(q);
      const matchesSearch =
        !q ||
        matchName ||
        matchCompany ||
        matchEmail ||
        matchPhone ||
        matchTax ||
        matchCity;

      // Category
      const matchesCategory =
        selectedCategory === "all" || v.category === selectedCategory;

      // Status
      const isActive = v.is_active !== false;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && isActive) ||
        (selectedStatus === "inactive" && !isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [vendors, search, selectedCategory, selectedStatus]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredVendors.length === 0) {
      toast.error("No vendors to export.");
      return;
    }

    const headers = [
      "ID",
      "Company Name",
      "Contact Name",
      "Email",
      "Phone",
      "Category",
      "GSTIN / Tax Number",
      "PAN",
      "Address",
      "City",
      "State",
      "Postal Code",
      "Country",
      "Bank Name",
      "Account Number",
      "IFSC Code",
      "UPI ID",
      "Payment Terms",
      "Status",
    ];

    const rows = filteredVendors.map((v) => [
      v.id,
      `"${(v.company_name || "").replace(/"/g, '""')}"`,
      `"${(v.name || "").replace(/"/g, '""')}"`,
      v.email || "",
      v.phone || "",
      v.category_display || v.category || "",
      v.tax_number || "",
      v.pan_number || "",
      `"${(v.address || "").replace(/"/g, '""')}"`,
      v.city || "",
      v.state || "",
      v.postal_code || "",
      v.country || "India",
      `"${(v.bank_name || "").replace(/"/g, '""')}"`,
      v.account_number || "",
      v.ifsc_code || "",
      v.upi_id || "",
      v.payment_terms || "",
      v.is_active !== false ? "Active" : "Inactive",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Vendors_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Vendors exported to CSV!");
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      setDeleting(true);
      await vendorService.delete(vendorToDelete.id || vendorToDelete._id);
      toast.success(
        `Vendor '${vendorToDelete.company_name || vendorToDelete.name}' deleted successfully.`
      );
      setVendorToDelete(null);
      if ((viewingVendor?.id && viewingVendor.id === vendorToDelete.id) || (viewingVendor?._id && viewingVendor._id === vendorToDelete._id)) {
        setViewingVendor(null);
      }
      loadVendors(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete vendor."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Vendors & Suppliers
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your suppliers, contractors, tax details, and payment terms in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadVendors(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Refresh Vendors"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin text-blue-600" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Export CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingVendor(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Vendors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Vendors
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Building2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.total_vendors ?? vendors.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Registered supplier accounts
          </p>
        </div>

        {/* Active Vendors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Vendors
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.active_vendors ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Available for orders & expenses
          </p>
        </div>

        {/* Tax / GST Registered */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GST / Tax Verified
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.tax_registered ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            With valid GSTIN or Tax ID
          </p>
        </div>

        {/* Categories Count */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Categories Active
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Layers size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {Object.keys(stats.categories || {}).length ||
              new Set(vendors.map((v) => v.category)).size}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Distinct vendor industries
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor name, company, email, GSTIN, city..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
            {["all", "active", "inactive"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                  selectedStatus === st
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`rounded-lg p-1.5 text-xs transition ${
              viewMode === "table"
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
            title="Table View"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-1.5 text-xs transition ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Main Vendor Content Area */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Loading vendors data...
            </p>
          </div>
        ) : viewMode === "table" ? (
          <VendorTable
            vendors={filteredVendors}
            onView={(v) => setViewingVendor(v)}
            onEdit={(v) => {
              setEditingVendor(v);
              setModalOpen(true);
            }}
            onDelete={(v) => setVendorToDelete(v)}
          />
        ) : (
          <div className="p-6">
            {filteredVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 mb-3">
                  <Building2 size={28} />
                </div>
                <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  No vendors found
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  No vendor records match your search or filter criteria. Click "Add Vendor" to create one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id || vendor._id}
                    vendor={vendor}
                    onView={(v) => setViewingVendor(v)}
                    onEdit={(v) => {
                      setEditingVendor(v);
                      setModalOpen(true);
                    }}
                    onDelete={(v) => setVendorToDelete(v)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <VendorModal
        open={modalOpen}
        vendor={editingVendor}
        onClose={() => {
          setModalOpen(false);
          setEditingVendor(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditingVendor(null);
          loadVendors(true);
        }}
      />

      {/* View Detail Modal */}
      <VendorViewModal
        open={Boolean(viewingVendor)}
        vendor={viewingVendor}
        onClose={() => setViewingVendor(null)}
        onEdit={() => {
          setEditingVendor(viewingVendor);
          setViewingVendor(null);
          setModalOpen(true);
        }}
        onDelete={() => {
          setVendorToDelete(viewingVendor);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {vendorToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVendorToDelete(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delete Vendor?
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {vendorToDelete.company_name || vendorToDelete.name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVendorToDelete(null)}
                  disabled={deleting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Vendor</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
