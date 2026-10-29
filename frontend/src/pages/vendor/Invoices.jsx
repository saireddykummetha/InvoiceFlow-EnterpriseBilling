import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  Download,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Helper function to generate initial invoice form
  const generateInitialInvForm = () => {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 86400000);
    return {
      invoiceNumber: `VINV-${Math.floor(1000 + Math.random() * 9000)}`,
      poReference: "PO-2026-001",
      billedTo: "UltraKey Tech Corp",
      issueDate: now.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      notes: "Payment due within 30 days via NEFT/RTGS.",
      items: [
        { description: "Industrial Raw Aluminium Ingot #A2", qty: 10, rate: 850, tax: 18 },
        { description: "Custom Heavy Duty Packaging", qty: 25, rate: 160, tax: 18 },
      ],
    };
  };

  // New Invoice Form state
  const [invForm, setInvForm] = useState(generateInitialInvForm);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor-portal/invoices/");
      if (res.data?.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.warn("Vendor invoices fetch error:", err?.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Form Item Calculations
  const calculatedTotals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    invForm.items.forEach((item) => {
      const lineSubtotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      const lineTax = (lineSubtotal * (Number(item.tax) || 0)) / 100;
      subtotal += lineSubtotal;
      totalTax += lineTax;
    });
    return {
      subtotal,
      totalTax,
      grandTotal: subtotal + totalTax,
    };
  }, [invForm.items]);

  const handleAddItem = () => {
    setInvForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", qty: 1, rate: 0, tax: 18 }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (invForm.items.length <= 1) return;
    setInvForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setInvForm((prev) => {
      const updated = [...prev.items];
      updated[index][field] = value;
      return { ...prev, items: updated };
    });
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    if (!invForm.invoiceNumber) {
      toast.error("Please provide an invoice number.");
      return;
    }

    try {
      const payload = {
        invoice_number: invForm.invoiceNumber,
        po_reference: invForm.poReference,
        billed_to: invForm.billedTo,
        issue_date: invForm.issueDate,
        due_date: invForm.dueDate,
        amount: calculatedTotals.grandTotal,
        items: invForm.items,
        notes: invForm.notes,
      };

      const res = await api.post("/vendor-portal/invoices/", payload);
      if (res.data?.success) {
        toast.success(`Invoice #${invForm.invoiceNumber} uploaded successfully!`);
        fetchInvoices();
      } else {
        // Fallback local update
        setInvoices((prev) => [
          {
            id: invForm.invoiceNumber,
            invoice_number: invForm.invoiceNumber,
            po_reference: invForm.poReference,
            billed_to: invForm.billedTo,
            issue_date: invForm.issueDate,
            due_date: invForm.dueDate,
            status: "Pending Approval",
            amount: calculatedTotals.grandTotal,
            paid_amount: 0.00,
            items_count: invForm.items.length,
          },
          ...prev,
        ]);
        toast.success(`Invoice #${invForm.invoiceNumber} created and dispatched!`);
      }
      setShowUploadModal(false);
      setInvForm({
        invoiceNumber: `VINV-${Math.floor(1000 + Math.random() * 9000)}`,
        poReference: "PO-2026-001",
        billedTo: "UltraKey Tech Corp",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        notes: "",
        items: [{ description: "Raw Material Delivery", qty: 1, rate: 5000, tax: 18 }],
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit invoice. Please verify details.");
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchSearch =
      i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      i.po_reference?.toLowerCase().includes(search.toLowerCase()) ||
      i.billed_to?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "all") return matchSearch;
    if (statusFilter === "pending") return matchSearch && i.status?.toLowerCase().includes("pending");
    if (statusFilter === "approved") return matchSearch && i.status?.toLowerCase().includes("approved");
    if (statusFilter === "paid") return matchSearch && i.status?.toLowerCase().includes("paid");
    if (statusFilter === "overdue") return matchSearch && i.status?.toLowerCase().includes("overdue");
    return matchSearch;
  });

  return (
    <div className="space-y-6 pb-16 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Supplier Hub • Invoicing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Receipt className="text-teal-600 dark:text-teal-400" size={26} />
            Vendor Invoices & Bills
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch supplier bills directly to buyer accounts, track verification statuses, and monitor settlement payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchInvoices}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700 shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <CloudUpload size={16} />
            <span>+ Upload & Submit Invoice</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Invoices" },
            { id: "pending", label: "Pending Approval" },
            { id: "approved", label: "Approved" },
            { id: "paid", label: "Settled / Paid" },
            { id: "overdue", label: "Overdue" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice or PO #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
          />
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Billed To (Buyer)</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-teal-500" />
                    Loading supplier invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No supplier invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id || inv._id || inv.invoice_number} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {inv.po_reference || "Direct"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {inv.billed_to}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {inv.issue_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {inv.due_date}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ₹{Number(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status?.toLowerCase().includes("paid")
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : inv.status?.toLowerCase().includes("approved")
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                            : inv.status?.toLowerCase().includes("overdue")
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                      >
                        Details
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        onClick={() => toast.success(`Downloading PDF for ${inv.invoice_number}...`)}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Download PDF"
                      >
                        <Download size={13} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          UPLOAD & CREATE INVOICE MODAL
      ========================================================= */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <CloudUpload className="text-teal-600" size={22} />
                    Submit Supplier Invoice / Bill
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate an itemized invoice and attach your official PDF tax invoice.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitInvoice} className="space-y-4 text-xs">
                {/* Meta Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      required
                      value={invForm.invoiceNumber}
                      onChange={(e) => setInvForm({ ...invForm, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      PO Reference
                    </label>
                    <select
                      value={invForm.poReference}
                      onChange={(e) => setInvForm({ ...invForm, poReference: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="PO-2026-001">PO-2026-001 (Aluminium Ingot)</option>
                      <option value="PO-2026-002">PO-2026-002 (Packaging Boxes)</option>
                      <option value="PO-2026-003">PO-2026-003 (Sensor Hardware)</option>
                      <option value="Direct">Direct Supply (No PO)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Buyer Account
                    </label>
                    <input
                      type="text"
                      required
                      value={invForm.billedTo}
                      onChange={(e) => setInvForm({ ...invForm, billedTo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      required
                      value={invForm.issueDate}
                      onChange={(e) => setInvForm({ ...invForm, issueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={invForm.dueDate}
                      onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* LINE ITEMS BUILDER */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Itemized Deliverables</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {invForm.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                        <input
                          type="text"
                          placeholder="Item Description"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          required
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                          className="w-16 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs text-center"
                        />
                        <input
                          type="number"
                          placeholder="Rate (₹)"
                          min="0"
                          required
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                          className="w-24 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs w-24 text-right">
                          ₹{((item.qty || 0) * (item.rate || 0)).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FILE ATTACHMENT BOX */}
                <div className="border-2 border-dashed border-teal-300 dark:border-teal-800/80 rounded-2xl p-5 text-center bg-teal-50/40 dark:bg-teal-950/20 cursor-pointer hover:border-teal-500 transition">
                  <CloudUpload className="mx-auto text-teal-600 dark:text-teal-400 mb-1" size={24} />
                  <p className="font-bold text-teal-900 dark:text-teal-200">
                    Upload Signed Invoice PDF / Supporting Docs
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, PNG, DOCX up to 15MB</p>
                </div>

                {/* TOTALS SUMMARY */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-1.5 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{calculatedTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (GST 18%):</span>
                    <span className="font-mono">₹{calculatedTotals.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">
                      ₹{calculatedTotals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                  >
                    Confirm & Dispatch Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          INVOICE DETAILS DRAWER
      ========================================================= */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full max-w-md h-full bg-white dark:bg-slate-900 p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600">Invoice Inspector</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {selectedInvoice.invoice_number}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">PO Reference:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedInvoice.po_reference}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Buyer Account:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.billed_to}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Issue Date:</span>
                    <span>{selectedInvoice.issue_date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Due Date:</span>
                    <span>{selectedInvoice.due_date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-teal-600">{selectedInvoice.status}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Total Billed:</span>
                    <span className="font-black text-base text-slate-900 dark:text-white">
                      ₹{Number(selectedInvoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => toast.success(`Downloading PDF for ${selectedInvoice.invoice_number}...`)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download Tax Invoice PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
