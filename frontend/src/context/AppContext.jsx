import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // =====================================================
  // SIDEBAR
  // =====================================================

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] =
    useState([]);

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    const saved =
      localStorage.getItem("darkMode");

    if (saved !== null) {
      return saved === "true";
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  });

  // Apply dark class to <html>
  useEffect(() => {
    const root =
      document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem(
      "darkMode",
      String(darkMode)
    );
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(
      (previous) => !previous
    );
  };

  // =====================================================
  // SIDEBAR HELPERS
  // =====================================================

  const toggleSidebar = () => {
    setSidebarOpen(
      (previous) => !previous
    );
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(
      (previous) => !previous
    );
  };

  // =====================================================
  // NOTIFICATION HELPERS
  // =====================================================

  const addNotification = (
    notification = {}
  ) => {
    const newNotification = {
      id:
        notification.id ||
        Date.now(),

      type:
        notification.type ||
        "info",

      title:
        notification.title ||
        "Notification",

      message:
        notification.message ||
        "",

      createdAt:
        new Date().toISOString(),

      ...notification,
    };

    setNotifications(
      (current) => [
        newNotification,
        ...current,
      ]
    );
  };

  const removeNotification = (
    id
  ) => {
    setNotifications(
      (current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // =====================================================
  // GLOBAL SEARCH
  // =====================================================

  const [globalSearch, setGlobalSearch] =
    useState("");

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = useMemo(
    () => ({
      // -------------------------------------------------
      // Sidebar
      // -------------------------------------------------

      sidebarOpen,

      setSidebarOpen,

      toggleSidebar,

      closeSidebar,

      sidebarCollapsed,

      setSidebarCollapsed,

      toggleSidebarCollapsed,

      // -------------------------------------------------
      // Dark mode
      // -------------------------------------------------

      darkMode,

      setDarkMode,

      toggleDarkMode,

      // -------------------------------------------------
      // Notifications
      // -------------------------------------------------

      notifications,

      addNotification,

      removeNotification,

      clearNotifications,

      // -------------------------------------------------
      // Global search
      // -------------------------------------------------

      globalSearch,

      setGlobalSearch,
    }),
    [
      sidebarOpen,
      sidebarCollapsed,
      notifications,
      darkMode,
      globalSearch,
    ]
  );

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}

// =====================================================
// useApp HOOK
// =====================================================

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside an AppProvider"
    );
  }

  return context;
}

export default AppContext;