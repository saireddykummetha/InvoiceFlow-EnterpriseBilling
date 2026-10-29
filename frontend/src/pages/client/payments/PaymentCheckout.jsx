import  { useEffect, useState} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  Building,
  Building2,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,

} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";
import { loadRazorpayScript } from "../../../utils/razorpay";
import useSettings from "../../../hooks/useSettings";
import DynamicUpiQr from "../../../components/payments/DynamicUpiQr";
import DynamicNetBanking from "../../../components/payments/DynamicNetBanking";

export default function PaymentCheckout() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const {
    formatCurrency,
    getBusinessInfo,
    getPaymentDetails,
  } = useSettings();

  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi"); // "upi" | "gateway" | "bank"

  // UPI verification state
  const [utrInput, setUtrInput] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);

  // Settings from API fallback
  const [apiSettings, setApiSettings] = useState(null);


  const loadInvoiceAndSettings = async () => {
    try {
      setLoading(true);
      const [invRes, setRes] = await Promise.allSettled([
        api.get(`/invoices/${invoiceId}/`),
        api.get(`/settings/`),
      ]);

      if (invRes.status === "fulfilled") {
        const data = invRes.value?.data?.data;
        setInvoice(data);
        setAmount(String(data?.balance_due ?? data?.total ?? 0));
      } else {
        throw new Error("Unable to load invoice.");
      }

      if (setRes.status === "fulfilled") {
        setApiSettings(setRes.value?.data?.data || {});
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load invoice details.");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadInvoiceAndSettings();
  }, [invoiceId]);

  const contextBusiness = getBusinessInfo();
  const contextPayments = getPaymentDetails();

  const business = invoice?.business || apiSettings?.business || contextBusiness || {};
  const paymentSettings =
    apiSettings?.payments ||
    apiSettings?.payment ||
    apiSettings?.payment_settings ||
    contextPayments ||
    {};

  const upiId = paymentSettings.upiId || contextPayments.upiId || business.upi_id || business.upiId || "";
  const payeeName =
    business.business_name ||
    business.businessName ||
    business.companyName ||
    contextBusiness.businessName ||
    "Business Enterprise";

  const numAmount = Math.max(0, Number(amount) || 0);

  // 1. Direct Dynamic UPI Payment Confirmation (UTR Submission)
  const handleUpiConfirmation = async (e) => {
    e?.preventDefault();
    if (numAmount <= 0) {
      toast.error("Please enter a valid amount to pay.");
      return;
    }

    // Require genuine UTR number from user (no fake auto-confirm)
    if (!utrInput.trim() || utrInput.trim().length < 8) {
      toast.error("Please enter the genuine 12-digit UPI Reference / UTR Number from your payment app after completing payment.");
      return;
    }

    try {
      setSubmittingUtr(true);
      setError("");

      const finalUtr = utrInput.trim().toUpperCase();

      const res = await api.post("/payments/manual/", {
        invoice_id: Number(invoiceId),
        amount: numAmount,
        method: "upi",
        transaction_id: finalUtr,
        notes: `Dynamic UPI QR Payment settled via ${upiId || "UPI"}. UTR: ${finalUtr}`,
      });

      const paymentData = res?.data?.data?.payment || res?.data?.data;
      const paymentId = paymentData?.id || paymentData?.payment_id;

      toast.success("Payment recorded and verified successfully!");
      if (paymentId) {
        navigate(`/client/payments/success?payment_id=${paymentId}`);
      } else {
        navigate(`/client/invoices/${invoiceId}`);
      }
    } catch (err) {
      console.error("UPI settlement error:", err);
      const msg = err?.response?.data?.message || "Failed to record UPI payment.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmittingUtr(false);
    }
  };

  // 2. Razorpay Online Gateway (All Real Methods: Cards / UPI / NetBanking / Wallets / EMI)
  const payViaRazorpay = async (preferredMethod = null) => {
    try {
      setProcessing(true);
      setError("");

      const res = await loadRazorpayScript();
      if (!res || !window.Razorpay) {
        setError("Payment gateway SDK failed to load. Please check your internet connection.");
        setProcessing(false);
        return;
      }

      const orderResponse = await api.post("/payments/create-order/", {
        invoice_id: Number(invoiceId),
        amount: numAmount,
      });

      const order = orderResponse?.data?.data || orderResponse?.data;
      if (!order || !order.gateway_order_id) {
        throw new Error(orderResponse?.data?.message || "Failed to create payment order.");
      }

      const activeKey = order.key_id;
      if (!activeKey || activeKey.includes("YOUR_KEY") || activeKey.includes("placeholder")) {
        throw new Error("Razorpay API key is not configured. Please configure it in Settings -> Payments.");
      }

      // Convert Rupee to Paise (e.g. 500.00 INR -> 50000 paise)
      const amountInPaise = Math.round(Number(order.amount || numAmount) * 100);

      const prefillData = {
        name: invoice?.client?.name || invoice?.client_name || "",
        email: invoice?.client?.email || "",
        contact: invoice?.client?.phone || "",
      };

      if (preferredMethod) {
        prefillData.method = preferredMethod;
      }

      const options = {
        key: activeKey,
        amount: amountInPaise,
        currency: order.currency || "INR",
        name: payeeName || "Invoice Settlement",
        description: `Payment for Invoice ${invoice.invoice_number || invoice.id}`,
        order_id: order.gateway_order_id,
        handler: async function (response) {
          try {
            setProcessing(true);
            const verifyResponse = await api.post("/payments/verify/", {
              payment_id: order.payment_id,
              gateway_payment_id: response.razorpay_payment_id,
              gateway_signature: response.razorpay_signature,
            });

            if (verifyResponse?.data?.success || verifyResponse?.success) {
              window.location.href = `/client/payments/success?payment_id=${order.payment_id}`;
            } else {
              window.location.href = `/client/payments/failed?amount=${numAmount}&reason=VerificationFailed`;
            }
          } catch (err) {
            console.error("Verification error:", err);
            window.location.href = `/client/payments/failed?amount=${numAmount}&reason=ServerError`;
          }
        },
        prefill: prefillData,
        theme: {
          color: "#4f46e5",
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI / QR Code",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
              cards: {
                name: "Cards & NetBanking",
                instruments: [
                  {
                    method: "card",
                  },
                  {
                    method: "netbanking",
                  },
                  {
                    method: "wallet",
                  },
                  {
                    method: "paylater",
                  },
                ],
              },
            },
            sequence: ["block.upi", "block.cards"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        console.error("Payment failed event:", response.error);
        setError(response.error?.description || "Payment failed at gateway.");
        setProcessing(false);
      });
      paymentObject.open();
    } catch (err) {
      console.error("Payment error:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Payment gateway initialization failed.";
      setError(errorMsg);
      toast.error(errorMsg);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading payment checkout...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
          <p className="text-sm font-semibold text-red-600 mb-4">{error || "Invoice not found."}</p>
          <Link
            to="/client/invoices"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            <ArrowLeft size={14} /> Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-xl shadow-slate-200/50 text-center ring-1 ring-slate-100 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Processing Payment</h2>
          <p className="text-sm text-slate-500 mb-8">
            Please wait while we confirm your payment...
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            Secure 256-Bit Encrypted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          
          {/* HEADER */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-indigo-50/40 to-white">
            <Link
              to={`/client/invoices/${invoiceId}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Invoice
            </Link>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
                <ShieldCheck size={14} /> Secure Payment Checkout
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {payeeName}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Settlement for Invoice <span className="font-bold text-slate-700">{invoice.invoice_number}</span>
              </p>

              <div className="mt-4 p-3.5 rounded-2xl bg-indigo-900 text-white shadow-inner">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  Amount to Pay
                </span>
                <p className="text-3xl font-black tracking-tight mt-0.5">
                  {formatCurrency(numAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD TABS */}
          <div className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select Payment Method
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {/* 1. UPI Tab */}
              <button
                type="button"
                onClick={() => setSelectedMethod("upi")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedMethod === "upi"
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-1.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Dynamic UPI</span>
                <span className="text-[9px] text-slate-400">Scan & Apps</span>
              </button>

              {/* 2. Cards Tab */}
              <button
                type="button"
                onClick={() => setSelectedMethod("gateway")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedMethod === "gateway"
                    ? "border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-1.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Cards / Online</span>
                <span className="text-[9px] text-slate-400">Debit / Credit</span>
              </button>

              {/* 3. NetBanking Tab */}
              <button
                type="button"
                onClick={() => setSelectedMethod("netbanking")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedMethod === "netbanking"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-1.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">NetBanking</span>
                <span className="text-[9px] text-slate-400">20+ Banks</span>
              </button>

              {/* 4. Direct Bank Wire Tab */}
              <button
                type="button"
                onClick={() => setSelectedMethod("bank")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedMethod === "bank"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-1.5">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Bank Transfer</span>
                <span className="text-[9px] text-slate-400">NEFT / IMPS</span>
              </button>

              {/* 5. Cash Counter Voucher Tab */}
              <button
                type="button"
                onClick={() => setSelectedMethod("cash")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedMethod === "cash"
                    ? "border-amber-600 bg-amber-50/50 text-amber-700 shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-1.5">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Cash Counter</span>
                <span className="text-[9px] text-slate-400">Voucher Slip</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700 text-center">
                {error}
              </div>
            )}

            {/* TAB CONTENT: 1. DYNAMIC UPI */}
            {selectedMethod === "upi" && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80">
                  <DynamicUpiQr
                    upiId={upiId}
                    payeeName={payeeName}
                    amount={numAmount}
                    invoiceNumber={invoice.invoice_number}
                    size={160}
                    showApps={true}
                    showCopy={true}
                    showDetails={true}
                    allowEnlarge={true}
                  />
                </div>

                {/* 1-Click Instant Razorpay UPI Option */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => payViaRazorpay("upi")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:from-indigo-700 hover:to-violet-700 transition shadow-sm"
                  >
                    ⚡ Instant Pay with Razorpay UPI Apps & QR ({formatCurrency(numAmount)})
                  </button>
                </div>

                {/* UTR Confirmation Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Already Scanned & Paid?
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Instant Receipt
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enter your 12-digit UPI Reference / UTR number from your payment app to immediately verify and generate your official receipt.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 12-digit UPI Reference / UTR Number"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="flex-1 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      disabled={submittingUtr || !utrInput.trim()}
                      onClick={handleUpiConfirmation}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {submittingUtr ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      Submit UTR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. DYNAMIC NETBANKING */}
            {selectedMethod === "netbanking" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <DynamicNetBanking
                    amount={numAmount}
                    invoiceNumber={invoice.invoice_number}
                    payeeName={payeeName}
                    formatCurrency={formatCurrency}
                    theme="light"
                    onPaymentSuccess={async (data) => {
                      try {
                        setSubmittingUtr(true);
                        const res = await api.post("/payments/manual/", {
                          invoice_id: Number(invoiceId),
                          amount: numAmount,
                          method: "bank",
                          transaction_id: data.transactionId,
                          notes: data.notes,
                        });
                        const paymentData = res?.data?.data;
                        const paymentId = paymentData?.id || paymentData?.payment_id;
                        if (paymentId) {
                          navigate(`/client/payments/success?payment_id=${paymentId}`);
                        } else {
                          navigate(`/client/invoices/${invoiceId}`);
                        }
                      } catch (err) {
                        console.error("NetBanking settlement error:", err);
                        toast.error("Failed to record NetBanking transaction.");
                      } finally {
                        setSubmittingUtr(false);
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => payViaRazorpay("netbanking")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
                >
                  🏦 Pay via Razorpay NetBanking ({formatCurrency(numAmount)})
                </button>
              </div>
            )}

            {/* TAB CONTENT: 3. GATEWAY / CARDS */}
            {selectedMethod === "gateway" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Cards, Wallets & All Online Methods</p>
                      <p className="text-[11px] text-slate-500">Pay securely via 3D Secure Credit/Debit Card, NetBanking, Wallets or EMI</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => payViaRazorpay()}
                    disabled={numAmount <= 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Lock size={15} /> Pay {formatCurrency(numAmount)} via Razorpay (All Methods) →
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. BANK TRANSFER */}
            {selectedMethod === "bank" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Bank Name</span>
                      <span className="font-bold text-slate-800">
                        {paymentSettings.bankName || "Business Bank Account"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Account Name</span>
                      <span className="font-bold text-slate-800">
                        {paymentSettings.accountName || payeeName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Account Number</span>
                      <span className="font-mono font-bold text-slate-800">
                        {paymentSettings.accountNumber || "Provided upon invoice"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">IFSC Code</span>
                      <span className="font-mono font-bold text-slate-800">
                        {paymentSettings.ifscCode || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Real UTR Required */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      UTR / Transaction Reference <span className="text-red-500">*Required</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      After transferring, go to your bank app → Transactions → copy the UTR/Transaction ID
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. UTR202608149817294"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      disabled={submittingUtr || !utrInput.trim() || utrInput.trim().length < 8}
                      onClick={async () => {
                        const utr = utrInput.trim();
                        if (!utr || utr.length < 8) {
                          toast.error("Please enter a valid UTR/Transaction reference (min 8 characters).");
                          return;
                        }
                        try {
                          setSubmittingUtr(true);
                          const res = await api.post("/payments/manual/", {
                            invoice_id: Number(invoiceId),
                            amount: numAmount,
                            method: "bank",
                            transaction_id: utr,
                            notes: `Bank wire transfer. UTR: ${utr}`,
                          });
                          const paymentData = res?.data?.data;
                          const paymentId = paymentData?.id || paymentData?.payment_id;
                          toast.success("Bank transfer recorded successfully!");
                          if (paymentId) {
                            navigate(`/client/payments/success?payment_id=${paymentId}`);
                          } else {
                            navigate(`/client/invoices/${invoiceId}`);
                          }
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to record bank transfer.");
                        } finally {
                          setSubmittingUtr(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {submittingUtr ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Confirm Bank Transfer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. CASH COUNTER VOUCHER */}
            {selectedMethod === "cash" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Pay in Person — Cash Counter</p>
                      <p className="text-[11px] text-slate-500">Visit our office with this invoice to pay in cash.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Counter Branch:</span>
                      <span className="font-bold text-slate-800">
                        {paymentSettings.cashBranch || "Main Office / Billing Desk"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Settlement Amount:</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(numAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice Ref:</span>
                      <span className="font-mono font-bold text-slate-800">{invoice.invoice_number}</span>
                    </div>
                  </div>

                  {paymentSettings.cashInstructions && (
                    <p className="text-[11px] text-slate-600 bg-white rounded-xl border border-amber-100 px-3 py-2">
                      {paymentSettings.cashInstructions}
                    </p>
                  )}

                  <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-100 rounded-xl px-3 py-2">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      <strong>Note:</strong> Cash payments are recorded by our staff at the counter. Your invoice will be updated once the payment is received.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              NPCI Standard & 256-Bit SSL Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}