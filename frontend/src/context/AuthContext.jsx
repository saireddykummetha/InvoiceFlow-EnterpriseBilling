import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getCurrentUser, logout as apiLogout } from "../api/auth.js";
import api from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user") || localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // INITIALIZE / RESTORE AUTHENTICATION VIA /api/auth/me/
  // =====================================================

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (!token && !refresh) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_user");
      }
    } catch (err) {
      // Silently handle auth check errors - don't show toast during navigation
      console.warn("Auth check failed:", err?.message);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // =====================================================
  // LISTEN FOR LOGIN / LOGOUT EVENTS
  // =====================================================

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("access_token");
      const stored = localStorage.getItem("user") || localStorage.getItem("auth_user");

      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (err) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  // =====================================================
  // LOGIN HELPER
  // =====================================================

  const login = (userData) => {
    // Normal login clears any stale impersonation flags
    localStorage.removeItem("impersonation_super_admin_session");
    localStorage.removeItem("impersonation_meta");

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setUser(userData);
    }
    window.dispatchEvent(new Event("auth-changed"));
  };

  // =====================================================
  // LOGOUT HELPER
  // =====================================================

  const logout = async () => {
    try {
      localStorage.removeItem("impersonation_super_admin_session");
      localStorage.removeItem("impersonation_meta");
      await apiLogout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
      window.dispatchEvent(new Event("auth-changed"));
    }
  };

  // =====================================================
  // DERIVED AUTH STATE
  // =====================================================

  const authenticated = Boolean(localStorage.getItem("access_token") && user);

  const isSuperAdmin =
    user?.is_superuser === true || user?.role === "super_admin";

  const isAdmin =
    user?.is_staff === true ||
    user?.is_superuser === true ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const isVendor = user?.role === "vendor";

  const isClient = authenticated && !isSuperAdmin && !isVendor && (!user?.is_staff && user?.role !== "admin");

  const role =
    user?.role ||
    (isSuperAdmin ? "super_admin" : isAdmin ? "admin" : isVendor ? "vendor" : "client");

  const updateUser = (newUserData) => {
    if (newUserData) {
      setUser((prev) => {
        const merged = { ...prev, ...newUserData };
        localStorage.setItem("user", JSON.stringify(merged));
        localStorage.setItem("auth_user", JSON.stringify(merged));
        return merged;
      });
      window.dispatchEvent(new Event("auth-changed"));
    }
  };

  const isImpersonating = Boolean(localStorage.getItem("impersonation_super_admin_session"));

  const impersonationMeta = (() => {
    try {
      const raw = localStorage.getItem("impersonation_meta");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  })();

  const impersonateUser = async ({ business_id, target_user_id, email, reason = "Support / troubleshooting" }) => {
    try {
      // 1. Snapshot the current Super Admin session before switching
      let superAdminUser = user;
      if (!superAdminUser || (!superAdminUser.is_superuser && superAdminUser.role !== "super_admin")) {
        try {
          const rawU = localStorage.getItem("user") || localStorage.getItem("auth_user");
          if (rawU) superAdminUser = JSON.parse(rawU);
        } catch (err) {}
      }
      if (superAdminUser) {
        superAdminUser = {
          ...superAdminUser,
          role: "super_admin",
          is_superuser: true,
          is_staff: true,
        };
      }

      const currentSuperAdminSession = {
        access_token: localStorage.getItem("access_token"),
        refresh_token: localStorage.getItem("refresh_token"),
        user: superAdminUser,
      };

      const url = target_user_id
        ? `/superadmin/users/${target_user_id}/impersonate/`
        : "/superadmin/impersonate/";

      const res = await api.post(url, {
        business_id,
        target_user_id,
        email,
        reason,
      });

      if (res.data?.success && res.data.access) {
        localStorage.setItem("impersonation_super_admin_session", JSON.stringify(currentSuperAdminSession));
        localStorage.setItem("access_token", res.data.access);
        if (res.data.refresh) localStorage.setItem("refresh_token", res.data.refresh);

        const meta = res.data.impersonation || res.data.data?.impersonation || {
          actor: { email: superAdminUser?.email || "superadmin@invoiceflow.com", name: superAdminUser?.name || "Super Admin", role: "SUPER_ADMIN" },
          acting_as: { email: res.data.user?.email || email || "Admin", name: res.data.user?.name || "Admin", role: "ADMIN" },
          business: { name: res.data.user?.business_name || "Workspace" },
          started: new Date().toLocaleString(),
          reason,
        };
        localStorage.setItem("impersonation_meta", JSON.stringify(meta));

        const targetUser = res.data.user || res.data.data?.user;
        if (targetUser) {
          localStorage.setItem("user", JSON.stringify(targetUser));
          localStorage.setItem("auth_user", JSON.stringify(targetUser));
          setUser(targetUser);
        }
        window.dispatchEvent(new Event("auth-changed"));
        return res.data;
      }
      throw new Error(res.data?.message || "Failed to impersonate admin");
    } catch (err) {
      throw err;
    }
  };

  const stopImpersonation = () => {
    try {
      const raw = localStorage.getItem("impersonation_super_admin_session");
      const rawMeta = localStorage.getItem("impersonation_meta");
      const meta = rawMeta ? JSON.parse(rawMeta) : {};

      if (raw) {
        const prev = JSON.parse(raw);
        if (prev.access_token) localStorage.setItem("access_token", prev.access_token);
        if (prev.refresh_token) localStorage.setItem("refresh_token", prev.refresh_token);

        let restoredUser = prev.user;
        if (!restoredUser || (!restoredUser.is_superuser && restoredUser.role !== "super_admin")) {
          restoredUser = {
            id: meta.actor?.id || 1,
            email: meta.actor?.email || "superadmin@invoiceflow.com",
            username: "superadmin",
            name: meta.actor?.name || "Super Admin",
            role: "super_admin",
            is_superuser: true,
            is_staff: true,
          };
        } else {
          restoredUser = {
            ...restoredUser,
            role: "super_admin",
            is_superuser: true,
            is_staff: true,
          };
        }

        localStorage.setItem("user", JSON.stringify(restoredUser));
        localStorage.setItem("auth_user", JSON.stringify(restoredUser));
        setUser(restoredUser);

        localStorage.removeItem("impersonation_super_admin_session");
        localStorage.removeItem("impersonation_meta");
        window.dispatchEvent(new Event("auth-changed"));

        // Asynchronously notify backend to log IMPERSONATION_ENDED
        api.post("/superadmin/impersonate/exit/", {
          business_id: meta.business?.id,
          actor_email: meta.actor?.email || restoredUser.email,
          acting_as_email: meta.acting_as?.email,
          reason: "Support session concluded by Super Admin",
        }).catch((e) => console.warn("Audit exit note:", e?.message));

        return true;
      }
    } catch (e) {
      console.error("Stop impersonation error:", e);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loading,
        authLoading: loading,
        authenticated,
        isAuthenticated: authenticated,
        isSuperAdmin,
        isAdmin,
        isVendor,
        isClient,
        role,
        isImpersonating,
        impersonationMeta,
        impersonateUser,
        stopImpersonation,
        login,
        logout,
        reload: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;