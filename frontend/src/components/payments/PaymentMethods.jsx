import { Smartphone, Building2, Banknote, ShieldCheck } from "lucide-react";
import useSettings from "../../hooks/useSettings";

export default function PaymentMethods({ value, onChange }) {
  const { settings } = useSettings();
  // Only disable a method if admin explicitly turned it OFF in settings
  // Default: all methods show (settings may not be configured yet)
  const p = settings?.payments || {};

  const allMethods = [
    {
      id: "razorpay",
      name: "Razorpay Checkout",
      description: "Card, UPI, Netbanking & Wallets",
      icon: <ShieldCheck size={20} />,
      enabled: p.razorpayEnabled !== false,
      selectedBg: "bg-indigo-50",
      selectedBorder: "border-indigo-600",
      selectedIconBg: "bg-slate-950",
      selectedIconColor: "text-indigo-300",
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
    },
    {
      id: "upi",
      name: "Manual UPI",
      description: p.upiId ? `Pay to ${p.upiId}` : "Record a manual UPI transfer",
      icon: <Smartphone size={20} />,
      enabled: p.upiEnabled !== false,
      selectedBg: "bg-emerald-50",
      selectedBorder: "border-emerald-500",
      selectedIconBg: "bg-slate-950",
      selectedIconColor: "text-emerald-300",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: p.bankName
        ? `${p.bankName} · ${p.ifscCode || "NEFT/RTGS"}`
        : "NEFT / RTGS / IMPS transfer",
      icon: <Building2 size={20} />,
      enabled: p.bankTransferEnabled !== false,
      selectedBg: "bg-blue-50",
      selectedBorder: "border-blue-500",
      selectedIconBg: "bg-slate-950",
      selectedIconColor: "text-blue-300",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      id: "cash",
      name: "Cash",
      description: "Physical cash payment in person",
      icon: <Banknote size={20} />,
      enabled: p.cashEnabled !== false,
      selectedBg: "bg-amber-50",
      selectedBorder: "border-amber-500",
      selectedIconBg: "bg-slate-950",
      selectedIconColor: "text-amber-300",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ];

  // Show only enabled methods (defaults to all if settings not yet configured)
  const availableMethods = allMethods.filter((m) => m.enabled);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {availableMethods.map((method) => {
        const isSelected = value === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
              isSelected
                ? `${method.selectedBorder} ${method.selectedBg}`
                : "border-slate-800 bg-[#151b2b] hover:border-slate-700"
            }`}
          >
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                isSelected
                  ? `${method.selectedIconBg} ${method.selectedIconColor}`
                  : `${method.iconBg} ${method.iconColor}`
              }`}
            >
              {method.icon}
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isSelected ? "text-slate-900" : "text-white"}`}>
                {method.name}
              </h4>
              <p className={`mt-1 text-xs ${isSelected ? "text-slate-600" : "text-slate-400"}`}>
                {method.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
