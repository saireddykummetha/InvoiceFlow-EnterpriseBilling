import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

export default function SuperAdminRoute() {
  const {
    loading,
    authenticated,
    isSuperAdmin,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
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

  if (!isSuperAdmin) {
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
