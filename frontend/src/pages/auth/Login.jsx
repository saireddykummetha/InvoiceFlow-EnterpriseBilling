import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
import {
  // ArrowRight,
  Building2,
  // Check,
  Eye,
  EyeOff,
  // Lock,
  // Mail,
  Moon,
  Package,
  Shield,
  // ShieldCheck,
  Sparkles,
  Sun,
  // User,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/authService";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";

const DEMO_ACCOUNTS = {
  super_admin: {
    email: "sai.superadmin@gmail.com",
    password: "SuperAdmin@123",
    roleName: "Super Admin",
    icon: Shield,
    color: "bg-purple-600 hover:bg-purple-700 text-white",
    path: "/superadmin/dashboard",
  },
  admin: {
    email: "sai.admin@gmail.com",
    password: "Admin@123",
    roleName: "Admin (Company)",
    icon: Building2,
    color: "bg-indigo-600 hover:bg-indigo-700 text-white",
    path: "/admin/dashboard",
  },
  vendor: {
    email: "sai.vendor@gmail.com",
    password: "Vendor@123",
    roleName: "Vendor (Supplier)",
    icon: Package,
    color: "bg-blue-600 hover:bg-blue-700 text-white",
    path: "/vendor/dashboard",
  },
  client: {
    email: "sai.client@gmail.com",
    password: "Client@123",
    roleName: "Client (Customer)",
    icon: Users,
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    path: "/client/dashboard",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  // 4 Roles: "super_admin", "admin", "vendor", "client"
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const executeLogin = async (loginEmail, loginPassword, loginRole) => {
    try {
      setLoading(true);

      const response = await api.post("/auth/login/", {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        role: loginRole,
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Login failed.");
        return;
      }

      const accessToken =
        response.data?.data?.tokens?.access ||
        response.data?.access ||
        response.data?.data?.access;

      const refreshToken =
        response.data?.data?.tokens?.refresh ||
        response.data?.refresh ||
        response.data?.data?.refresh;

      const user =
        response.data?.data?.user ||
        response.data?.user;

      if (!accessToken || !refreshToken || !user) {
        toast.error("Invalid response from server. Please try again.");
        return;
      }

      // Persist auth
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("remember_me", remember ? "true" : "false");

      login(user);

      toast.success(response.data?.message || `Welcome back, ${user.name || "User"}!`);

      const targetPath = authService.getDashboardPath(user);
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const data = error.response.data;
        if (error.response.status === 403) {
          toast.error(data?.message || "You do not have permission to login with this role.");
          return;
        }
        if (error.response.status === 401) {
          toast.error(data?.message || data?.detail || "Invalid email or password. If you don't have an account yet, please sign up first.");
          return;
        }
        toast.error(data?.message || data?.detail || "Invalid email or password.");
        return;
      }

      if (error.request) {
        toast.error("Cannot connect to server. Please check your network connection.");
        return;
      }

      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    executeLogin(email, password, role);
  };

  const handleDemoLogin = (demoKey) => {
    const demo = DEMO_ACCOUNTS[demoKey];
    if (!demo) return;
    setRole(demoKey);
    setEmail(demo.email);
    setPassword(demo.password);
    toast.success(`Loaded credentials for ${demo.roleName}`);
    executeLogin(demo.email, demo.password, demoKey);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbfbfb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white transition-colors duration-300">
      {/* Top Bar */}
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
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* ======================================================
                LEFT COLUMN: GREETING & 4 ROLE DEMO QUICK ACCESS
            ====================================================== */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                {/* Brand Logo & Heading */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6342ff] text-white font-bold shadow-md shadow-indigo-600/30">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                    InvoiceFlow
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    Sign in to your Portal
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose one of the 4 dedicated roles below to log in or click any demo profile for instant access:
                  </p>
                </div>

                {/* 4 DEMO LOGIN QUICK ACCESS BUTTONS */}
                <div className="mt-6 space-y-2.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    ⚡ 1-Click Demo Accounts
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(DEMO_ACCOUNTS).map(([key, demo]) => {
                      const Icon = demo.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={loading}
                          onClick={() => handleDemoLogin(key)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-indigo-400 hover:shadow-xs transition text-left group ${
                            role === key ? "ring-2 ring-indigo-500/30 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              key === "super_admin" ? "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400" :
                              key === "admin" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400" :
                              key === "vendor" ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" :
                              "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                            }`}>
                              <Icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                {demo.roleName}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate font-mono">
                                {demo.email}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                            Login →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span>🔐 Enterprise Role-Based Access Control (RBAC)</span>
              </div>
            </div>

            {/* ======================================================
                RIGHT COLUMN: 4-ROLE SELECTOR & LOGIN FORM
            ====================================================== */}
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white dark:bg-slate-900">
              <div>
                {/* 4 Dedicated Role Switcher Tabs */}
                <div className="mb-6">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Your Role:
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setRole("super_admin");
                        setEmail("sai.superadmin@gmail.com");
                        setPassword("SuperAdmin@123");
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition ${
                        role === "super_admin"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Shield size={13} />
                      <span>Super Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole("admin");
                        setEmail("sai.admin@gmail.com");
                        setPassword("Admin@123");
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition ${
                        role === "admin"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Building2 size={13} />
                      <span>Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole("vendor");
                        setEmail("sai.vendor@gmail.com");
                        setPassword("Vendor@123");
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition ${
                        role === "vendor"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Package size={13} />
                      <span>Vendor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole("client");
                        setEmail("sai.client@gmail.com");
                        setPassword("Client@123");
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition ${
                        role === "client"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Users size={13} />
                      <span>Client</span>
                    </button>
                  </div>
                </div>

                {/* Form Header */}
                <div className="space-y-1 mb-5">
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    {role === "super_admin"
                      ? "Super Admin Portal Login"
                      : role === "admin"
                      ? "Business Admin Workspace Login"
                      : role === "vendor"
                      ? "Supplier & Vendor Portal Login"
                      : "Client & Customer Portal Login"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your registered email and password to access your dashboard.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950 transition"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                    >
                      Remember me on this device
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>Signing In...</span>
                      </span>
                    ) : (
                      <span>Login to {DEMO_ACCOUNTS[role]?.roleName || "Portal"}</span>
                    )}
                  </button>

                  {/* Google Social Login */}
                  <GoogleAuthButton
                    role={role}
                    mode="login"
                    text="Login with Google"
                    disabled={loading}
                  />

                  {/* Signup Link */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline underline-offset-2"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
      </footer>
    </div>
  );
}