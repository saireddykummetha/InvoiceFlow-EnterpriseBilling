import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  Check,
  CreditCard,
  Smartphone,
  Wallet,
  Calendar,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

import { recordPayment } from "../../api/payments";
import useSettings from "../../hooks/useSettings";

export default function PaymentModal({
  open,
  invoice,
  onClose,
  onPaymentSuccess,
}) {
  const { formatCurrency } = useSettings();
  const isEdit = Boolean(invoice?.id);

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const payableAmount = Number(
    invoice?.balance_due ??
    invoice?.balanceDue ??
    invoice?.total ??
    0
  );

  const formattedPayable = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(payableAmount);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    try {
      setSaving(true);
      await recordPayment({
        invoice: invoice.id,
        amount: payableAmount,
        method: selectedMethod,
        transaction_id: transactionId,
        notes: paymentNotes,
      });
      
      setSuccess(true);
      toast.success("Payment recorded successfully!");
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onPaymentSuccess?.();
      }, 2000);
    } catch (err) {
      console.error("Record payment error:", err);
      toast.error(err?.response?.data?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        >
          {success ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Recorded!</h3>
              <p className="text-slate-600">
                {formattedPayable} has been recorded for Invoice #{invoice?.invoice_number}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Invoice Info */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Invoice #{invoice?.invoice_number}
                    </p>
                    <p className="text-xs text-slate-500">
                      {invoice?.client?.name || 'Client'}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formattedPayable}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="upi">UPI</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="gpay">Google Pay</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID or reference number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Add any notes about this payment"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                          <CreditCard size={16} />
                          Record Payment
                        </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
