import {
  Building2,
  Calculator,
  CreditCard,
  FileText,
  Globe2,
  Mail,
  Palette,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const SETTINGS = [
  {
    path: "general",
    label: "General",
    icon: Settings,
  },
  {
    path: "business",
    label: "Business",
    icon: Building2,
  },
  {
    path: "quotation",
    label: "Quotation",
    icon: FileText,
  },
  {
    path: "invoice",
    label: "Invoice",
    icon: ReceiptText,
  },
  {
    path: "payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    path: "tax",
    label: "Tax",
    icon: Calculator,
  },
  {
    path: "emails",
    label: "Emails",
    icon: Mail,
  },
  {
    path: "pdf",
    label: "PDF",
    icon: Palette,
  },
  {
    path: "translate",
    label: "Translate",
    icon: Globe2,
  },
  {
    path: "extras",
    label: "Extras",
    icon: Tags,
  },
  {
    path: "license",
    label: "License",
    icon: ShieldCheck,
  },
];

export default function SettingsSidebar({
  collapsed = false,
}) {
  return (
    <aside
      className={`rounded-3xl border border-slate-200 bg-white p-2 shadow-sm ${
        collapsed
          ? "w-16"
          : "w-full"
      }`}
    >
      {!collapsed && (
        <div className="px-3 pb-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Configuration
          </p>

          <h2 className="mt-1 text-sm font-bold text-slate-900">
            Settings
          </h2>
        </div>
      )}

      <nav className="space-y-1">
        {SETTINGS.map(
          ({
            path,
            label,
            icon: Icon,
          }) => (
            <NavLink
              key={path}
              to={`/admin/settings/${path}`}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
              title={
                collapsed
                  ? label
                  : undefined
              }
            >
              <Icon
                size={16}
                className="shrink-0"
              />

              {!collapsed && (
                <span>
                  {label}
                </span>
              )}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}