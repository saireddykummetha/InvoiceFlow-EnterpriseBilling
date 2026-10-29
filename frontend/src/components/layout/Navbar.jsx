import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import useSettings from "../../hooks/useSettings";

import GlobalSearch from "./GlobalSearch";
import ProfileModal from "../profile/ProfileModal";
import NotificationDropdown from "../notifications/NotificationDropdown";

export default function Navbar({ role = "ADMIN" }) {
  const {
    setSidebarOpen,
    globalSearch,
    setGlobalSearch,
    darkMode,
    toggleDarkMode,
    toggleSidebarCollapsed,
  } = useApp();

  const { user, logout, isImpersonating, stopImpersonation } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileDefaultTab, setProfileDefaultTab] = useState("business");

  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleOpenProfile = () => {
      setProfileDefaultTab("business");
      setProfileModalOpen(true);
    };
    window.addEventListener("open-profile-modal", handleOpenProfile);
    return () => window.removeEventListener("open-profile-modal", handleOpenProfile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setProfileOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setProfileOpen(false);
    }, 250);
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT TOGGLE & SEARCH */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          {/* Mobile / Half-screen toggle sidebar button */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden flex shrink-0 h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu size={19} />
          </button>

          {/* SEARCH INPUT (MATCHING TEMPLATE) */}
          <div className="relative w-full max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search here..."
              className="
                h-10
                w-full
                rounded-xl
                border
                border-slate-200/80
                bg-slate-50/80
                pl-10
                pr-4
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-400
                focus:bg-white
                focus:ring-3
                focus:ring-indigo-100
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-200
                dark:placeholder:text-slate-500
                dark:focus:border-indigo-500
                dark:focus:bg-slate-800
                dark:focus:ring-indigo-950
              "
            />

            <GlobalSearch
              query={globalSearch}
              onClose={() => setGlobalSearch("")}
              onClear={() => setGlobalSearch("")}
            />
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          {/* DARK MODE TOGGLE */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition"
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* NOTIFICATION BELL WITH COUNTER */}
          <div className="relative">
            <NotificationDropdown badgeCount={8} />
          </div>

          {/* MESSAGES / MAIL ICON WITH BLUE BADGE */}
          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            title="Messages"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            <Mail size={19} />
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
              5
            </span>
          </button>

          {/* USER PROFILE INFO & AVATAR (MATCHING TEMPLATE) */}
          <div
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative ml-1"
          >
            <button
              type="button"
              onClick={handleToggleClick}
              className={`flex items-center gap-3 rounded-2xl p-1.5 transition cursor-pointer ${
                profileOpen
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "hover:bg-slate-100/70 dark:hover:bg-slate-800"
              }`}
            >
              {/* User Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-sm font-bold text-white ring-2 ring-indigo-500/20 shadow-sm overflow-hidden">
                {user?.avatar || settings?.business?.logoUrl || settings?.business?.logo ? (
                  <img
                    src={user?.avatar || settings?.business?.logoUrl || settings?.business?.logo}
                    alt={user?.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>
                )}
              </div>

              {/* Name & Role */}
              <div className="hidden text-left md:block">
                <p className="max-w-[130px] truncate text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 capitalize leading-tight mt-0.5">
                  {role === "ADMIN" ? "Administrator" : role === "SUPER_ADMIN" ? "Super Admin" : role === "VENDOR" ? "Vendor" : "Client"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 hidden sm:block ${
                  profileOpen ? "rotate-180 text-indigo-600" : ""
                }`}
              />
            </button>

            {/* PROFILE FLYOUT */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileDefaultTab("business");
                      setProfileModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    <User size={15} />
                    Account & Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/settings");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    <Settings size={15} />
                    System Settings
                  </button>

                  {isImpersonating && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        stopImpersonation();
                        toast.success("Returned to Super Admin Console");
                        window.location.href = "/superadmin/tenants";
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer my-1"
                    >
                      <ArrowLeft size={15} />
                      Return to Super Admin
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        defaultTab={profileDefaultTab}
      />
    </header>
  );
}