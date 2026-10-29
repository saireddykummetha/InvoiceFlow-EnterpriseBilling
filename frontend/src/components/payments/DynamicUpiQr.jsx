import React, { useState, useMemo, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Maximize2,
  X,
  ShieldCheck,
  Sparkles,
  QrCode as QrCodeIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import useSettings from "../../hooks/useSettings";

/**
 * DynamicUpiQr - Fully dynamic NPCI-compliant UPI QR generator & deep-linker.
 */
export default function DynamicUpiQr({
  upiId: propUpiId,
  payeeName: propPayeeName,
  amount = 0,
  invoiceNumber = "",
  transactionRef = "",
  size = 200,
  showApps = true,
  showCopy = true,
  showDetails = true,
  allowEnlarge = true,
  theme = "light",
  className = "",
}) {
  const { getPaymentDetails, getBusinessInfo } = useSettings();
  const paymentDetails = getPaymentDetails ? getPaymentDetails() : {};
  const businessInfo = getBusinessInfo ? getBusinessInfo() : {};

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return;
      const ua = navigator.userAgent || navigator.vendor || window.opera || "";
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTouchMac = navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua);
      setIsMobile(isMobileUA || isTouchMac);
    };
    checkMobile();
  }, []);

  const numAmount = Math.max(0, Number(amount) || 0);
  const cleanUpiId = (
    propUpiId ||
    paymentDetails?.upiId ||
    businessInfo?.upi_id ||
    businessInfo?.upiId ||
    ""
  ).trim();
  const cleanPayee = (
    propPayeeName ||
    paymentDetails?.accountName ||
    businessInfo?.businessName ||
    businessInfo?.companyName ||
    "Business Merchant"
  ).trim();
  const note = invoiceNumber ? `Invoice ${invoiceNumber}` : "Payment";
  const ref = transactionRef || (invoiceNumber ? invoiceNumber.replace(/[^a-zA-Z0-9]/g, "") : "");

  // Generate NPCI UPI standard string only if valid UPI ID is present
  const upiUri = useMemo(() => {
    if (!cleanUpiId) return "";
    const params = new URLSearchParams();
    params.set("pa", cleanUpiId);
    params.set("pn", cleanPayee);
    if (numAmount > 0) {
      params.set("am", numAmount.toFixed(2));
    }
    params.set("cu", "INR");
    params.set("tn", note);
    if (ref) {
      params.set("tr", ref);
    }
    params.set("mode", "02"); // Dynamic QR mode
    return `upi://pay?${params.toString()}`;
  }, [cleanUpiId, cleanPayee, numAmount, note, ref]);

  // App-specific intent URIs for instant launch on mobile
  const appLinks = useMemo(() => {
    const query = upiUri.replace("upi://pay?", "");
    return [
      {
        id: "gpay",
        name: "Google Pay",
        color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
        badgeColor: "bg-blue-600",
        uri: `tez://upi/pay?${query}`,
      },
      {
        id: "phonepe",
        name: "PhonePe",
        color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
        badgeColor: "bg-purple-600",
        uri: `phonepe://pay?${query}`,
      },
      {
        id: "paytm",
        name: "Paytm",
        color: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
        badgeColor: "bg-sky-600",
        uri: `paytmmp://pay?${query}`,
      },
      {
        id: "bhim",
        name: "BHIM UPI",
        color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
        badgeColor: "bg-emerald-600",
        uri: `bhim://pay?${query}`,
      },
      {
        id: "cred",
        name: "CRED",
        color: "bg-slate-900 text-white hover:bg-slate-800 border-slate-700",
        badgeColor: "bg-slate-900",
        uri: `cred://pay?${query}`,
      },
    ];
  }, [upiUri]);

  const handleCopyUpiId = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(cleanUpiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPaymentLink = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    toast.success("UPI payment link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAppClick = (e, app) => {
    if (!isMobile) {
      e.preventDefault();
      // On desktop, custom schemes (tez://, phonepe://) cannot launch.
      // Give feedback to scan with their phone and enlarge the QR code.
      toast(`Open ${app.name} on your phone and scan the QR code to pay!`, {
        icon: "📱",
        duration: 3500,
      });
      if (allowEnlarge) {
        setEnlarged(true);
      }
      return;
    }
    // On mobile, native browser handles the custom URI directly via user click
    window.location.href = app.uri;
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col items-center text-center ${
        isDark ? "text-slate-100" : "text-slate-800"
      } ${className}`}
    >
      {/* QR CONTAINER */}
      <div className="relative group inline-block">
        <div
          className={`p-3.5 rounded-2xl bg-white shadow-md border transition-all duration-300 ${
            isDark
              ? "border-slate-700 shadow-slate-950/40"
              : "border-slate-200/80 shadow-slate-200/60"
          } ${allowEnlarge ? "cursor-pointer hover:shadow-xl hover:scale-[1.02]" : ""}`}
          onClick={() => allowEnlarge && setEnlarged(true)}
          title={allowEnlarge ? "Click to enlarge QR code" : "Scan to Pay"}
        >
          {/* NPCI / UPI Top Header on QR card */}
          <div className="flex items-center justify-between mb-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1 text-indigo-600">
              <Sparkles size={11} /> UPI Dynamic QR
            </span>
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
              INR
            </span>
          </div>

          {/* REAL SCANNABLE QR CODE - High Definition & High Error Correction */}
          <div className="relative flex items-center justify-center p-2 bg-white rounded-2xl min-h-[160px]">
            {upiUri ? (
              <QRCodeSVG
                value={upiUri}
                size={size}
                level="H"
                includeMargin={true}
                className="rounded-xl shadow-inner border border-slate-100"
              />
            ) : (
              <div className="p-4 text-center max-w-[180px]">
                <QrCodeIcon className="mx-auto h-10 w-10 text-slate-300 mb-1" />
                <p className="text-[11px] font-bold text-slate-600">UPI ID Not Set</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Add UPI ID in Settings → Payments to generate QR</p>
              </div>
            )}
          </div>

          {/* Quick Enlarge Overlay on Hover */}
          {allowEnlarge && (
            <div className="absolute inset-0 rounded-2xl bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-semibold text-xs gap-1.5 backdrop-blur-[1px]">
              <Maximize2 size={16} /> Click to Enlarge
            </div>
          )}

          {/* Center amount badge under QR */}
          {numAmount > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-black text-slate-900">
              <span>₹{numAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS (Payee & UPI ID) */}
      {showDetails && (
        <div className="mt-3 w-full max-w-xs space-y-1">
          <p className="text-xs font-bold truncate">
            {cleanPayee}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md truncate max-w-[200px] ${
                isDark ? "bg-slate-800 text-indigo-300" : "bg-indigo-50 text-indigo-700"
              }`}
            >
              {cleanUpiId}
            </span>
            {showCopy && (
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                title="Copy UPI ID"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* UPI APPS SECTION (MOBILE DEEP LINK / DESKTOP SCAN HELP) */}
      {showApps && (
        <div className="mt-4 w-full max-w-sm">
          {/* On Mobile: Direct Pay CTA */}
          {isMobile && (
            <a
              href={upiUri}
              className="mb-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Smartphone size={14} />
              Open in Default UPI App
            </a>
          )}

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {isMobile ? "Or choose your preferred UPI app" : "Scan to Pay with Any UPI App"}
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {appLinks.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={(e) => handleAppClick(e, app)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${app.color}`}
              >
                <div className={`w-2 h-2 rounded-full ${app.badgeColor} mb-1`} />
                <span className="truncate w-full">{app.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleCopyPaymentLink}
              className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
            >
              {copiedLink ? (
                <>
                  <Check size={12} className="text-emerald-500" /> Copied Link!
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy UPI Deep Link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ENLARGED MODAL */}
      {enlarged && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setEnlarged(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEnlarged(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
              <ShieldCheck size={14} /> NPCI Dynamic UPI Scanner
            </div>

            <h3 className="text-base font-bold text-slate-900">{cleanPayee}</h3>
            {note && <p className="text-xs text-slate-500 mt-0.5">{note}</p>}

            <div className="my-5 flex items-center justify-center">
              <div className="p-4 rounded-2xl bg-white border-2 border-indigo-500 shadow-xl">
                <QRCodeSVG value={upiUri} size={240} level="H" includeMargin={false} />
              </div>
            </div>

            {numAmount > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Amount to Pay
                </span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  ₹{numAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono font-bold text-indigo-700 truncate">
                {cleanUpiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 transition"
                title="Copy UPI ID"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              Scan with any UPI app: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay or CRED
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
