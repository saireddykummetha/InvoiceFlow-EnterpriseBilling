import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!uid || !token) {
      toast.error("Invalid or expired password reset link.");
      return;
    }

    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/reset-password/",
        {
          uid,
          token,
          password,
          password_confirm: confirmPassword,
        }
      );

      console.log("RESET PASSWORD:", response.data);

      if (response.data?.success) {
        setSuccess(true);

        toast.success(
          response.data?.message ||
          "Password reset successfully."
        );

        return;
      }

      toast.error(
        response.data?.message ||
        "Password reset failed."
      );
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);

      if (error.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "DATA:",
          error.response.data
        );

        const data = error.response.data;

        if (data?.password) {
          toast.error(
            Array.isArray(data.password)
              ? data.password[0]
              : data.password
          );
          return;
        }

        if (data?.password_confirm) {
          toast.error(
            Array.isArray(data.password_confirm)
              ? data.password_confirm[0]
              : data.password_confirm
          );
          return;
        }

        toast.error(
          data?.message ||
          data?.detail ||
          "Invalid or expired reset link."
        );
      } else if (error.request) {
        toast.error(
          "Cannot connect to Django backend."
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS PAGE
  // ============================================================

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="grid min-h-screen lg:grid-cols-2">

          {/* LEFT */}
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />

            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg">
                  <KeyRound size={21} />
                </div>

                <div>
                  <p className="text-lg font-bold text-white">
                    InvoiceFlow
                  </p>

                  <p className="text-xs text-slate-400">
                    Business Management
                  </p>
                </div>
              </div>

              <div className="max-w-lg">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">
                  <ShieldCheck size={14} />
                  Account secured
                </div>

                <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
                  Your password has been updated.
                </h1>

                <p className="mt-5 text-base leading-7 text-slate-400">
                  Your InvoiceFlow account is now protected
                  with your new password.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} InvoiceFlow.
                All rights reserved.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
            <div className="w-full max-w-md text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-sm">
                <CheckCircle2 size={40} />
              </div>

              <h2 className="mt-7 text-3xl font-black tracking-tight text-slate-900">
                Password reset successful
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Your password has been changed successfully.
                You can now sign in using your new password.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
              >
                <ArrowLeft size={17} />
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // INVALID LINK
  // ============================================================

  if (!uid || !token) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="grid min-h-screen lg:grid-cols-2">

          {/* LEFT */}
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900">
                  <KeyRound size={21} />
                </div>

                <div>
                  <p className="text-lg font-bold text-white">
                    InvoiceFlow
                  </p>

                  <p className="text-xs text-slate-400">
                    Business Management
                  </p>
                </div>
              </div>

              <div className="max-w-lg">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-300">
                  <ShieldCheck size={14} />
                  Password recovery
                </div>

                <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
                  Invalid reset link
                </h1>

                <p className="mt-5 text-base leading-7 text-slate-400">
                  This password reset link is missing required
                  information or is no longer valid.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} InvoiceFlow.
                All rights reserved.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
            <div className="w-full max-w-md text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                <KeyRound size={36} />
              </div>

              <h2 className="mt-7 text-3xl font-black text-slate-900">
                Invalid or expired link
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Please request a new password reset link
                from the forgot password page.
              </p>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <ArrowLeft size={17} />
                Request New Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT PANEL
        ===================================================== */}

        <div className="relative hidden overflow-hidden lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />

          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg">
                <KeyRound size={21} />
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  InvoiceFlow
                </p>

                <p className="text-xs text-slate-400">
                  Business Management
                </p>
              </div>

            </div>

            {/* CONTENT */}

            <div className="max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
                <ShieldCheck size={14} />
                Secure password recovery
              </div>

              <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
                Create a new password.
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-400">
                Choose a strong password to protect your
                InvoiceFlow account.
              </p>

              <div className="mt-10 flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                  <LockKeyhole size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Keep your account secure
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use at least 8 characters with a
                    combination of letters, numbers and symbols.
                  </p>
                </div>

              </div>

            </div>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} InvoiceFlow.
              All rights reserved.
            </p>

          </div>
        </div>

        {/* =====================================================
            RIGHT PANEL
        ===================================================== */}

        <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">

          <div className="w-full max-w-md">

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to login
            </button>

            <div className="mb-8">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                <KeyRound size={24} />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Reset your password
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your new password below. Make sure
                it is at least 8 characters long.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {password && (
                  <div className="mt-3">

                    <div className="flex gap-1">

                      {[1, 2, 3, 4].map(
                        (level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${getPasswordStrength(
                              password
                            ).level >= level
                                ? getPasswordStrength(
                                  password
                                ).bar
                                : "bg-slate-200"
                              }`}
                          />
                        )
                      )}

                    </div>

                    <p
                      className={`mt-1 text-xs font-semibold ${getPasswordStrength(
                        password
                      ).text
                        }`}
                    >
                      {
                        getPasswordStrength(
                          password
                        ).label
                      }
                    </p>

                  </div>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white py-3.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:ring-4 ${confirmPassword &&
                        confirmPassword !== password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
                      } disabled:cursor-not-allowed disabled:bg-slate-100`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {confirmPassword &&
                  confirmPassword !== password && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      Passwords do not match.
                    </p>
                  )}

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    <KeyRound size={17} />
                    Reset Password
                  </>
                )}

              </button>

            </form>

            <p className="mt-8 text-center text-sm text-slate-500">

              Remember your password?{" "}

              <Link
                to="/login"
                className="font-bold text-slate-900 hover:underline"
              >
                Sign in
              </Link>

            </p>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} />
              Secure password recovery
            </div>

          </div>
        </div>

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
      bar: "bg-slate-200",
      text: "text-slate-400",
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      level: 1,
      label: "Weak password",
      bar: "bg-red-500",
      text: "text-red-600",
    };
  }

  if (score === 3) {
    return {
      level: 2,
      label: "Fair password",
      bar: "bg-amber-500",
      text: "text-amber-600",
    };
  }

  if (score === 4) {
    return {
      level: 3,
      label: "Good password",
      bar: "bg-blue-500",
      text: "text-blue-600",
    };
  }

  return {
    level: 4,
    label: "Strong password",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  };
}