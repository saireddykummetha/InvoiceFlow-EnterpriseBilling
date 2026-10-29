
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { forgotPassword, resetPassword, resendPasswordResetOtp } from "../../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Workflow step: "request" | "verify_and_reset" | "success"
  const [step, setStep] = useState("request");

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef([]);
   const [debugOtp,setDebugOtp]=useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval;
    if (step === "verify_and_reset" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP box on entering verify_and_reset step
  useEffect(() => {
    if (step === "verify_and_reset") {
      setTimer(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
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

  // Password Strength
  const passwordStrength = getPasswordStrength(password);

  // ============================================================
  // STEP 1: REQUEST OTP
  // ============================================================
  const handleRequestOtp = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());

      if (response.success) {
        const receivedOtp = response.otp || response.data?.otp;
        if (receivedOtp) {
          setDebugOtp(String(receivedOtp));
          setOtpDigits(String(receivedOtp).split(""));
          toast.success(`Reset Code: ${receivedOtp}`, { duration: 15000, icon: "🔑" });
        } else {
          toast.success(response.message || `Verification code sent to ${email}! Please check your inbox.`);
        }
        setStep("verify_and_reset");
        setTimer(60);
      } else {
        toast.error(response.message || "Could not process password reset.");
      }
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      const data = error?.response?.data;
      toast.error(data?.message || data?.detail || "No registered account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 2: VERIFY OTP & RESET PASSWORD
  // ============================================================
  const handleResetPassword = async (event) => {
    event.preventDefault();

    const code = otpDigits.join("").trim();
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!password) {
      toast.error("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email: email.trim().toLowerCase(),
        otp: code,
        password,
        password_confirm: confirmPassword,
      });

      if (response.success) {
        toast.success(response.message || "Password reset successfully!");
        setStep("success");
      } else {
        toast.error(response.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      const data = error?.response?.data;
      toast.error(data?.message || data?.detail || "Invalid or expired verification code.");
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
      const response = await resendPasswordResetOtp(email.trim());
      if (response.success) {
        toast.success(`A new verification code was sent to ${email}!`);
        setTimer(60);
        setOtpDigits(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
      } else {
        toast.error(response.message || "Failed to resend code.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRANDING PANEL */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg">
                  <KeyRound size={21} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">InvoiceFlow</p>
                  <p className="text-xs text-slate-400">Enterprise Cloud</p>
                </div>
              </div>
            </div>

            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
                <ShieldCheck size={14} />
                Two-Step Secure Account Recovery
              </div>

              <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
                Get back into your account safely.
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-400">
                Reset your password securely with a 6-digit verification code sent directly to your registered email address.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT INTERACTION PANEL */}
        <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">

            {/* Back Button */}
            {step === "request" ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft size={17} />
                Back to login
              </button>
            ) : step === "verify_and_reset" ? (
              <button
                type="button"
                onClick={() => setStep("request")}
                disabled={loading}
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft size={17} />
                Change email address
              </button>
            ) : null}

            {/* STEP 1: REQUEST OTP */}
            {step === "request" && (
              <div>
                <div className="mb-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                    <KeyRound size={24} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    Forgot password?
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    No problem. Enter your email below and we'll dispatch a 6-digit verification code to reset your password.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                  Remember your password?{" "}
                  <Link to="/login" className="font-bold text-slate-900 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
            {step === "verify_and_reset" && (
              <div>
                <div className="mb-6">
                  <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                    <Lock size={22} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Reset your password
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Enter the 6-digit verification code sent to <strong className="text-slate-900">{email}</strong> and choose your new password.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* 6 Digit OTP */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      6-Digit Code
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
                          className="h-12 w-10 sm:h-13 sm:w-11 rounded-xl border border-slate-200 bg-white text-center font-mono text-xl font-black text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50"
                          autoComplete="one-time-code"
                        />
                      ))}
                    </div>

                    {debugOtp && (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/90 p-2.5 text-xs text-blue-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span>🔑 Testing Code:</span>
                          <code className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded-lg border border-blue-200 tracking-widest text-blue-600">
                            {debugOtp}
                          </code>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpDigits(debugOtp.split(""))}
                          className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Resend Link */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500">Didn't receive code?</span>
                    {timer > 0 ? (
                      <span className="flex items-center gap-1 font-semibold text-slate-400">
                        <Clock size={12} />
                        <span>Resend in {timer}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending || loading}
                        className="flex items-center gap-1 font-bold text-blue-600 hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        {resending ? <RefreshCw size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      New Password (min 8 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password strength */}
                    {password && (
                      <div className="mt-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all ${passwordStrength.level >= level ? passwordStrength.bar : "bg-slate-200"}`}
                            />
                          ))}
                        </div>
                        <p className={`mt-0.5 text-[10px] font-semibold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        disabled={loading}
                        className={`w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:ring-2 disabled:opacity-50 ${confirmPassword && confirmPassword !== password ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-slate-900 focus:ring-slate-100"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="mt-0.5 text-[10px] font-semibold text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 6 || !password || password !== confirmPassword}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        <span>Set New Password & Login</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: SUCCESS SCREEN */}
            {step === "success" && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-black text-slate-900">
                  Password Reset Complete!
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Your account password has been updated securely. You can now sign in with your new password.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 cursor-pointer shadow-md"
                >
                  <ArrowLeft size={17} />
                  <span>Go to Login</span>
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function getPasswordStrength(password) {
  if (!password) {
    return { level: 0, label: "", bar: "", text: "" };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { level: 1, label: "Weak", bar: "bg-red-500", text: "text-red-500" },
    { level: 2, label: "Fair", bar: "bg-amber-500", text: "text-amber-500" },
    { level: 3, label: "Good", bar: "bg-blue-500", text: "text-blue-500" },
    { level: 4, label: "Strong", bar: "bg-emerald-500", text: "text-emerald-500" },
  ];
  return map[score - 1] || map[0];
}
