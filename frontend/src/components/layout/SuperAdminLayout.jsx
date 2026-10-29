import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useApp } from "../../context/AppContext";

export default function SuperAdminLayout() {
  const location = useLocation();
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="SUPER_ADMIN" />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"}`}>
        <Navbar role="SUPER_ADMIN" />

        <main
          key={location.pathname}
          className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950"
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
