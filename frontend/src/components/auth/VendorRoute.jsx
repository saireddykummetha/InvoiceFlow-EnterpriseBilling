import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

export default function VendorRoute() {
  const {
    loading,
    authenticated,
    isVendor,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!isVendor) {
    const target = authService.getDashboardPath(user);
    return (
      <Navigate
        to={target}
        replace
      />
    );
  }

  return <Outlet />;
}
