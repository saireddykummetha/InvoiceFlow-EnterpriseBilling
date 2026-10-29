import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  FileSignature,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getClients } from "../../api/clients";
import { createQuote, updateQuote } from "../../api/quotes";
import useSettings from "../../hooks/useSettings";

export default function QuoteModal({
  open,
  quote = null, // null = Create, object = Edit
  preselectedClientId = null,
  onClose,
  onSuccess,
}) {
  const { getQuoteDefaults, formatCurrency, settings } = useSettings();
  const isEdit = Boolean(quote?.id);

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [clientId, setClientId] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [template, setTemplate] = useState("template1");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, rate: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [saving, setSaving] = useState(false);

  // Load clients on modal open and initialize defaults
  useEffect(() => {
    if (open) {
      setLoadingClients(true);
      getClients()
        .then((res) => {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.results)
            ? res.results
            : [];
          setClients(list);
        })
        .catch((err) => {
          console.error("Failed to load clients for quote:", err);
        })
        .finally(() => {
          setLoadingClients(false);
        });

      if (quote) {
        setClientId(quote.client_id || quote.client?.id || quote.client || preselectedClientId || "");
        setQuoteNumber(quote.quote_number || quote.number || "");
        setTemplate(quote.template || settings?.quote?.selectedTemplate || "template1");
        setIssueDate(quote.issue_date || quote.date || new Date().toISOString().split("T")[0]);
        setExpiryDate(quote.expiry_date || quote.expiry || quote.valid_until || "");
        setStatus(quote.status || "draft");

        const quoteItems = Array.isArray(quote.items)
          ? quote.items
          : Array.isArray(quote.quote_items)
          ? quote.quote_items
          : [];

        if (quoteItems.length > 0) {
          setItems(
            quoteItems.map((item, idx) => ({
              id: item.id || idx + 1,
              description: item.description || item.name || "",
              quantity: Number(item.quantity || 1),
              rate: Number(item.rate ?? item.unit_price ?? item.price ?? 0),
            }))
          );
        } else {
          setItems([{ id: 1, description: "", quantity: 1, rate: 0 }]);
        }

        setDiscount(Number(quote.discount || quote.discount_amount || 0));
        setTaxRate(Number(quote.tax_rate ?? quote.taxRate ?? quote.gst_rate ?? 0));
        setShipping(Number(quote.shipping || quote.shipping_amount || 0));
        setNotes(quote.notes || "");
        setTerms(quote.terms || "");
      } else {
        const defaults = getQuoteDefaults();
        setClientId(preselectedClientId || "");
        setQuoteNumber(defaults.quoteNumber || "");
        setTemplate(defaults.selectedTemplate || "template1");
        setIssueDate(defaults.issueDate);
        setExpiryDate(defaults.expiryDate);
        setStatus("draft");
        setItems([{ id: 1, description: "", quantity: 1, rate: 0 }]);
        setDiscount(0);
        setTaxRate(defaults.taxRate || 0);
        setShipping(0);
        setNotes(defaults.notes || "");
        setTerms(defaults.terms || "");
      }
    }
  }, [open, quote, preselectedClientId, getQuoteDefaults, settings]);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const q = Number(item.quantity || 0);
      const r = Number(item.rate || 0);
      return sum + q * r;
    }, 0);
  }, [items]);

  const taxableAmount = Math.max(subtotal - Number(discount || 0), 0);
  const taxAmount = (taxableAmount * Number(taxRate || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount + Number(shipping || 0);

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error("Quotation must have at least one line item");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    const validItems = items.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item with a description");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        client: clientId,
        client_id: clientId,
        issue_date: issueDate,
        expiry_date: expiryDate,
        status: status,
        discount: Number(discount || 0),
        tax_rate: Number(taxRate || 0),
        shipping: Number(shipping || 0),
        notes: notes.trim(),
        terms: terms.trim(),
        template: template,
        items: validItems.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.rate || 0),
          rate: Number(item.rate || 0),
        })),
      };

      if (quoteNumber.trim()) {
        payload.quote_number = quoteNumber.trim();
      }

      let result;
      if (isEdit) {
        result = await updateQuote(quote.id, payload);
        toast.success("Quotation updated successfully");
      } else {
        result = await createQuote(payload);
        toast.success("Quotation created successfully");
      }

      onSuccess?.(result?.data || result);
      onClose?.();
    } catch (err) {
      console.error("Save quote error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.non_field_errors?.[0] ||
        `Unable to ${isEdit ? "update" : "create"} quotation`;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="quote-modal-overlay"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FileSignature size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isEdit ? `Edit Quotation #${quote?.quote_number || quote?.id}` : "Create New Quotation"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Prepare and send estimates or price proposals to your clients
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Client & Metadata Row */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    >
                      <option value="">Select a client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || c.client_name} {c.company ? `(${c.company})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    PDF Template
                  </label>
                  <select
                    value={quote?.template || "template1"}
                    onChange={() => {}}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="template1">Modern Proposal</option>
                    <option value="template2">Clean Estimate</option>
                    <option value="template3">Creative Pitch</option>
                    <option value="template4">Formal Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Issue Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Valid Until / Expiry
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Presets:</span>
                {[
                  { desc: "Full Stack Web Development", rate: 45000 },
                  { desc: "Brand Identity & Logo Design", rate: 15000 },
                  { desc: "Server Migration & Setup", rate: 8000 },
                  { desc: "Annual Maintenance Contract", rate: 18000 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setItems((prev) => [
                        ...prev.filter((i) => i.description.trim()),
                        { id: Date.now(), description: preset.desc, quantity: 1, rate: preset.rate },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Plus size={11} /> {preset.desc.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quotation Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const rowTotal = Number(item.quantity || 0) * Number(item.rate || 0);

                    return (
                      <div
                        key={item.id || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
                      >
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            required
                            placeholder="Item description (e.g. Cloud Hosting & Migration)"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, "description", e.target.value)
                            }
                            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="w-20">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", e.target.value)
                              }
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 text-center dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            />
                          </div>

                          <div className="w-28">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Rate"
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(index, "rate", e.target.value)
                              }
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 text-right dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            />
                          </div>

                          <div className="w-28 text-right font-bold text-sm text-slate-900 dark:text-slate-100 pr-1 truncate">
                            {formatCurrency(rowTotal)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals, Terms & Notes */}
              <div className="grid gap-6 sm:grid-cols-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={2}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder="Quotation validity & payment conditions..."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Proposal Notes & Memo
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Project scope, turnaround time, validity terms..."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 space-y-2.5 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Discount</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-24 h-7 px-2 text-right rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Tax Rate (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-24 h-7 px-2 text-right rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Estimated Total
                    </span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 dark:border-slate-800">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700"
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving
                    ? isEdit
                      ? "Updating..."
                      : "Creating..."
                    : isEdit
                    ? "Update Quotation"
                    : "Save Quotation"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
