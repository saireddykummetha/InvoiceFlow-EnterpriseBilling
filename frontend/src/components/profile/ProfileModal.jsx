import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Upload,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import profileService from "../../services/profileService";
import api from "../../api/api";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "Saudi Arabia",
  "Qatar",
  "Other",
];

export default function ProfileModal({
  open,
  onClose,
  onSuccess,
  defaultTab = "business",
}) {
  const { user, updateUser } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState(defaultTab); // "business" | "account"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Business Profile Form
  const [businessName, setBusinessName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [logoUrl, setLogoUrl] = useState("");

  // Account Form
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      loadData();
    }
  }, [open, defaultTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await profileService.get();
      const p = data?.data || data || {};

      setBusinessName(p.business_name || settings?.business?.businessName || settings?.business?.companyName || "");
      setLegalName(p.legal_name || settings?.business?.legalName || "");
      setBusinessEmail(p.email || settings?.business?.email || user?.email || "");
      setPhone(p.phone || settings?.business?.phone || "");
      setWebsite(p.website || settings?.business?.website || "");
      setTaxNumber(p.tax_number || settings?.business?.taxNumber || "");
      setAddress(p.address || settings?.business?.address || "");
      setCity(p.city || settings?.business?.city || "");
      setStateVal(p.state || settings?.business?.state || "");
      setPostalCode(p.postal_code || settings?.business?.postalCode || "");
      setCountry(p.country || settings?.business?.country || "India");
      setLogoUrl(p.logo_url || p.logo || settings?.business?.logoUrl || settings?.business?.logo || "");

      setAccountName(user?.name || user?.username || "");
      setAccountEmail(user?.email || "");
      setAvatarUrl(user?.avatar || "");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to load profile details:", err);
      if (settings?.business) {
        setBusinessName(settings.business.businessName || settings.business.companyName || "");
        setLegalName(settings.business.legalName || "");
        setBusinessEmail(settings.business.email || user?.email || "");
        setPhone(settings.business.phone || "");
        setWebsite(settings.business.website || "");
        setTaxNumber(settings.business.taxNumber || "");
        setAddress(settings.business.address || "");
        setCity(settings.business.city || "");
        setStateVal(settings.business.state || "");
        setPostalCode(settings.business.postalCode || "");
        setCountry(settings.business.country || "India");
        setLogoUrl(settings.business.logoUrl || "");
      }
      setAccountName(user?.name || user?.username || "");
      setAccountEmail(user?.email || "");
      setAvatarUrl(user?.avatar || "");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "business") {
      if (!businessName.trim()) {
        toast.error("Business Name is required");
        return;
      }

      try {
        setSaving(true);
        const payload = {
          business_name: businessName.trim(),
          legal_name: legalName.trim(),
          email: businessEmail.trim(),
          phone: phone.trim(),
          website: website.trim(),
          tax_number: taxNumber.trim(),
          address: address.trim(),
          city: city.trim(),
          state: stateVal.trim(),
          postal_code: postalCode.trim(),
          country: country.trim(),
        };

        if (logoUrl && logoUrl.startsWith("data:image")) {
          payload.logo = logoUrl;
        }

        // 1. Update Profile API
        await profileService.update(payload);

        // 2. Also sync to AppSettings so all components and PDFs update dynamically
        try {
          await updateSettings("business", {
            businessName: businessName.trim(),
            companyName: businessName.trim(),
            legalName: legalName.trim(),
            email: businessEmail.trim(),
            phone: phone.trim(),
            website: website.trim(),
            taxNumber: taxNumber.trim(),
            address: address.trim(),
            city: city.trim(),
            state: stateVal.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            logoUrl: logoUrl,
            logo: logoUrl,
          });
        } catch (_) {}

        updateUser({
          name: businessName.trim(),
          company_name: businessName.trim(),
        });

        toast.success("Business profile updated successfully");
        onSuccess?.(payload);
        onClose?.();
      } catch (err) {
        console.error("Save business profile error:", err);
        toast.error(
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Unable to update profile"
        );
      } finally {
        setSaving(false);
      }
    } else {
      // Account & Security tab
      if (!accountName.trim()) {
        toast.error("Full Name is required");
        return;
      }

      try {
        setSaving(true);

        // Update User info (name, email, avatar)
        const updatePayload = {
          name: accountName.trim(),
          first_name: accountName.trim(),
          email: accountEmail.trim(),
        };
        if (avatarUrl) {
          updatePayload.avatar = avatarUrl;
        }

        const res = await api.put("/auth/me/", updatePayload);
        const updatedUser = res.data?.data?.user;

        if (updatedUser) {
          updateUser(updatedUser);
        } else {
          updateUser({
            name: accountName.trim(),
            first_name: accountName.trim(),
            email: accountEmail.trim(),
            avatar: avatarUrl,
          });
        }

        // Change Password if provided
        if (newPassword) {
          if (!oldPassword) {
            toast.error("Current password is required to set a new password");
            setSaving(false);
            return;
          }
          if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            setSaving(false);
            return;
          }
          if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match");
            setSaving(false);
            return;
          }

          await api.post("/auth/change-password/", {
            old_password: oldPassword,
            new_password: newPassword,
            new_password_confirm: confirmPassword || newPassword,
          });
          toast.success("Password changed successfully");
        }

        toast.success("Account profile & photo updated successfully");
        onSuccess?.();
        onClose?.();
      } catch (err) {
        console.error("Save account error:", err);
        const data = err?.response?.data;
        let errMsg = "Unable to update account details";

        if (typeof data === "string") {
          errMsg = data;
        } else if (data?.message) {
          errMsg = data.message;
        } else if (data?.detail) {
          errMsg = data.detail;
        } else if (data?.old_password?.[0]) {
          errMsg = `Current Password: ${data.old_password[0]}`;
        } else if (data?.new_password?.[0]) {
          errMsg = `New Password: ${data.new_password[0]}`;
        } else if (data?.new_password_confirm?.[0]) {
          errMsg = `Confirm Password: ${data.new_password_confirm[0]}`;
        } else if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const val = data[firstKey];
            errMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
          }
        }

        toast.error(errMsg);
      } finally {
        setSaving(false);
      }
    }
  };


  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-modal-overlay"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sm:py-5 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm">
                  {activeTab === "business" ? <Building2 size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {activeTab === "business" ? "Business Profile" : "Account & Security"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {activeTab === "business"
                      ? "Manage business details that appear on invoices, quotes, and emails"
                      : "Manage your login credentials, name, and security settings"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 dark:bg-slate-800/30 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("business")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition border-b-2 ${
                  activeTab === "business"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Building2 size={15} />
                Business Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition border-b-2 ${
                  activeTab === "account"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <User size={15} />
                Account & Password
              </button>
            </div>

            {/* Modal Body / Form */}
            {loading ? (
              <div className="flex flex-1 items-center justify-center p-12">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
                {activeTab === "business" ? (
                  <>
                    {/* Logo Section */}
                    <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 overflow-hidden shadow-xs">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400 truncate max-w-full px-1">
                            {businessName || "No Logo"}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-xs">
                          <Upload size={14} />
                          <span>Upload Business Logo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                        {logoUrl && (
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="ml-3 text-xs text-red-500 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        )}
                        <p className="text-[11px] text-slate-400">
                          PNG, JPG, or SVG format under 2MB. Appears on printed receipts and invoices.
                        </p>
                      </div>
                    </div>

                    {/* Row 1: Business Name & Legal Name */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. UltraKey Tech"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Legal / Registered Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UltraKey Technologies Pvt Ltd"
                          value={legalName}
                          onChange={(e) => setLegalName(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Row 2: Email & Phone */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Business Email
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            placeholder="billing@company.com"
                            value={businessEmail}
                            onChange={(e) => setBusinessEmail(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Website & GSTIN */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Website URL
                        </label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="https://example.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          GSTIN / Tax ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 36AAAAA0000A1Z5"
                          value={taxNumber}
                          onChange={(e) => setTaxNumber(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm uppercase font-mono outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Full Address */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Office / Billing Address
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <textarea
                          rows={2}
                          placeholder="Street address, building, suite, or landmark..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none font-mono"
                        />
                      </div>
                    </div>

                    {/* City, State, Postal Code, Country */}
                    <div className="grid gap-4 sm:grid-cols-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="Hyderabad"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="Telangana"
                          value={stateVal}
                          onChange={(e) => setStateVal(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="500001"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Country
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* User Info Overview & Avatar Upload */}
                    <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative group">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-xl font-bold text-white shadow-md overflow-hidden ring-2 ring-indigo-500/20">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <span>{accountName?.charAt(0)?.toUpperCase() || "U"}</span>
                            )}
                          </div>
                          <label
                            htmlFor="user-avatar-file-input"
                            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition cursor-pointer"
                            title="Change Profile Photo"
                          >
                            <Upload size={12} />
                          </label>
                          <input
                            id="user-avatar-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-base">
                              {accountName || "User"}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                              {user?.role || "ADMIN"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {accountEmail || user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <label
                          htmlFor="user-avatar-file-input"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition cursor-pointer"
                        >
                          <Upload size={13} />
                          <span>Upload Photo</span>
                        </label>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Full Name & Email */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Account Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Anil Kumar"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Login Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={accountEmail}
                            onChange={(e) => setAccountEmail(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                      <div className="flex items-center gap-2">
                        <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Change Password (Optional)
                        </h3>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            placeholder="Enter current password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="password"
                              placeholder="Min 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <ShieldCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="password"
                              placeholder="Repeat new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="h-11 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
