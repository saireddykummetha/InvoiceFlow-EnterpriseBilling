import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  User,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import useSettings from "../../hooks/useSettings";
import { SETTINGS_SECTIONS } from "../../constants/settingsSections";
import SettingsModal from "../settings/SettingsModal";

const SUPER_ADMIN_ITEMS = [
  { label: "Dashboard", path: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Businesses", path: "/super-admin/tenants", icon: Building2 },
  { label: "Users", path: "/super-admin/users", icon: Users },
  { label: "Subscriptions", path: "/super-admin/subscriptions", icon: CreditCard },
  { label: "Payments & Revenue", path: "/super-admin/payments", icon: WalletCards },
  { label: "Audit Logs", path: "/super-admin/audit-logs", icon: Activity },
  { label: "Notifications", path: "/super-admin/notifications", icon: Bell },
  { label: "Settings", path: "/super-admin/settings", icon: Settings },
  { label: "Profile", path: "/super-admin/profile", icon: User },
];

const ADMIN_GROUPS = [
  {
    group: "OPERATIONS",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Projects Hub", path: "/admin/projects", icon: FolderKanban },
      { label: "Tasks Board", path: "/admin/tasks", icon: CheckCircle2 },
      { label: "Deliverables Review", path: "/admin/deliverables", icon: FileCheck },
      { label: "Clients Directory", path: "/admin/clients", icon: Users },
      { label: "Vendors Directory", path: "/admin/vendors", icon: Store },
    ],
  },
  {
    group: "FINANCE & BILLING",
    items: [
      { label: "Invoices", path: "/admin/invoices", icon: Receipt },
      { label: "Payments", path: "/admin/payments", icon: CreditCard },
      { label: "Quotations", path: "/admin/quotes", icon: FileText },
      { label: "Subscription & Plans", path: "/admin/subscription", icon: CreditCard },
      { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    group: "COLLABORATION & SYSTEM",
    items: [
      { label: "Documents Vault", path: "/admin/documents", icon: FileText },
      { label: "Messages Hub", path: "/admin/messages", icon: MessageSquare },
      { label: "Support Tickets", path: "/admin/tickets", icon: LifeBuoy },
      { label: "Notifications", path: "/admin/notifications", icon: Bell },
      { label: "Settings", path: "/admin/settings", icon: Settings, isSettingsFlyout: true },
    ],
  },
];

const VENDOR_ITEMS = [
  { label: "Dashboard", path: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "My Projects", path: "/vendor/projects", icon: FolderKanban },
  { label: "My Tasks", path: "/vendor/tasks", icon: CheckCircle2 },
  { label: "Deliverables", path: "/vendor/deliverables", icon: FileCheck },
  { label: "Purchase Orders", path: "/vendor/orders", icon: ShoppingCart },
  { label: "Invoices", path: "/vendor/invoices", icon: Receipt },
  { label: "Payments", path: "/vendor/payments", icon: CreditCard },
  { label: "Documents", path: "/vendor/documents", icon: FileText },
  { label: "Messages", path: "/vendor/messages", icon: MessageSquare },
  { label: "Company Profile", path: "/vendor/profile", icon: User },
];

const CLIENT_ITEMS = [
  { label: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
  { label: "My Projects", path: "/client/projects", icon: FolderKanban },
  { label: "Approvals & Deliverables", path: "/client/approvals", icon: FileCheck },
  { label: "My Invoices", path: "/client/invoices", icon: Receipt },
  { label: "Payments & Billing", path: "/client/payments", icon: WalletCards },
  { label: "Receipts", path: "/client/receipts", icon: FileText },
  { label: "Documents", path: "/client/documents", icon: FileText },
  { label: "Messages", path: "/client/messages", icon: MessageSquare },
  { label: "Support Tickets", path: "/client/tickets", icon: LifeBuoy },
  { label: "Profile", path: "/client/profile", icon: Users },
];

export default function Sidebar({ role = "ADMIN" }) {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();

  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSettingModal, setActiveSettingModal] = useState(null);

  useEffect(() => {
    const handleOpenModal = (e) => {
      if (e?.detail) {
        setActiveSettingModal(e.detail);
      }
    };
    window.addEventListener("open-settings-modal", handleOpenModal);
    return () => window.removeEventListener("open-settings-modal", handleOpenModal);
  }, []);

  const normalizedRole = String(role).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleOpenCategory = (cat) => {
    setActiveSettingModal(cat);
  };

  // Determine Brand Initial, Title & Logo
  const getBrandInfo = () => {
    if (normalizedRole === "VENDOR") {
      const initial = user?.company_name?.[0] || user?.name?.[0] || "V";
      return {
        initial: initial.toUpperCase(),
        title: "VENDOR PORTAL",
        subtitle: user?.company_name || user?.name || "VENDOR CONSOLE",
        logo: user?.avatar || null,
      };
    }
    if (normalizedRole === "SUPER_ADMIN") {
      return {
        initial: "S",
        title: "SUPER ADMIN",
        subtitle: "GLOBAL CONSOLE",
        logo: user?.avatar || null,
      };
    }
    if (normalizedRole === "CLIENT") {
      const initial = user?.name?.[0] || user?.company_name?.[0] || "C";
      return {
        initial: initial.toUpperCase(),
        title: "CLIENT PORTAL",
        subtitle: user?.name || "CUSTOMER PORTAL",
        logo: user?.avatar || null,
      };
    }
    // Admin
    const initial =
      settings?.business?.businessName?.[0] ||
      settings?.business?.companyName?.[0] ||
      settings?.company_name?.[0] ||
      user?.name?.[0] ||
      "T";
    return {
      initial: initial.toUpperCase(),
      title: "INVOICEFLOW",
      subtitle:
        settings?.business?.businessName ||
        settings?.business?.companyName ||
        settings?.company_name ||
        "BUSINESS CONSOLE",
      logo:
        settings?.business?.logoUrl ||
        settings?.business?.logo ||
        user?.avatar ||
        null,
    };
  };

  const brand = getBrandInfo();

  const renderSidebar = (isDrawer = false) => {
    const isCollapsed = !isDrawer && sidebarCollapsed;

    return (
      <aside
        className={`flex h-full flex-col bg-white dark:bg-[#070b14] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-x-hidden shadow-xl lg:shadow-none ${
          isCollapsed ? "w-[80px]" : "w-[260px]"
        }`}
      >
        {/* BRAND / TOGGLE HEADER */}
        <div className="flex h-[72px] items-center border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          {isDrawer ? (
            <div className="flex items-center justify-between px-5 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800/90 border border-slate-800 dark:border-slate-700/60 text-white font-extrabold text-base shadow-sm overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.title}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span>{brand.initial}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white truncate block">
                    {brand.title}
                  </span>
                  <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 -mt-0.5 uppercase truncate max-w-[130px]">
                    {brand.subtitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition cursor-pointer"
                title="Close Menu"
              >
                <X size={18} />
              </button>
            </div>
          ) : isCollapsed ? (
            <div className="flex w-full items-center justify-center">
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Expand Sidebar"
              >
                <Menu size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-5 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800/90 border border-slate-800 dark:border-slate-700/60 text-white font-extrabold text-base shadow-sm overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.title}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span>{brand.initial}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white truncate block">
                    {brand.title}
                  </span>
                  <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 -mt-0.5 uppercase truncate max-w-[140px]">
                    {brand.subtitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Collapse Sidebar"
              >
                <Menu size={18} />
              </button>
            </div>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${
            isCollapsed ? "px-2 space-y-2" : "px-3.5 space-y-3"
          }`}
        >
          {/* BRAND / AVATAR TILE IN COLLAPSED RAIL */}
          {isCollapsed && (
            <div className="flex flex-col items-center justify-center pb-2">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800/90 border border-slate-800 dark:border-slate-700/60 text-white font-extrabold text-base shadow-sm overflow-hidden"
                title={brand.subtitle}
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.title}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{brand.initial}</span>
                )}
              </div>
              <div className="my-2 h-px w-6 mx-auto bg-slate-200 dark:bg-slate-800/80" />
            </div>
          )}

          {normalizedRole === "ADMIN" ? (
            <>
              {ADMIN_GROUPS.map((sec, secIdx) => (
                <div key={sec.group} className="space-y-1">
                  {isCollapsed ? (
                    secIdx > 0 && (
                      <div className="my-2 h-px w-6 mx-auto bg-slate-200 dark:bg-slate-800/80" />
                    )
                  ) : (
                    <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 pt-2 pb-1">
                      {sec.group}
                    </p>
                  )}

                  <div className={isCollapsed ? "space-y-2" : "space-y-1"}>
                    {sec.items.map((item) => {
                      if (item.isSettingsFlyout) {
                        return (
                          <SettingsSideFlyoutItem
                            key={item.label}
                            sidebarCollapsed={isCollapsed}
                            onOpenCategory={(cat) => {
                              if (isDrawer) setSidebarOpen(false);
                              handleOpenCategory(cat);
                            }}
                          />
                        );
                      }

                      if (item.isProfile) {
                        return (
                          <SidebarProfileButton
                            key={item.label}
                            item={item}
                            sidebarCollapsed={isCollapsed}
                            onItemClick={() => {
                              if (isDrawer) setSidebarOpen(false);
                            }}
                          />
                        );
                      }

                      return (
                        <SidebarItem
                          key={item.label}
                          item={item}
                          sidebarCollapsed={isCollapsed}
                          onItemClick={() => {
                            if (isDrawer) setSidebarOpen(false);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : normalizedRole === "VENDOR" ? (
            <div className={isCollapsed ? "space-y-2" : "space-y-1"}>
              {VENDOR_ITEMS.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  sidebarCollapsed={isCollapsed}
                  onItemClick={() => {
                    if (isDrawer) setSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={isCollapsed ? "space-y-2" : "space-y-1"}>
              {(normalizedRole === "SUPER_ADMIN"
                ? SUPER_ADMIN_ITEMS
                : CLIENT_ITEMS
              ).map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  sidebarCollapsed={isCollapsed}
                  onItemClick={() => {
                    if (isDrawer) setSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 shrink-0">
          {isCollapsed ? (
            <div className="relative group flex items-center justify-center">
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut size={20} className="shrink-0" />
              </button>
              {/* Tooltip */}
              <div className="pointer-events-none fixed left-[82px] z-[9999] hidden group-hover:flex items-center rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-rose-400 shadow-2xl border border-slate-700/50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                Logout
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="truncate font-medium">Logout</span>
            </button>
          )}
        </div>
      </aside>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (>= 1024px) */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-30 h-full shrink-0">
        {renderSidebar(false)}
      </div>

      {/* MOBILE / HALF-SCREEN DRAWER (< 1024px) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden"
            >
              {renderSidebar(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ACTIVE MODAL CONTAINER (IF OPENED DIRECTLY) */}
      {activeSettingModal && (
        <SettingsModal
          isOpen={Boolean(activeSettingModal)}
          onClose={() => setActiveSettingModal(null)}
          defaultCategory={activeSettingModal}
        />
      )}
    </>
  );
}

// ============================================================
// SIDEBAR ITEM (FOR COLLAPSED & EXPANDED)
// ============================================================

function SidebarItem({ item, sidebarCollapsed, onItemClick }) {
  const Icon = item.icon;
  const isDashboard = item.path.endsWith("/dashboard");

  if (sidebarCollapsed) {
    return (
      <div className="relative group flex items-center justify-center">
        <NavLink
          to={item.path}
          end={isDashboard}
          onClick={onItemClick}
          className={({ isActive }) => `
            relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer
            ${
              isActive
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
            }
          `}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className="shrink-0" />
              {item.badge && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-[#070b14]" />
              )}
            </>
          )}
        </NavLink>

        {/* Floating Tooltip */}
        <div className="pointer-events-none fixed left-[82px] z-[9999] hidden group-hover:flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-slate-700/50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
          <span>{item.label}</span>
          {item.badge && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500 text-white">
              {item.badge}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={isDashboard}
      onClick={onItemClick}
      className={({ isActive }) => `
        group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150
        ${
          isActive
            ? "bg-[#6342ff] text-white font-semibold shadow-md shadow-indigo-600/25"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        }
      `}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 min-w-0">
            <Icon
              size={18}
              className={`shrink-0 ${
                isActive
                  ? "text-white"
                  : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
              }`}
            />
            <span className="truncate">{item.label}</span>
          </div>

          {item.badge && (
            <span
              className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : item.badgeColor || "bg-emerald-500 text-white"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ============================================================
// PROFILE BUTTON
// ============================================================

function SidebarProfileButton({ item, sidebarCollapsed, onItemClick }) {
  const Icon = item.icon || User;

  const handleClick = () => {
    onItemClick?.();
    window.dispatchEvent(new CustomEvent("open-profile-modal"));
  };

  if (sidebarCollapsed) {
    return (
      <div className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={handleClick}
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <Icon size={20} className="shrink-0" />
        </button>
        {/* Tooltip */}
        <div className="pointer-events-none fixed left-[82px] z-[9999] hidden group-hover:flex items-center rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-slate-700/50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
          {item.label}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full group flex items-center gap-3 px-3.5 rounded-xl py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
    >
      <Icon
        size={18}
        className="shrink-0 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
      />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

// ============================================================
// SETTINGS SIDE FLYOUT ITEM
// ============================================================

function SettingsSideFlyoutItem({ sidebarCollapsed, onOpenCategory }) {
  const navigate = useNavigate();
  const location = useLocation();
  const btnRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);

  const isSettingsActive = location.pathname.startsWith("/admin/settings");

  const updatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const estimatedHeight = 440;

    let targetTop = rect.top;
    if (targetTop + estimatedHeight > windowHeight - 20) {
      targetTop = Math.max(20, windowHeight - estimatedHeight - 20);
    }

    setPos({
      left: rect.right + 12,
      top: targetTop,
    });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleFlyoutMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClickItem = (cat) => {
    setIsOpen(false);
    navigate(`/admin/settings?tab=${cat}`);
    onOpenCategory(cat);
  };

  const handleMainClick = () => {
    navigate("/admin/settings?tab=general");
    onOpenCategory("general");
  };

  const floatingFlyout =
    isOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        {/* Invisible backdrop */}
        <div className="fixed inset-0 z-[99998]" onClick={() => setIsOpen(false)} />

        <div
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
          style={{
            position: "fixed",
            left: `${pos.left}px`,
            top: `${pos.top}px`,
          }}
          className="z-[99999] w-[460px] max-w-[calc(100vw-120px)] rounded-3xl bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Settings size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">System Settings & Modules</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Click any module to configure</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {SETTINGS_SECTIONS.length} Modules
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {SETTINGS_SECTIONS.map((sec) => {
              const SecIcon = sec.icon;
              return (
                <button
                  key={sec.category}
                  type="button"
                  onClick={() => handleClickItem(sec.category)}
                  title={sec.title}
                  className="group/btn flex items-center gap-2.5 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all text-left hover:shadow-xs hover:scale-[1.02] cursor-pointer"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sec.color} shadow-xs group-hover/btn:scale-105 transition`}>
                    <SecIcon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 truncate">
                      {sec.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sec.shortTitle || sec.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>,
      document.body
    );

  if (sidebarCollapsed) {
    return (
      <div
        ref={btnRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group flex items-center justify-center"
      >
        <button
          type="button"
          onClick={handleMainClick}
          className={`
            relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer
            ${
              isSettingsActive || isOpen
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
            }
          `}
        >
          <Settings size={20} className="shrink-0" />
        </button>

        {/* Floating Tooltip */}
        <div className="pointer-events-none fixed left-[82px] z-[9999] hidden group-hover:flex items-center rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-slate-700/50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
          Settings (Hover for modules)
        </div>

        {floatingFlyout}
      </div>
    );
  }

  return (
    <div
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <button
        type="button"
        onClick={handleMainClick}
        className={`
          w-full group flex items-center gap-3 px-3.5 rounded-xl py-2.5 text-sm font-medium transition cursor-pointer
          ${
            isSettingsActive || isOpen
              ? "bg-[#6342ff] text-white font-semibold shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
          }
        `}
      >
        <Settings
          size={18}
          className={`shrink-0 ${
            isSettingsActive || isOpen
              ? "text-white"
              : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
          }`}
        />
        <span className="truncate">Settings</span>
      </button>

      {floatingFlyout}
    </div>
  );
}