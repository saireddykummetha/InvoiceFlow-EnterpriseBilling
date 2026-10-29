import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import profileService from "../../services/profileService";
import ProfileModal from "../../components/profile/ProfileModal";

export default function ClientProfile() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [profile, setProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState("business");


  const loadProfile = async () => {
    try {
      const data = await profileService.get();
      setProfile(data?.data || data || {});
    } catch (error) {
      console.error("Client profile load error:", error);
    }
  };
   
    useEffect(() => {
    loadProfile();
  }, []);


  const businessName =
    profile?.business_name ||
    settings?.business?.businessName ||
    settings?.business?.companyName ||
    user?.name ||
    "Client Profile";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Profile & Preferences
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your client information, billing address, and portal credentials.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDefaultTab("business");
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <Edit3 size={15} />
          <span>Edit in Popup</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Contact & Address Details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setDefaultTab("business");
                setModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Update →
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Client / Business Name" value={businessName} />
            <InfoItem label="Legal Entity" value={profile?.legal_name || "—"} />
            <InfoItem label="Contact Email" value={profile?.email || user?.email || "—"} icon={Mail} />
            <InfoItem label="Phone Number" value={profile?.phone || "—"} icon={Phone} />
            <InfoItem label="Website" value={profile?.website || "—"} icon={Globe} />
            <InfoItem label="Tax ID / GSTIN" value={profile?.tax_number || "—"} />
          </div>

          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <InfoItem
              label="Billing Address"
              value={
                profile?.address
                  ? `${profile.address}${profile?.city ? `, ${profile.city}` : ""}${profile?.state ? `, ${profile.state}` : ""}${profile?.postal_code ? ` - ${profile.postal_code}` : ""}${profile?.country ? `, ${profile.country}` : ""}`
                  : "No billing address set"
              }
              icon={MapPin}
            />
          </div>
        </div>

        {/* Security / Account Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Portal Account
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-base">
                {user?.name || user?.username || "Client User"}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {user?.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 mt-2">
                CLIENT
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setDefaultTab("account");
                setModalOpen(true);
              }}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Change Portal Password
            </button>
          </div>
        </div>
      </div>

      {/* Unified Profile Modal Popup */}
      <ProfileModal
        open={modalOpen}
        defaultTab={defaultTab}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          loadProfile();
        }}
      />
    </motion.div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div>
      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}