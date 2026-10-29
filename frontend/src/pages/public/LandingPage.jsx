import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  Moon,
  Package,
  Receipt,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Check,
  Clock,
  ExternalLink,
  Video,
  Upload,
  Star,
  Quote,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import LandingChatbot from "../../components/public/LandingChatbot";
import FreeTrialAnnouncementModal from "../../components/public/FreeTrialAnnouncementModal";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const faqContainerRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("/banner-video.mp4");
  const [videoError, setVideoError] = useState(false);
  const [videoName, setVideoName] = useState("");
  const fileInputRef = useRef(null);

  // Auto-close open FAQ when clicking outside the FAQ container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (faqContainerRef.current && !faqContainerRef.current.contains(e.target)) {
        setOpenFaq(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes("video") && !file.name.endsWith(".mp4")) {
        toast.error("Please select an MP4 video file.");
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoError(false);
      setVideoName(file.name);
      toast.success(`Banner video updated to "${file.name}"!`);
    }
  };
  const [activeTab, setActiveTab] = useState("admin");

  const isAuthenticated = Boolean(user);

  const getDashboardPath = () => {
    if (user?.is_superuser || user?.role === "super_admin") return "/super-admin/dashboard";
    if (user?.is_staff || user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "vendor") return "/vendor/dashboard";
    if (user?.role === "client") return "/client/dashboard";
    return "/admin/dashboard";
  };

  const dashboardLink = getDashboardPath();

  const handleCta = () => {
    navigate(dashboardLink);
  };

  const ROLE_SHOWCASES = {
    super_admin: {
      title: "Super Admin Platform Owner",
      badge: "PLATFORM LEVEL",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      headline: "Global Platform Control & SaaS Subscription Telemetry",
      desc: "Monitor platform growth across all tenant workspaces, manage subscription tiers, track MRR, audit security logs, and provision new businesses with automatic 5-project free trials.",
      metrics: [
        { label: "Tenant Businesses", val: "24 Active", sub: "Multi-tenant workspaces" },
        { label: "Platform MRR", val: "$4,850/mo", sub: "Platform SaaS subscriptions" },
        { label: "Free Trials", val: "18 Active / 3 Exhausted", sub: "5-project quota model" },
      ],
      link: "/super-admin/dashboard",
    },
    admin: {
      title: "Business Admin Workspace",
      badge: "TENANT OPERATIONS",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      headline: "End-to-End Projects, Vendors, Clients & Invoicing",
      desc: "Create and manage projects within your 5-project trial, invite clients and vendors, assign tasks, review vendor work, trigger client approvals, and collect payments seamlessly.",
      metrics: [
        { label: "Active Projects", val: "4 / 5 Used", sub: "Free trial meter" },
        { label: "Client Invoices", val: "$18,400", sub: "Business project revenue" },
        { label: "Deliverables", val: "6 Pending Review", sub: "Internal quality check" },
      ],
      link: "/admin/dashboard",
    },
    vendor: {
      title: "Vendor Service Provider Portal",
      badge: "EXTERNAL WORKFLOW",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      headline: "Task Execution & Deliverable Versioning (v1.0 → v1.1)",
      desc: "Receive task assignments, submit deliverables with built-in versioning, receive review feedback from admins, and track project milestone approvals.",
      metrics: [
        { label: "Assigned Tasks", val: "12 Tasks", sub: "Across 3 client projects" },
        { label: "Submissions", val: "v1.1 Approved", sub: "Revision tracking" },
        { label: "Payouts Due", val: "$3,200", sub: "Vendor milestone settlements" },
      ],
      link: "/vendor/dashboard",
    },
    client: {
      title: "Client Self-Service Portal",
      badge: "CUSTOMER ACCEPTANCE",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      headline: "24/7 Deliverable Approvals, Progress & Instant Payments",
      desc: "Review completed deliverables submitted by admins, request revisions or approve milestones, download GST-compliant tax invoices, and pay online with instant receipts.",
      metrics: [
        { label: "My Projects", val: "2 Active", sub: "Live milestone progress" },
        { label: "Approvals", val: "1 Pending", sub: "Deliverable sign-off" },
        { label: "Paid Receipts", val: "100% Settled", sub: "Instant payment gateway" },
      ],
      link: "/client/dashboard",
    },
  };

  const FAQS = [
    {
      q: "How does the 5-Project Free Trial work for new businesses?",
      a: "Every newly registered business automatically receives a free workspace allowance of 5 complete projects with full features—including client portals, vendor revision workflows, and automated invoicing. Zero credit card required.",
    },
    {
      q: "How does the Two-Stage Deliverable approval workflow operate?",
      a: "Contractors submit deliverables with automatic versioning (v1.0 → v1.1). Business Admins review the submission internally first. Once approved, it is forwarded to the Client for final sign-off, which marks the milestone as 100% complete and unlocks invoicing.",
    },
    {
      q: "How does GST invoicing and payment settlement work?",
      a: "Invoices are generated automatically as project milestones reach completion. They include full GST tax breakdowns, business GSTIN details, and direct Razorpay checkout links. Clients can pay online and download instant GST tax receipts.",
    },
    {
      q: "How is multi-tenant data isolation and security guaranteed?",
      a: "Data isolation is enforced at the database and API query layer with tenant context tokens and row-level authorization. Tenants operate in 100% strict isolation and cannot view or access another business's projects, invoices, or files.",
    },
    {
      q: "How are platform SaaS subscriptions separated from client project invoices?",
      a: "The platform maintains strict dual-stream separation: SaaS subscription upgrade fees paid by business admins flow to the platform merchant treasury. In contrast, client payments for project deliverables flow directly to the individual business/tenant account.",
    },
    {
      q: "Can I manage team users, vendors, and clients in one workspace?",
      a: "Yes! Business Admins can invite team members with role-based permissions, assign external vendor contractors to specific tasks, and grant clients secure self-service portal access for milestone review and bill settlement.",
    },
  ];

  const TICKER_DATA = [
    {
      icon: Sparkles,
      iconColor: "text-amber-400",
      tag: "5-PROJECT FREE TRIAL",
      tagColor: "bg-amber-400/10 text-amber-400 border-amber-400/30",
      text: "Auto-provisioned business workspaces with full feature allowance & zero credit card required",
    },
    {
      icon: FileCheck,
      iconColor: "text-indigo-400",
      tag: "TWO-STAGE QA WORKFLOW",
      tagColor: "bg-indigo-400/10 text-indigo-400 border-indigo-400/30",
      text: "Deliverables revision tracking (v1.0 → v1.1) with Admin Quality Review & Client sign-off",
    },
    {
      icon: Receipt,
      iconColor: "text-emerald-400",
      tag: "GST INVOICING & RAZORPAY",
      tagColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
      text: "Automated GST-compliant tax invoicing linked directly to milestone progress & instant receipts",
    },
    {
      icon: ShieldCheck,
      iconColor: "text-purple-400",
      tag: "MULTI-TENANCY ISOLATION",
      tagColor: "bg-purple-400/10 text-purple-400 border-purple-400/30",
      text: "100% strict database-level isolation guarantees privacy across all tenant accounts",
    },
    {
      icon: Users,
      iconColor: "text-blue-400",
      tag: "4-ROLE UNIFIED ARCHITECTURE",
      tagColor: "bg-blue-400/10 text-blue-400 border-blue-400/30",
      text: "Super Admin Platform Console • Business Admin Hub • Vendor Workspace • Client Portal",
    },
    {
      icon: BarChart3,
      iconColor: "text-cyan-400",
      tag: "LIVE TELEMETRY & METRICS",
      tagColor: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
      text: "Real-time task completion percentages, MRR subscription analytics & audit logs",
    },
    {
      icon: CreditCard,
      iconColor: "text-violet-400",
      tag: "DUAL REVENUE STREAMS",
      tagColor: "bg-violet-400/10 text-violet-400 border-violet-400/30",
      text: "Separated SaaS subscription platform treasury from tenant client project invoice settlements",
    },
    {
      icon: Lock,
      iconColor: "text-rose-400",
      tag: "ENTERPRISE RBAC & SECURITY",
      tagColor: "bg-rose-400/10 text-rose-400 border-rose-400/30",
      text: "Granular role permissions, encrypted session tokens & comprehensive activity audit logging",
    },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* ============================================================
          FIXED/STICKY TOP HEADER (DOES NOT SCROLL AWAY)
      ============================================================ */}
      <div className="sticky top-0 z-50 w-full shadow-sm">
        {/* TOP ANNOUNCEMENT BANNER */}
        <div
          onClick={() => setShowAnnouncement(true)}
          className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition"
        >
          <span>🚀 5-Project Free Trial Active:</span>
          <span className="opacity-90 font-normal hidden md:inline">
            Provision new business workspaces with instant 5-project allowance • Zero credit card required!
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAnnouncement(true);
            }}
            className="hidden sm:inline-flex items-center gap-1 underline font-bold hover:text-amber-200 transition cursor-pointer"
          >
            Explore Live Platform <ArrowRight size={12} />
          </button>
        </div>

        {/* MAIN NAVIGATION BAR */}
        <header
          className={`border-b backdrop-blur-xl transition-colors duration-300 ${
            darkMode ? "bg-slate-950/90 border-slate-800/80" : "bg-white/90 border-slate-200/80"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25 border border-purple-500/30 flex items-center justify-center bg-slate-900 shrink-0"
              >
                <img
                  src="/images%20(1).jpg"
                  alt="Platform Profile Logo"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Multi-Tenant SaaS
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
                  Business Platform
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-bold">
              <a href="#roles" className={`hover:text-purple-600 transition ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                4-Role Ecosystem
              </a>
              <a href="#workflow" className={`hover:text-purple-600 transition ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Deliverables Workflow
              </a>
              <a href="#pricing" className={`hover:text-purple-600 transition ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Plans & Free Trial
              </a>
              <a href="#faq" className={`hover:text-purple-600 transition ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                FAQ
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle Theme"
                className={`p-2 rounded-xl border transition ${
                  darkMode
                    ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <Link
                to="/login"
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  darkMode ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Sign In
              </Link>

              <Link
                to={dashboardLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-600/30 hover:opacity-95 transition"
              >
                <LayoutDashboard size={14} />
                <span>Launch Dashboard</span>
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* ============================================================
          MAIN HERO BANNER WITH ANIL.PNG.WEBP BACKGROUND
      ============================================================ */}
      <section className="relative overflow-hidden w-full pt-0 pb-0">
        {/* FULL WIDTH HERO BANNER CONTAINER */}
        <div className="relative w-full overflow-hidden shadow-2xl min-h-[660px] lg:min-h-[720px] flex items-center justify-center bg-slate-950">
          {/* Background Image Layer from public/anil.png.webp (100% Fully Visible) */}
          <img
            src="/anil.png.webp"
            alt="Platform Workspace Banner"
            className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-1000 hover:scale-105"
          />

          {/* Subtle Translucent Gradient Overlay for High Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/40 to-slate-950/85 pointer-events-none" />

          {/* Hero Content on Top of Banner */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight sm:leading-tight mb-10 text-white drop-shadow-lg max-w-5xl mx-auto"
            >
              All-in-One Multi-Tenant Business &amp;{" "}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Project Workspace Platform
              </span>
            </motion.h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCta}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl shadow-purple-600/50 hover:opacity-95 hover:scale-105 transition cursor-pointer"
              >
                <LayoutDashboard size={20} />
                <span>Open Platform Console</span>
                <ArrowRight size={18} />
              </button>

              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold border border-white/30 bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition shadow-lg hover:scale-105"
              >
                <Lock size={18} className="text-slate-300" />
                <span>Sign In to Your Workspace</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          END-TO-END CONTINUOUS AUTO-ROTATING APPLICATION DATA TICKER
          (Seamless non-stop loop across the full screen width)
      ============================================================ */}
      <div className="w-full bg-slate-900/95 dark:bg-slate-950 border-y border-slate-700/60 dark:border-slate-800 py-3.5 overflow-hidden shadow-inner select-none relative z-20">
        <div className="flex animate-marquee-infinite items-center gap-8 whitespace-nowrap">
          {[...TICKER_DATA, ...TICKER_DATA].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 shrink-0 px-2">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  <IconComp size={15} className={`${item.iconColor} shrink-0`} />
                </div>

                {/* Badge Tag */}
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border ${item.tagColor}`}>
                  {item.tag}
                </span>

                {/* Information Description */}
                <span className="text-xs font-semibold text-slate-200 tracking-tight">
                  {item.text}
                </span>

                {/* Divider Separator between items */}
                <span className="text-slate-600 font-bold ml-6 select-none">✦</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SECTION 2: COMPLETE 4-ROLE ARCHITECTURE WORKFLOW (DISTINCT)
      ============================================================ */}
      <section id="roles" className={`relative py-20 border-t overflow-hidden ${darkMode ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200"}`}>
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
              <Sparkles size={12} className="text-purple-500" />
              THE 4-ROLE ENGINE
            </span>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl mt-1 mb-4 bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent">
              One Unified, Interconnected Application
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Strict multi-tenant security guarantees that each business operates in complete isolation, while the platform owner monitors ecosystem growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-950/80 shadow-lg hover:shadow-purple-500/15 hover:border-purple-500/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                    <Shield size={22} />
                  </div>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-purple-500 animate-ping" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">1. Super Admin</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Global platform controller. Manages business registrations, monitors free trial limits (5 projects), and tracks SaaS subscription revenue.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                <span>Platform Owner</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-950/80 shadow-lg hover:shadow-indigo-500/15 hover:border-indigo-500/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                    <Building2 size={22} />
                  </div>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">2. Business Admin</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Manages their isolated tenant workspace. Creates projects, invites clients and vendors, breaks down tasks, and issues project invoices.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <span>Tenant Workspace</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-950/80 shadow-lg hover:shadow-blue-500/15 hover:border-blue-500/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                    <Package size={22} />
                  </div>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">3. Vendor Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  External specialists executing project deliverables. Submits files with automatic revision tracking (v1.0, v1.1) and receives review comments.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <span>External Contractor</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-950/80 shadow-lg hover:shadow-emerald-500/15 hover:border-emerald-500/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                    <Users size={22} />
                  </div>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">4. Client Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Customer sign-off and payment hub. Approves deliverables, requests changes, views dynamic project progress, and settles invoices.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>Customer Sign-Off</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: DELIVERABLE APPROVAL LIFECYCLE (DISTINCT)
      ============================================================ */}
      <section id="workflow" className={`relative py-20 border-t overflow-hidden ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        {/* Animated Background Flow Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/20 via-indigo-500/30 to-emerald-500/20 pointer-events-none hidden lg:block -translate-y-6" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
              <Zap size={12} className="text-indigo-500" />
              QUALITY CONTROL PIPELINE
            </span>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl mt-1 mb-4 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
              Two-Stage Deliverable Approval Workflow
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Ensures high-quality deliverables by combining internal Admin QA with customer acceptance before invoice settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl hover:border-purple-500/60 hover:shadow-purple-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full font-mono text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    STEP 01
                  </span>
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Vendor Submit (v1.0)</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Vendor finishes task work and uploads deliverable package with documentation and artifacts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                <CheckCircle2 size={13} /> Automatic v1.0 Packaging
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl hover:border-indigo-500/60 hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full font-mono text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    STEP 02
                  </span>
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Admin Quality Review</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Business Admin reviews internally. Can approve or request revisions (triggering v1.1 resubmission).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                <CheckCircle2 size={13} /> QA Verification Gate
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl hover:border-blue-500/60 hover:shadow-blue-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full font-mono text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    STEP 03
                  </span>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Client Sign-Off</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Client reviews the Admin-approved work. Can approve milestone or submit specific change requests.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                <CheckCircle2 size={13} /> Customer Acceptance
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl hover:border-emerald-500/60 hover:shadow-emerald-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full font-mono text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    STEP 04
                  </span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Invoice &amp; Settlement</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Milestone triggers task completion, recalculates project progress %, and unlocks invoice payment.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={13} /> Instant Razorpay Gateway
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: 5-PROJECT FREE TRIAL & PRICING PLANS (DISTINCT)
      ============================================================ */}
      <section id="pricing" className={`relative py-20 border-t overflow-hidden ${darkMode ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
              <Receipt size={12} className="text-emerald-500" />
              TRANSPARENT SAAS TIERS
            </span>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl mt-1 mb-4 bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
              Start with 5 Free Projects, Upgrade as You Grow
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Every new tenant receives 5 projects free of charge. Upgrade seamlessly when your business expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Trial */}
            <motion.div
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/5 flex flex-col justify-between shadow-xl hover:shadow-amber-500/20 backdrop-blur-md transition-all duration-300"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  AUTO-PROVISIONED
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">Free Trial</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-400"> / first 5 projects</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 5 Project Workspaces</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 5 Team User Seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Deliverables Versioning</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Client &amp; Vendor Portals</li>
                </ul>
              </div>
              <button
                onClick={handleCta}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Claim 5 Free Projects
              </button>
            </motion.div>

            {/* Starter */}
            <motion.div
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between shadow-xl hover:shadow-blue-500/20 hover:border-blue-500/50 backdrop-blur-md transition-all duration-300"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                  STARTER TIER
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">Starter Plan</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$29</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 20 Project Workspaces</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 10 Team Seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> GST Invoicing &amp; Razorpay</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Unlimited Clients &amp; Vendors</li>
                </ul>
              </div>
              <button
                onClick={handleCta}
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Upgrade to Starter
              </button>
            </motion.div>

            {/* Professional */}
            <motion.div
              whileHover={{ y: -12, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border-2 border-purple-500 bg-purple-500/5 flex flex-col justify-between relative shadow-2xl hover:shadow-purple-500/30 backdrop-blur-md transition-all duration-300"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500 text-white animate-pulse">
                  POPULAR CHOICE
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">Professional</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$79</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 100 Project Workspaces</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 50 Team Seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Advanced Financial Reports</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Priority Support Desk</li>
                </ul>
              </div>
              <button
                onClick={handleCta}
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-600/30 cursor-pointer"
              >
                Upgrade to Pro
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-md transition-all duration-300"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  ENTERPRISE
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">Enterprise Plan</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$199</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 500 Project Workspaces</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> 200 Team Seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> Custom Domain Integration</li>
                </ul>
              </div>
              <button
                onClick={handleCta}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Choose Enterprise
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: FAQ (SIMPLE & CLEAN ACCORDION)
      ============================================================ */}
      <section id="faq" className={`py-20 border-t ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-1 mb-2">
              Everything You Need to Know
            </h2>
            <p className={`text-xs sm:text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Quick answers to common questions about workspaces, trial allowances, and billing.
            </p>
          </div>

          <div ref={faqContainerRef} className="space-y-3">
            {FAQS.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-purple-500/50 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-purple-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(prev => prev === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-purple-600 dark:text-purple-400" : "text-slate-400"
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER (COMPREHENSIVE MULTI-COLUMN DESIGN WITH PATH ANIMATIONS)
      ============================================================ */}
      <footer className={`relative border-t transition-colors duration-300 overflow-hidden ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
        {/* Subtle Ambient Light Orb in Footer */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            {/* Column 1: Brand Info & Profile */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 border border-purple-500/40 flex items-center justify-center bg-slate-900 shrink-0"
                >
                  <img
                    src="/images%20(1).jpg"
                    alt="Platform Profile Logo"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Multi-Tenant SaaS
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
                    Business Platform
                  </span>
                </div>
              </Link>

              <p className="text-xs leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
                Unified multi-tenant ecosystem connecting Super Admins, Business Owners, Vendors, and Clients. Features automated 5-project free trials, deliverable versioning (v1.0 → v1.1), and automated GST billing.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational • 99.9% SLA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <ShieldCheck size={12} className="text-purple-500" />
                  256-Bit SSL Encrypted
                </span>
              </div>
            </div>

            {/* Column 2: 4-Role Portals */}
            <div className="space-y-3.5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users size={14} className="text-purple-500" />
                4-Role Portals
              </p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/super-admin/dashboard" className="group inline-flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-all">
                    <ArrowRight size={12} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
                    <span>Super Admin Console</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="group inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                    <ArrowRight size={12} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    <span>Business Admin Hub</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/dashboard" className="group inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                    <ArrowRight size={12} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                    <span>Vendor Workspace</span>
                  </Link>
                </li>
                <li>
                  <Link to="/client/dashboard" className="group inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
                    <ArrowRight size={12} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    <span>Client Approval Portal</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Features & Workflows */}
            <div className="space-y-3.5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-500" />
                Platform Workflows
              </p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#workflow" className="group inline-flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-all">
                    <ArrowRight size={12} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
                    <span>2-Stage Deliverable QA</span>
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="group inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                    <ArrowRight size={12} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    <span>5-Project Free Trial</span>
                  </a>
                </li>
                <li>
                  <a href="#roles" className="group inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                    <ArrowRight size={12} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                    <span>Multi-Tenant Isolation</span>
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="group inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
                    <ArrowRight size={12} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    <span>GST Invoicing &amp; Razorpay</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Quick Launch Card */}
            <div className="space-y-3.5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock size={14} className="text-emerald-500" />
                Quick Workspace
              </p>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 shadow-md space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400 animate-spin" />
                  <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    5 Projects Free
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Provision new business workspaces instantly with zero setup fees.
                </p>
                <button
                  onClick={handleCta}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-600/30 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <LayoutDashboard size={13} />
                  <span>Launch Console</span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400 text-center sm:text-left">
              © 2026 Multi-Tenant SaaS Business Platform. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 dark:text-slate-400 font-medium">
              <a href="#roles" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#roles" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</a>
              <a href="#roles" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Security Architecture</a>
              <a href="#faq" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Support &amp; FAQ</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Chatbot for Home Page Visitors */}
      <LandingChatbot />

      {/* Free Trial Announcement Popup Modal on Initial Page Open */}
      <FreeTrialAnnouncementModal
        isOpen={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
      />
    </div>
  );
}
