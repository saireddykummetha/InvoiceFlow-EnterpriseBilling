import { Outlet } from "react-router-dom";

export default function SettingsLayout() {
  return (
    <div className="min-h-full space-y-6">
      <Outlet />
    </div>
  );
}