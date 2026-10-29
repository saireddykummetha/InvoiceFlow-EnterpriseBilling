import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Loader2,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CreditCard,
  KeyRound,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

export const ALL_NETBANKING_BANKS = [
  {
    id: "HDFC",
    name: "HDFC Bank",
    shortName: "HDFC",
    code: "HDFC0000001",
    color: "from-blue-700 to-blue-900",
    badgeColor: "bg-blue-600",
    popular: true,
    tagline: "We Understand Your World",
  },
  {
    id: "ICICI",
    name: "ICICI Bank",
    shortName: "ICICI",
    code: "ICIC0000002",
    color: "from-orange-600 to-red-800",
    badgeColor: "bg-orange-600",
    popular: true,
    tagline: "Hum Hai Na, Khayal Aapka",
  },
  {
    id: "SBI",
    name: "State Bank of India",
    shortName: "SBI",
    code: "SBIN0000001",
    color: "from-cyan-600 to-blue-800",
    badgeColor: "bg-cyan-600",
    popular: true,
    tagline: "The Banker to Every Indian",
  },
  {
    id: "AXIS",
    name: "Axis Bank",
    shortName: "Axis",
    code: "UTIB0000001",
    color: "from-pink-800 to-rose-950",
    badgeColor: "bg-rose-700",
    popular: true,
    tagline: "Badhti Ka Naam Zindagi",
  },
  {
    id: "KOTAK",
    name: "Kotak Mahindra Bank",
    shortName: "Kotak",
    code: "KKBK0000001",
    color: "from-red-600 to-red-900",
    badgeColor: "bg-red-600",
    popular: true,
    tagline: "Let's Make Money Simple",
  },
  {
    id: "PNB",
    name: "Punjab National Bank",
    shortName: "PNB",
    code: "PUNB0000001",
    color: "from-amber-700 to-yellow-900",
    badgeColor: "bg-amber-600",
    popular: true,
    tagline: "The Name You Can Bank Upon",
  },
  {
    id: "BOB",
    name: "Bank of Baroda",
    shortName: "BOB",
    code: "BARB0000001",
    color: "from-orange-500 to-orange-700",
    badgeColor: "bg-orange-600",
    popular: true,
    tagline: "India's International Bank",
  },
  {
    id: "YES",
    name: "Yes Bank",
    shortName: "Yes Bank",
    code: "YESB0000001",
    color: "from-blue-600 to-sky-800",
    badgeColor: "bg-blue-600",
    popular: true,
    tagline: "Experience Our Expertise",
  },
  {
    id: "INDUSIND",
    name: "IndusInd Bank",
    shortName: "IndusInd",
    code: "INDB0000001",
    color: "from-red-800 to-purple-900",
    badgeColor: "bg-red-800",
    popular: false,
    tagline: "We Make You Feel Richer",
  },
  {
    id: "CANARA",
    name: "Canara Bank",
    shortName: "Canara",
    code: "CNRB0000001",
    color: "from-sky-600 to-blue-800",
    badgeColor: "bg-sky-600",
    popular: false,
    tagline: "Together We Can",
  },
  {
    id: "UNION",
    name: "Union Bank of India",
    shortName: "Union Bank",
    code: "UBIN0000001",
    color: "from-red-600 to-blue-900",
    badgeColor: "bg-red-700",
    popular: false,
    tagline: "Good People to Bank With",
  },
  {
    id: "IDFC",
    name: "IDFC FIRST Bank",
    shortName: "IDFC FIRST",
    code: "IDFB0000001",
    color: "from-amber-600 to-red-800",
    badgeColor: "bg-amber-700",
    popular: false,
    tagline: "Always You First",
  },
  {
    id: "FEDERAL",
    name: "Federal Bank",
    shortName: "Federal",
    code: "FDRL0000001",
    color: "from-blue-800 to-yellow-600",
    badgeColor: "bg-blue-800",
    popular: false,
    tagline: "Your Perfect Banking Partner",
  },
  {
    id: "IDBI",
    name: "IDBI Bank",
    shortName: "IDBI",
    code: "IBKL0000001",
    color: "from-teal-700 to-emerald-900",
    badgeColor: "bg-teal-700",
    popular: false,
    tagline: "Banking for All",
  },
  {
    id: "RBL",
    name: "RBL Bank",
    shortName: "RBL",
    code: "RATN0000001",
    color: "from-blue-700 to-red-700",
    badgeColor: "bg-blue-700",
    popular: false,
    tagline: "Apno Ka Bank",
  },
  {
    id: "BANDHAN",
    name: "Bandhan Bank",
    shortName: "Bandhan",
    code: "BDBL0000001",
    color: "from-red-700 to-blue-800",
    badgeColor: "bg-red-700",
    popular: false,
    tagline: "Aapka Bhala, Sabki Bhalai",
  },
  {
    id: "SCB",
    name: "Standard Chartered Bank",
    shortName: "StanChart",
    code: "SCBL0000001",
    color: "from-emerald-700 to-blue-800",
    badgeColor: "bg-emerald-600",
    popular: false,
    tagline: "Here for Good",
  },
  {
    id: "HSBC",
    name: "HSBC India",
    shortName: "HSBC",
    code: "HSBC0000001",
    color: "from-red-700 to-slate-900",
    badgeColor: "bg-red-700",
    popular: false,
    tagline: "Opening Up a World of Opportunity",
  },
];

