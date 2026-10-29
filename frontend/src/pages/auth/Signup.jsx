import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  // Lock,
  Mail,
  Moon,
  Package,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sun,
  User,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { requestSignupOtp, verifySignupOtp, resendSignupOtp } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/authService";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";


export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  // Workflow Step: "form" or "verify_otp"
  const [step, setStep] = useState("form");

  // Role: "client", "vendor", "admin", "super_admin"
  const [role, setRole] = useState("client");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [debugOtp, setDebugOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const isAdmin = role === "admin";

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Password strength calculation
  const passwordStrength = getPasswordStrength(form.password);

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval;
    if (step === "verify_otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP box on entering verify_otp step
  useEffect(() => {
    if (step === "verify_otp") {
      setTimer(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    // If pasted multiple digits
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ============================================================
  // STEP 1: REQUEST OTP (VALIDATE DETAILS & SEND CODE)
  // ============================================================

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    const name = String(form?.name || "").trim();
    const email = String(form?.email || "").trim().toLowerCase();
    const password = String(form?.password || "");
    const confirmPassword = String(form?.confirmPassword || "");
    const companyName = String(form?.companyName || "").trim();

    if (!name) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!agree) {
      toast.error("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await requestSignupOtp({
        username: name,
        email: email,
        password: password,
        password_confirm: confirmPassword,
        role: role || "client",
        company_name: companyName || undefined,
      });

      if (response.success) {
        const receivedOtp = response.otp || response.data?.otp;
        if (receivedOtp) {
          setDebugOtp(String(receivedOtp));
          setOtpDigits(String(receivedOtp).split(""));
          toast.success(`Verification Code: ${receivedOtp}`, { duration: 15000, icon: "🔑" });
        } else {
          toast.success(`Verification code sent to ${form.email}! Please check your email inbox.`);
        }
        setStep("verify_otp");
        setTimer(60);
      } else {
        toast.error(response.message || "Failed to send verification code.");
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      const data = error?.response?.data;
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(data?.message || data?.detail || "Could not validate registration details.");
      }
    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // STEP 2: VERIFY OTP & COMPLETE ACCOUNT CREATION
  // ============================================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const code = otpDigits.join("").trim();
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const email = String(form?.email || "").trim().toLowerCase();
      const response = await verifySignupOtp(email, code);

      if (!response.success && !response.access) {
        toast.error(response.message || "Invalid verification code.");
        return;
      }

      const user = response.user || response.data?.user;

      if (user) {
        login(user);
      }

      toast.success("Email verified! Account created successfully.");

      const targetPath = authService.getDashboardPath(user);
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error("Verify OTP error:", error);
      const data = error?.response?.data;
      toast.error(data?.message || data?.detail || "Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    try {
      setResending(true);
      const email = String(form?.email || "").trim().toLowerCase();
      const response = await resendSignupOtp(email);

      if (response.success) {
        const receivedOtp = response.otp || response.data?.otp;
        if (receivedOtp) {
          setDebugOtp(String(receivedOtp));
          setOtpDigits(String(receivedOtp).split(""));
          toast.success(`New Code: ${receivedOtp}`, { duration: 15000, icon: "🔑" });
        } else {
          toast.success(`A new verification code has been sent to ${form.email}!`);
        }
        setTimer(60);
      } else {
        toast.error(response.message || "Could not resend verification code.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };


  // ============================================================
  // UI
  // ============================================================


  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbfbfb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white transition-colors duration-300">

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          <span>← Back to Home</span>
        </Link>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          title="Toggle theme"
        >
          {darkMode ? (
            <Sun size={15} />
          ) : (
            <Moon size={15} />
          )}
        </button>
      </div>

      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">

        <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">

            {/* ==================================================
                LEFT COLUMN
            ================================================== */}

            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">

              <div>

                {/* Logo / Icon */}

                <motion.div
                  initial={{
                    rotate: -45,
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    rotate: 0,
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="mb-8"
                >
                  <svg
                    className="w-12 h-12 text-slate-900 dark:text-white"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <path d="M50 0 L58 35 L93 20 L68 50 L93 80 L58 65 L50 100 L42 65 L7 80 L32 50 L7 20 L42 35 Z" />
                  </svg>
                </motion.div>

                {/* Heading */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1,
                  }}
                  className="space-y-3"
                >
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1]">
                    Create
                    <br />
                    your account!{" "}
                    <span className="inline-block">
                      👋
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-md pt-2">
                    Start managing your invoices,
                    payments, clients, and business
                    operations with InvoiceFlow.
                  </p>
                </motion.div>

                {/* Feature List */}

                <div className="mt-10 space-y-4">

                  <SignupFeature
                    icon={<Check size={14} />}
                    title="Fast & Simple"
                    text="Create your account in less than a minute."
                  />

                  <SignupFeature
                    icon={<ShieldCheck size={14} />}
                    title="Secure"
                    text="Your account and business data stay protected."
                  />

                  <SignupFeature
                    icon={<Users size={14} />}
                    title="Built for Business"
                    text="Manage clients, invoices and payments easily."
                  />

                </div>

              </div>

              {/* Bottom note */}

              <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">

                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-[10px]">
                  ✓
                </div>

                <span>
                  GST Compliant • Instant UPI Settlement • 99.9% Uptime
                </span>

              </div>

            </div>

            {/* ==================================================
                RIGHT COLUMN
            ================================================== */}

            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-10 flex flex-col justify-between bg-white dark:bg-slate-900/60">

              <div>

                {/* Header & Role Switcher */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-base font-black tracking-tight text-slate-950 dark:text-white">
                    InvoiceFlow
                  </span>

                  {/* Role Switcher */}
                  {step === "form" && (
                    <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                      {/* Client */}
                      <button
                        type="button"
                        onClick={() => setRole("client")}
                        disabled={loading}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          role === "client"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <User size={12} />
                        <span>Client</span>
                      </button>

                      {/* Vendor */}
                      <button
                        type="button"
                        onClick={() => setRole("vendor")}
                        disabled={loading}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          role === "vendor"
                            ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <Package size={12} />
                        <span>Vendor</span>
                      </button>

                      {/* Admin */}
                      <button
                        type="button"
                        onClick={() => setRole("admin")}
                        disabled={loading}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          role === "admin"
                            ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <Building2 size={12} />
                        <span>Admin</span>
                      </button>

                      {/* Super Admin */}
                      <button
                        type="button"
                        onClick={() => setRole("super_admin")}
                        disabled={loading}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          role === "super_admin"
                            ? "bg-white text-purple-700 shadow-sm dark:bg-slate-700 dark:text-purple-400"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <Shield size={12} />
                        <span>Super Admin</span>
                      </button>
                    </div>
                  )}
                </div>

                {step === "form" ? (
                  <>
                    {/* Title */}
                    <div className="space-y-1 mb-6">
                      <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                        Create your account
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition"
                        >
                          Sign in here.
                        </Link>
                      </p>
                    </div>

                    {/* ==================================================
                        SIGNUP FORM (STEP 1)
                    ================================================== */}
                    <form
                      onSubmit={handleSignupSubmit}
                      className="space-y-4"
                    >
                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="signup-name"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="signup-name"
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="e.g. John Doe"
                            autoComplete="name"
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 transition disabled:opacity-50"
                          />
                          <User size={16} className="absolute right-3 top-2.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="signup-email"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="signup-email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="e.g. yourname@company.com"
                            autoComplete="email"
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 transition disabled:opacity-50"
                          />
                          <Mail size={16} className="absolute right-3 top-2.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label
                          htmlFor="signup-password"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={form.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            placeholder="Create a password (min 8 chars)"
                            autoComplete="new-password"
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 transition disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Password strength */}
                        {form.password && (
                          <div className="mt-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-all ${passwordStrength.level >= level
                                      ? passwordStrength.bar
                                      : "bg-slate-200 dark:bg-slate-800"
                                    }`}
                                />
                              ))}
                            </div>
                            <p className={`mt-1 text-[10px] font-semibold ${passwordStrength.text}`}>
                              {passwordStrength.label}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="signup-confirm"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="signup-confirm"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={form.confirmPassword}
                            onChange={(e) => updateField("confirmPassword", e.target.value)}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            disabled={loading}
                            className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50 ${form.confirmPassword && form.confirmPassword !== form.password
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60"
                                : "border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {form.confirmPassword && form.confirmPassword !== form.password && (
                          <p className="mt-1 text-[10px] font-semibold text-red-500">
                            Passwords do not match
                          </p>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-2 pt-1">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          disabled={loading}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                        />
                        <label
                          htmlFor="terms"
                          className="text-xs leading-5 text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                        >
                          I agree to the{" "}
                          <span className="font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400">
                            Terms of Service
                          </span>{" "}
                          and{" "}
                          <span className="font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400">
                            Privacy Policy
                          </span>
                        </label>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white dark:border-slate-300 dark:border-t-slate-900 animate-spin" />
                            <span>Validating & Sending Code...</span>
                          </span>
                        ) : (
                          <>
                            <span>
                              Create {isAdmin ? "Admin" : "Client"} Account
                            </span>
                            <ArrowRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>

                      {/* Google */}
                      <GoogleAuthButton
                        role={role}
                        mode="signup"
                        text="Sign up with Google"
                        disabled={loading}
                      />
                    </form>
                  </>
                ) : (
                  /* ==================================================
                      OTP VERIFICATION SCREEN (STEP 2)
                  ================================================== */
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to change details</span>
                    </button>

                    <div className="space-y-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 shadow-inner">
                        <KeyRound size={24} />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                        Verify your email address
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        We have dispatched a 6-digit verification code to{" "}
                        <span className="font-bold text-slate-900 dark:text-white">{form.email}</span>.
                        Please enter the code to confirm your identity and create your account.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                          6-Digit Verification Code
                        </label>
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputsRef.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              disabled={loading}
                              className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-slate-200 bg-slate-50/70 text-center font-mono text-xl font-black text-slate-900 shadow-sm focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 transition disabled:opacity-50"
                              autoComplete="one-time-code"
                            />
                          ))}
                        </div>

                        {debugOtp && (
                          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/90 p-2.5 text-xs text-blue-900 dark:border-blue-900/80 dark:bg-blue-950/60 dark:text-blue-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span>🔑 Testing Code:</span>
                              <code className="font-mono font-black text-sm bg-white/90 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 tracking-widest text-blue-600 dark:text-blue-400">
                                {debugOtp}
                              </code>
                            </span>
                            <button
                              type="button"
                              onClick={() => setOtpDigits(debugOtp.split(""))}
                              className="text-[11px] font-bold text-blue-700 dark:text-blue-300 underline hover:text-blue-900 cursor-pointer"
                            >
                              Auto-fill
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Resend Section */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 dark:text-slate-400">
                          Didn't get the code?
                        </span>
                        {timer > 0 ? (
                          <span className="flex items-center gap-1 font-semibold text-slate-400">
                            <Clock size={13} />
                            <span>Resend in {timer}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending || loading}
                            className="flex items-center gap-1 font-bold text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50 cursor-pointer"
                          >
                            {resending ? <RefreshCw size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>

                      {/* Confirm Button */}
                      <button
                        type="submit"
                        disabled={loading || otpDigits.join("").length < 6}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            <span>Verifying & Creating Account...</span>
                          </span>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Verify Code & Finish</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}


                {/* Account type information */}

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">

                  <div className="flex items-center gap-2 mb-2">

                    {isAdmin ? (
                      <Building2
                        size={15}
                        className="text-blue-500"
                      />
                    ) : (
                      <User
                        size={15}
                        className="text-emerald-500"
                      />
                    )}

                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {isAdmin
                        ? "Admin Account"
                        : "Client Account"}
                    </p>

                  </div>

                  <div className="grid grid-cols-1 gap-1">

                    {(isAdmin
                      ? [
                        "Manage clients, quotes & invoices",
                        "Track payments & receipts",
                        "Business profile & settings",
                        "Reports & analytics",
                      ]
                      : [
                        "View invoices & quotes",
                        "Make payments online",
                        "Download PDF invoices",
                        "View payment history",
                      ]
                    ).map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2
                          size={12}
                          className={
                            isAdmin
                              ? "text-blue-500"
                              : "text-emerald-500"
                          }
                        />

                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {feature}
                        </span>
                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
      </footer>

    </div>
  );
}

// ============================================================
// FEATURE COMPONENT
// ============================================================

function SignupFeature({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {text}
        </p>
      </div>

    </div>
  );
}

// ============================================================
// PASSWORD STRENGTH
// ============================================================

function getPasswordStrength(password) {
  if (!password) {
    return {
      level: 0,
      label: "",
      bar: "",
      text: "",
    };
  }

  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  const map = [
    {
      level: 1,
      label: "Weak",
      bar: "bg-red-500",
      text: "text-red-500",
    },
    {
      level: 2,
      label: "Fair",
      bar: "bg-amber-500",
      text: "text-amber-500",
    },
    {
      level: 3,
      label: "Good",
      bar: "bg-blue-500",
      text: "text-blue-500",
    },
    {
      level: 4,
      label: "Strong",
      bar: "bg-emerald-500",
      text: "text-emerald-500",
    },
  ];

  return map[score - 1] || map[0];
}