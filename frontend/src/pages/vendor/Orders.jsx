import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Eye,
  Package,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Helper function to generate initial dispatch form
  const generateInitialDispatchForm = () => {
    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 5 * 86400000);
    return {
      courierName: "BlueDart Express",
      trackingNumber: `1Z${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: estimatedDelivery.toISOString().split("T")[0],
      notes: "Shipped with tamper-evident waterproof packaging.",
    };
  };

  // Dispatch details state
  const [dispatchForm, setDispatchForm] = useState(generateInitialDispatchForm);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor-portal/orders/");
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.warn("Orders fetch error:", err?.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStep = (orderId, newStep, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => ((o.id === orderId || o._id === orderId) ? { ...o, current_step: newStep, status: newStatus } : o))
    );
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder._id === orderId)) {
      setSelectedOrder((prev) => ({ ...prev, current_step: newStep, status: newStatus }));
    }
    toast.success(`Order ${orderId} updated to "${newStatus}"!`);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === selectedOrder.id || o.id === selectedOrder._id || o._id === selectedOrder.id || o._id === selectedOrder._id)
          ? {
              ...o,
              current_step: 2,
              status: "In Transit",
              courier: dispatchForm.courierName,
              tracking_id: dispatchForm.trackingNumber,
            }
          : o
      )
    );
    setSelectedOrder((prev) => ({
      ...prev,
      current_step: 2,
      status: "In Transit",
      courier: dispatchForm.courierName,
      tracking_id: dispatchForm.trackingNumber,
    }));
    toast.success(`Shipment dispatched! Tracking ID: ${dispatchForm.trackingNumber}`);
    setShowDispatchModal(false);
  };

  const filteredOrders = orders.filter((o) => {
    const match =
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.client_name?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "all") return match;
    if (statusFilter === "pending") return match && o.status === "PO Issued";
    if (statusFilter === "progress") return match && (o.status === "In Progress" || o.status === "In Transit");
    if (statusFilter === "delivered") return match && (o.status === "Delivered" || o.status === "Completed");
    return match;
  });

  return (
    <div className="space-y-6 pb-16 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Supplier Hub • Fulfillment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Package className="text-teal-600 dark:text-teal-400" size={26} />
            Purchase Orders & Delivery Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accept buyer orders, update courier tracking milestones, and monitor quality check certifications.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700 shadow-xs self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "New POs (Action Required)" },
            { id: "progress", label: "In Transit / Progress" },
            { id: "delivered", label: "Delivered & Fulfilled" },
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

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
          />
        </div>
      </div>

      {/* ORDERS & STEPPERS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id || order._id || order.order_number}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 hover:shadow-md transition"
          >
            {/* Top Row: PO info and amount */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-teal-700 dark:text-teal-400">
                    {order.order_number}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{order.client_name}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {order.title}
                </h3>
              </div>

              <div className="sm:text-right">
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  ₹{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-slate-400">Due: {order.due_date}</span>
              </div>
            </div>

            {/* INTERACTIVE DELIVERY PROGRESS STEPPER */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl">
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold mb-2">
                <span className={order.current_step >= 1 ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}>
                  1. PO Issued
                </span>
                <span className={order.current_step >= 2 ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}>
                  2. Dispatched
                </span>
                <span className={order.current_step >= 3 ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}>
                  3. In Transit / QC
                </span>
                <span className={order.current_step >= 4 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                  4. Delivered
                </span>
              </div>

              {/* Progress bar line */}
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1 p-0.5">
                <div
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    order.current_step >= 1 ? "bg-teal-500" : "bg-transparent"
                  }`}
                />
                <div
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    order.current_step >= 2 ? "bg-teal-500" : "bg-transparent"
                  }`}
                />
                <div
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    order.current_step >= 3 ? "bg-amber-400 animate-pulse" : "bg-transparent"
                  }`}
                />
                <div
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    order.current_step >= 4 ? "bg-emerald-500" : "bg-transparent"
                  }`}
                />
              </div>

              {/* Tracking & Courier info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-teal-600 dark:text-teal-400" />
                  <span>Courier: <b className="text-slate-800 dark:text-slate-200">{order.courier || "Pending"}</b></span>
                  <span>•</span>
                  <span>Tracking: <b className="font-mono text-cyan-600 dark:text-cyan-400">{order.tracking_id || "Unassigned"}</b></span>
                </div>

                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-[11px] text-slate-400">Current Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS & MILESTONE TRIGGERS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Eye size={14} /> View Order Deliverables & Specs
              </button>

              <div className="flex items-center gap-2">
                {order.current_step === 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStep(order.id || order._id, 2, "In Progress")}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      ✓ Accept Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDispatchModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      <Truck size={13} className="inline mr-1" /> Mark Dispatched
                    </button>
                  </>
                )}

                {order.current_step === 2 && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStep(order.id || order._id, 3, "In Transit")}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    Quality Check Intimation
                  </button>
                )}

                {order.current_step === 3 && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStep(order.id || order._id, 4, "Delivered")}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    ✓ Confirm Delivery to Buyer
                  </button>
                )}

                {order.current_step >= 4 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Order Fulfilled & Ready for Invoicing
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DISPATCH DELIVERY MODAL */}
      <AnimatePresence>
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="text-teal-600" size={20} />
                  Dispatch Order & Enter Tracking
                </h3>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.courierName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, courierName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    AWB / Tracking Number
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.trackingNumber}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, trackingNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-cyan-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dispatchForm.estimatedDelivery}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, estimatedDelivery: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER DELIVERABLES DRAWER */}
      <AnimatePresence>
        {selectedOrder && !showDispatchModal && (
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
                    <span className="text-[10px] uppercase font-bold text-teal-600">PO Deliverables</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {selectedOrder.order_number}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl space-y-1">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedOrder.title}</p>
                    <p className="text-slate-400">Buyer: {selectedOrder.client_name}</p>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">Required Line Deliverables</h4>
                  <div className="space-y-2">
                    {selectedOrder.deliverables?.map((d, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                          <p className="text-[11px] text-slate-400">Specs: {d.specs}</p>
                        </div>
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{d.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => toast.success(`Downloading PO Contract for ${selectedOrder.order_number}...`)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download Official PO (PDF)
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
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