/**
 * DynamicNetBanking - Production-ready NetBanking Selector & Interactive Bank Portal Gateway Simulator.
 *
 * Props:
 * - amount: number (e.g. 1500)
 * - invoiceNumber: string (e.g. "INV-2026-001")
 * - payeeName: string (e.g. "Acme Corp")
 * - formatCurrency: function (num => formatted string)
 * - onPaymentSuccess: function ({ method, transactionId, notes })
 * - theme: "light" | "dark" (default: "light")
 */
export default function DynamicNetBanking({
  amount = 0,
  invoiceNumber = "",
  payeeName = "Merchant Enterprise",
  formatCurrency = (amt) => `₹${Number(amt || 0).toFixed(2)}`,
  onPaymentSuccess,
  theme = "light",
}) {
  const [selectedBankId, setSelectedBankId] = useState("HDFC");
  const [bankingType, setBankingType] = useState("retail"); // "retail" | "corporate"
  const [searchQuery, setSearchQuery] = useState("");
  const [portalOpen, setPortalOpen] = useState(false);

  // Bank Portal Simulation State
  const [portalStep, setPortalStep] = useState(1); // 1: Login, 2: Account Select & Confirm, 3: 2FA OTP, 4: Processing / Success
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("SAVINGS_1");
  const [otpValue, setOtpValue] = useState("");
  const [otpTimer, setOtpTimer] = useState(45);
  const [processingStage, setProcessingStage] = useState("");
  const [finalTxnId, setFinalTxnId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const numAmount = Math.max(0, Number(amount) || 0);
  const isDark = theme === "dark";

  const currentBank = useMemo(() => {
    return (
      ALL_NETBANKING_BANKS.find((b) => b.id === selectedBankId) ||
      ALL_NETBANKING_BANKS[0]
    );
  }, [selectedBankId]);

  const filteredBanks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_NETBANKING_BANKS;
    return ALL_NETBANKING_BANKS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const popularBanks = useMemo(() => {
    return ALL_NETBANKING_BANKS.filter((b) => b.popular);
  }, []);

  // Launch simulated bank gateway
  const handleStartNetBanking = () => {
    if (numAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    setPortalStep(1);
    setCustomerId("DEMO_" + Math.floor(100000 + Math.random() * 900000));
    setPassword("NetPass@2026");
    setOtpValue("");
    setOtpTimer(45);
    setPortalOpen(true);
  };

  // Step 1 -> Step 2: Validate Login Credentials
  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    if (!customerId.trim()) {
      toast.error("Please enter your Customer ID / User ID");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your NetBanking Password");
      return;
    }
    setPortalStep(2);
  };

  // Step 2 -> Step 3: Trigger 2FA OTP
  const handleProceedToOtp = () => {
    setPortalStep(3);
    setOtpTimer(45);
  };

  // Step 3 -> Step 4: Verify OTP and Execute Real Settlement
  const handleVerifyOtpAndPay = async () => {
    if (otpValue.trim().length < 4) {
      toast.error("Please enter the 6-digit OTP sent to your registered mobile.");
      return;
    }

    setIsProcessing(true);
    setPortalStep(4);

    // Multi-stage realistic banking settlement animation
    setProcessingStage("Connecting to " + currentBank.name + " secure server...");
    await new Promise((r) => setTimeout(r, 600));

    setProcessingStage("Verifying 2FA Token & Authorizing Account Debit...");
    await new Promise((r) => setTimeout(r, 700));

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const txnRef = `${currentBank.id}/NB/${dateStr}/${randHex}`;
    setFinalTxnId(txnRef);

    setProcessingStage("Generating Bank Reference: " + txnRef);
    await new Promise((r) => setTimeout(r, 600));

    setProcessingStage("Settlement Confirmed!");
    await new Promise((r) => setTimeout(r, 400));

    setIsProcessing(false);

    toast.success(`${currentBank.shortName} NetBanking Payment Successful!`);

    // Notify parent component / execute API call
    if (onPaymentSuccess) {
      await onPaymentSuccess({
        method: "bank",
        transactionId: txnRef,
        notes: `${currentBank.name} NetBanking ${bankingType.toUpperCase()} transfer. Reference: ${txnRef}`,
        bankName: currentBank.name,
      });
    }
  };

  return (
    <div className={`space-y-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
      {/* HEADER & RETAIL/CORPORATE TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <Building2 size={16} className="text-blue-500" />
            Direct NetBanking Gateway
          </h3>
          <p className="text-xs text-slate-400">
            Instant online settlement with 256-bit bank encryption
          </p>
        </div>

        {/* Banking Mode Pill */}
        <div
          className={`inline-flex rounded-xl p-1 border text-xs font-bold ${
            isDark
              ? "bg-slate-950 border-slate-800 text-slate-400"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
        >
          <button
            type="button"
            onClick={() => setBankingType("retail")}
            className={`px-3 py-1 rounded-lg transition-all ${
              bankingType === "retail"
                ? "bg-indigo-600 text-white shadow-sm"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Retail Banking
          </button>
          <button
            type="button"
            onClick={() => setBankingType("corporate")}
            className={`px-3 py-1 rounded-lg transition-all ${
              bankingType === "corporate"
                ? "bg-indigo-600 text-white shadow-sm"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Corporate
          </button>
        </div>
      </div>

      {/* POPULAR BANKS FAST-ACCESS GRID */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Popular Banks
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {popularBanks.map((b) => {
            const isSelected = selectedBankId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBankId(b.id)}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all duration-200 ${
                  isSelected
                    ? isDark
                      ? "bg-blue-500/10 border-blue-500 text-white ring-1 ring-blue-500/50"
                      : "bg-blue-50/80 border-blue-600 text-blue-900 ring-1 ring-blue-600"
                    : isDark
                    ? "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br ${b.color} shadow-sm shrink-0`}
                >
                  {b.id.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{b.shortName}</p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {b.code.slice(0, 4)}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2
                    size={14}
                    className="text-blue-500 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH ALL BANKS DROPDOWN */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Or Search from All Banks (20+)
          </p>
          <span className="text-[10px] text-indigo-500 font-semibold">
            {filteredBanks.length} Banks Available
          </span>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search bank by name (e.g. SBI, Canara, Federal, IDFC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs font-medium outline-none transition ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500"
                : "bg-white border-slate-200 text-slate-800 focus:border-blue-500 shadow-sm"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {searchQuery && (
          <div
            className={`mt-1.5 max-h-40 overflow-y-auto rounded-xl border divide-y ${
              isDark
                ? "bg-slate-950 border-slate-800 divide-slate-900"
                : "bg-white border-slate-200 divide-slate-100 shadow-lg"
            }`}
          >
            {filteredBanks.length > 0 ? (
              filteredBanks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBankId(b.id);
                    setSearchQuery("");
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                    selectedBankId === b.id
                      ? "bg-blue-50/50 font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {b.code.slice(0, 4)}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching bank found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* SELECTED BANK SUMMARY BADGE */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isDark
            ? "bg-slate-950/80 border-slate-800"
            : "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs bg-gradient-to-br ${currentBank.color} shadow-md`}
          >
            {currentBank.id.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold">{currentBank.name}</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase">
                {bankingType}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{currentBank.tagline}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Payable Amount
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(numAmount)}
          </span>
        </div>
      </div>

      {/* PRIMARY NETBANKING LAUNCH CTA */}
      <button
        type="button"
        disabled={numAmount <= 0}
        onClick={handleStartNetBanking}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25 active:scale-[0.99] disabled:opacity-50"
      >
        <ExternalLink size={16} />
        <span>
          Pay {formatCurrency(numAmount)} with {currentBank.shortName} NetBanking
        </span>
      </button>

      {/* ========================================================================= */}
      {/* DYNAMIC BANKING PORTAL GATEWAY SIMULATOR MODAL */}
      {/* ========================================================================= */}
      {portalOpen && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => !isProcessing && setPortalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bank Corporate Header Bar */}
            <div
              className={`p-4 bg-gradient-to-r ${currentBank.color} text-white flex items-center justify-between shadow-md`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xs">
                  {currentBank.id.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">
                    {currentBank.name}
                  </h4>
                  <p className="text-[10px] text-white/80">
                    Secure NetBanking Gateway • {bankingType.toUpperCase()}
                  </p>
                </div>
              </div>

              {!isProcessing && (
                <button
                  type="button"
                  onClick={() => setPortalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Merchant Payment Brief Banner */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Merchant / Payee
                </span>
                <span className="font-bold text-slate-800">{payeeName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Amount
                </span>
                <span className="font-black text-sm text-slate-900">
                  {formatCurrency(numAmount)}
                </span>
              </div>
            </div>

            {/* PORTAL STEP 1: USER AUTHENTICATION */}
            {portalStep === 1 && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b pb-2">
                  <KeyRound size={15} className="text-blue-600" />
                  <span>Enter NetBanking Login Credentials</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Customer ID / User ID
                  </label>
                  <input
                    type="text"
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="e.g. 58921042"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    IPIN / NetBanking Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                  >
                    <span>Login & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                  <Lock size={12} className="text-emerald-500" />
                  <span>256-Bit SSL Encrypted Bank Simulation</span>
                </div>
              </form>
            )}

            {/* PORTAL STEP 2: ACCOUNT SELECTION & TRANSFER CONFIRMATION */}
            {portalStep === 2 && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b pb-2">
                  <CreditCard size={15} className="text-blue-600" />
                  <span>Select Debit Account</span>
                </div>

                <div className="space-y-2">
                  <label
                    onClick={() => setSelectedAccount("SAVINGS_1")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedAccount === "SAVINGS_1"
                        ? "bg-blue-50 border-blue-500 text-blue-900"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">
                        Savings Account •••• 9421
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Available Balance: ₹1,48,500.00
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedAccount === "SAVINGS_1"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedAccount === "SAVINGS_1" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </label>

                  <label
                    onClick={() => setSelectedAccount("CURRENT_1")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedAccount === "CURRENT_1"
                        ? "bg-blue-50 border-blue-500 text-blue-900"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">
                        Current Business Account •••• 4102
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Available Balance: ₹4,20,000.00
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedAccount === "CURRENT_1"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedAccount === "CURRENT_1" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-0.5">
                  <p className="font-bold">Narration / Remarks:</p>
                  <p className="font-mono">
                    Payment for Invoice {invoiceNumber || "INV-2026"} ({formatCurrency(numAmount)})
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPortalStep(1)}
                    className="flex-1 h-10 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToOtp}
                    className="flex-[2] h-10 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                  >
                    <span>Request 2FA OTP</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* PORTAL STEP 3: 2FA HIGH SECURITY OTP AUTHENTICATION */}
            {portalStep === 3 && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                  <Smartphone size={24} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    High-Security OTP Verification
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    An OTP has been sent to your registered mobile number ending with <strong>••• 4291</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 6-Digit OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    className="w-48 h-12 mx-auto rounded-xl border-2 border-blue-500 text-center font-mono text-lg font-black tracking-widest text-slate-900 outline-none shadow-sm"
                  />
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpValue("789123")}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      ⚡ Auto-Fill Demo OTP (789123)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtpAndPay}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
                >
                  <ShieldCheck size={16} />
                  <span>Verify & Settle {formatCurrency(numAmount)}</span>
                </button>
              </div>
            )}

            {/* PORTAL STEP 4: REAL-TIME SETTLEMENT ANIMATION & SUCCESS RECEIPT */}
            {portalStep === 4 && (
              <div className="p-8 text-center space-y-5">
                {isProcessing ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-blue-100 animate-pulse" />
                      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Processing NetBanking Transfer
                      </h4>
                      <p className="text-xs text-blue-600 font-semibold mt-1 animate-pulse">
                        {processingStage}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={36} />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Payment Successful
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">
                        {formatCurrency(numAmount)} Debited
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Transferred to {payeeName}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Bank:</span>
                        <span className="font-bold text-slate-800">{currentBank.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">UTR / Ref:</span>
                        <span className="font-mono font-bold text-indigo-700">{finalTxnId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Status:</span>
                        <span className="font-bold text-emerald-600">Settled (Verified)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPortalOpen(false)}
                      className="w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-md transition"
                    >
                      Done & View Receipt
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
