import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useApp } from "../../context/AppContext";

export default function VendorLayout() {
  const location = useLocation();
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar role="VENDOR" />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"}`}>
        <Navbar role="VENDOR" />

        <main
          key={location.pathname}
          className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
