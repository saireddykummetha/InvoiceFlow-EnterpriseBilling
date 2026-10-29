import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  Sparkles,
  Layers,
  CreditCard,
  Mail,
  Bell,
  Lock,
  Database,
  Save,
  Send,
  CheckCircle2,
  RefreshCw,
  Shield,

} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function SuperAdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [activeTab, setActiveTab] = useState("platform");

  const [settings, setSettings] = useState({
    platform: {
      platform_name: "Enterprise Multi-Tenant SaaS Platform",
      logo_url: "",
      favicon_url: "",
      support_email: "support@system.io",
      support_phone: "+1 800 555 0199",
      default_currency: "USD",
      default_timezone: "UTC",
      date_format: "YYYY-MM-DD",
      platform_description: "Comprehensive multi-tenant business and project workspace management.",
    },
    free_trial: {
      trial_enabled: true,
      trial_limit: 5,
      trial_type: "PROJECTS",
      action_after_limit: "REQUIRE_UPGRADE",
      trial_active_businesses: 0,
      trial_exhausted_businesses: 0,
    },
    subscription_plans: {
      STARTER: { name: "Starter", price: 29, max_projects: 20, max_users: 10, is_active: true },
      PROFESSIONAL: { name: "Professional", price: 79, max_projects: 100, max_users: 50, is_active: true },
      ENTERPRISE: { name: "Enterprise", price: 199, max_projects: 500, max_users: 200, is_active: true },
    },
    payment_billing: {
      platform_payment_gateway: "Razorpay / Stripe",
      merchant_account_status: "Connected & Active",
      settlement_status: "Operational",
      billing_currency: "USD",
      webhook_status: "Live (200 OK)",
    },
    email_smtp: {
      smtp_provider: "SendGrid / Custom SMTP",
      smtp_host: "smtp.sendgrid.net",
      smtp_port: 587,
      smtp_username: "apikey",
      from_email: "no-reply@system.io",
      from_name: "Platform System Notifications",
      smtp_encryption: "TLS",
    },
    notifications: {
      new_business: { in_app: true, email: true },
      trial_exhausted: { in_app: true, email: true },
      subscription_upgrade: { in_app: true, email: true },
      subscription_payment: { in_app: true, email: true },
      payment_failure: { in_app: true, email: true },
      business_suspended: { in_app: true, email: true },
      security_events: { in_app: true, email: true },
    },
    security_access: {
      min_password_length: 8,
      require_special_char: true,
      session_timeout_minutes: 120,
      login_attempt_limit: 5,
      invitation_expiry_days: 7,
      enforce_mfa: false,
    },
    system_defaults: {
      default_business_currency: "USD",
      default_business_timezone: "UTC",
      default_business_plan: "FREE_TRIAL",
      default_business_status: "active",
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/settings/");
      if (res.data?.success && res.data.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Failed to load platform settings from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch("/superadmin/settings/", settings);
      if (res.data?.success) {
        toast.success(res.data.message || "Global platform settings saved successfully!");
        fetchSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update platform settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error("Please enter a destination email address.");
      return;
    }
    try {
      setSendingTestEmail(true);
      const res = await api.post("/superadmin/settings/test-email/", {
        email: testEmailAddress,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Test email dispatched successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch test email.");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const TABS = [
    { id: "platform", label: "Platform & Branding", icon: Globe },
    { id: "free_trial", label: "Free Trial", icon: Sparkles },
    { id: "plans", label: "Subscription Plans", icon: Layers },
    { id: "payment", label: "Payment & Platform Billing", icon: CreditCard },
    { id: "smtp", label: "Email / SMTP", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Access", icon: Lock },
    { id: "defaults", label: "System Defaults", icon: Database },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="animate-spin text-purple-600" size={22} />
          <span className="text-sm font-semibold">Loading Global Platform Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              SUPER ADMIN • PLATFORM SETTINGS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Settings className="text-purple-600 dark:text-purple-400" size={24} />
            Global Platform Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control platform branding, 5-project trial rules, SaaS tiers, merchant gateway, email, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSettings}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Reload settings"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS (8 SECTIONS) */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 scrollbar-thin">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. SETTINGS SECTIONS */}
      <div className="space-y-6">
        {/* TAB 1: PLATFORM & BRANDING */}
        {activeTab === "platform" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="text-purple-600" size={18} />
                Platform Identity & Branding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Global brand metadata, support channels, and presentation formats across the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Name *</label>
                <input
                  type="text"
                  value={settings.platform.platform_name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, platform_name: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Support Email *</label>
                <input
                  type="email"
                  value={settings.platform.support_email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, support_email: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={settings.platform.support_phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, support_phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Currency</label>
                <select
                  value={settings.platform.default_currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, default_currency: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Timezone</label>
                <input
                  type="text"
                  value={settings.platform.default_timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, default_timezone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
                <select
                  value={settings.platform.date_format}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, date_format: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-29)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (29/08/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (08/29/2026)</option>
                  <option value="DD MMM YYYY">DD MMM YYYY (29 Aug 2026)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Description</label>
                <textarea
                  rows={2}
                  value={settings.platform.platform_description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, platform_description: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FREE TRIAL */}
        {activeTab === "free_trial" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} />
                5-Project Free Trial Business Rule
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every newly provisioned Business receives an automatic Free Trial allowance strictly based on project creation.
              </p>
            </div>

            {/* LIVE TRIAL USAGE METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-[11px] font-semibold text-slate-500">Active Free Trial Businesses</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {settings.free_trial.trial_active_businesses}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Currently operating under the 5-project free allowance</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-[11px] font-semibold text-slate-500">Trial Exhausted Businesses</span>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {settings.free_trial.trial_exhausted_businesses}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">5/5 projects reached — upgrading to paid tier required</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Trial Enabled</label>
                <select
                  value={settings.free_trial.trial_enabled ? "true" : "false"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_trial: { ...settings.free_trial, trial_enabled: e.target.value === "true" },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="true">Enabled (Auto-assigned to all new tenants)</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Trial Limit (Projects) *</label>
                <input
                  type="number"
                  min={1}
                  value={settings.free_trial.trial_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_trial: { ...settings.free_trial, trial_limit: Number(e.target.value) },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">Default: 5 projects per newly registered business.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Trial Metric Type</label>
                <input
                  type="text"
                  readOnly
                  value="PROJECTS (Creation Quota)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Action After Limit Reached</label>
                <select
                  value={settings.free_trial.action_after_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_trial: { ...settings.free_trial, action_after_limit: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="REQUIRE_UPGRADE">REQUIRE_UPGRADE (Block project 6 until paid plan)</option>
                  <option value="NOTIFY_ONLY">NOTIFY_ONLY (Soft limit)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PLANS */}
        {activeTab === "plans" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="text-blue-600" size={18} />
                Commercial SaaS Subscription Tiers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure pricing, quotas, and active status for Starter, Professional, and Enterprise plans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((key) => {
                const plan = settings.subscription_plans[key] || {
                  name: key,
                  price: 0,
                  max_projects: 0,
                  max_users: 0,
                  is_active: true,
                };

                return (
                  <div
                    key={key}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                        {plan.name || key}
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.is_active}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              subscription_plans: {
                                ...settings.subscription_plans,
                                [key]: { ...plan, is_active: e.target.checked },
                              },
                            });
                          }}
                          className="h-3.5 w-3.5 accent-purple-600 rounded"
                        />
                        <span className="text-[10px] font-semibold text-slate-500">Active</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Monthly Price ($)</label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            subscription_plans: {
                              ...settings.subscription_plans,
                              [key]: { ...plan, price: Number(e.target.value) },
                            },
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Max Projects</label>
                      <input
                        type="number"
                        value={plan.max_projects}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            subscription_plans: {
                              ...settings.subscription_plans,
                              [key]: { ...plan, max_projects: Number(e.target.value) },
                            },
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Max Team Users</label>
                      <input
                        type="number"
                        value={plan.max_users}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            subscription_plans: {
                              ...settings.subscription_plans,
                              [key]: { ...plan, max_users: Number(e.target.value) },
                            },
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT & PLATFORM BILLING */}
        {activeTab === "payment" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="text-purple-600" size={18} />
                Platform SaaS Payment & Billing Gateway
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Collects subscription revenues from Business Admins into the platform company account.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs text-purple-900 dark:text-purple-200">
              ℹ️ <strong>Financial Architecture Note:</strong> Subscription payments from Business Admins flow through the platform gateway into the platform merchant treasury. Client project payments flow directly into the respective Business/Tenant's invoice accounts.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-400 text-[11px] font-semibold">Payment Gateway Integration</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {settings.payment_billing.platform_payment_gateway}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> {settings.payment_billing.merchant_account_status}
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-400 text-[11px] font-semibold">Platform Settlement Account</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Platform Corporate Treasury (Verified)
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  <Shield size={11} /> Automated ACH/NEFT Routing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Currency</label>
                <select
                  value={settings.payment_billing.billing_currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment_billing: { ...settings.payment_billing, billing_currency: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Webhook Telemetry Status</label>
                <input
                  type="text"
                  readOnly
                  value={settings.payment_billing.webhook_status}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 text-emerald-600 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EMAIL / SMTP */}
        {activeTab === "smtp" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="text-cyan-600" size={18} />
                Email / SMTP Platform Service
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used for platform admin invites, password resets, trial exhaustion alerts, and subscription receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SMTP Provider</label>
                <input
                  type="text"
                  value={settings.email_smtp.smtp_provider}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_smtp: { ...settings.email_smtp, smtp_provider: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email_smtp.smtp_host}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_smtp: { ...settings.email_smtp, smtp_host: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={settings.email_smtp.smtp_port}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_smtp: { ...settings.email_smtp, smtp_port: Number(e.target.value) },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Encryption</label>
                <select
                  value={settings.email_smtp.smtp_encryption}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_smtp: { ...settings.email_smtp, smtp_encryption: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="TLS">TLS (Recommended)</option>
                  <option value="SSL">SSL</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">From Sender Email</label>
                <input
                  type="email"
                  value={settings.email_smtp.from_email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_smtp: { ...settings.email_smtp, from_email: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">From Sender Name</label>
                <input
                  type="text"
                  value={settings.email_smtp.from_name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_smtp: { ...settings.email_smtp, from_name: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* TEST EMAIL DIAGNOSTIC TRIGGER */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="w-full sm:w-2/3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Test SMTP Dispatch</label>
                <input
                  type="email"
                  placeholder="Enter email to receive test diagnostic..."
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-cyan-500 transition disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                {sendingTestEmail ? "Sending Test..." : "Send Test Email"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="text-indigo-600" size={18} />
                Platform Notification Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure which global platform events trigger in-app system notifications and email alerts.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: "new_business", label: "New Business Workspace Registered" },
                { key: "trial_exhausted", label: "Tenant Free Trial Limit Exhausted (5/5 Projects)" },
                { key: "subscription_upgrade", label: "Subscription Plan Upgraded by Tenant" },
                { key: "subscription_payment", label: "Platform Subscription Payment Succeeded" },
                { key: "payment_failure", label: "Subscription Payment Failed" },
                { key: "business_suspended", label: "Business Workspace Suspended / Reactivated" },
                { key: "security_events", label: "Platform Security Audit & Login Alerts" },
              ].map((ev) => {
                const conf = settings.notifications[ev.key] || { in_app: true, email: true };

                return (
                  <div
                    key={ev.key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-3"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ev.label}</span>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={conf.in_app}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                [ev.key]: { ...conf, in_app: e.target.checked },
                              },
                            });
                          }}
                          className="h-4 w-4 accent-purple-600 rounded"
                        />
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">In-App</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={conf.email}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                [ev.key]: { ...conf, email: e.target.checked },
                              },
                            });
                          }}
                          className="h-4 w-4 accent-purple-600 rounded"
                        />
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">Email Alert</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: SECURITY & ACCESS */}
        {activeTab === "security" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="text-rose-600" size={18} />
                Platform Security & Access Policies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enforce authentication guardrails, session lifespans, and account security thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Password Length (Chars)
                </label>
                <input
                  type="number"
                  min={6}
                  value={settings.security_access.min_password_length}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security_access: {
                        ...settings.security_access,
                        min_password_length: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  value={settings.security_access.session_timeout_minutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security_access: {
                        ...settings.security_access,
                        session_timeout_minutes: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Login Attempt Lockout Limit
                </label>
                <input
                  type="number"
                  min={3}
                  value={settings.security_access.login_attempt_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security_access: {
                        ...settings.security_access,
                        login_attempt_limit: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invitation Token Expiry (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={settings.security_access.invitation_expiry_days}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security_access: {
                        ...settings.security_access,
                        invitation_expiry_days: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Require Special Characters & Numbers</p>
                  <p className="text-slate-400 text-[11px]">Enforce complex passwords for Admin and Super Admin users</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security_access.require_special_char}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security_access: {
                        ...settings.security_access,
                        require_special_char: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 accent-purple-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Enforce Multi-Factor Authentication (MFA)</p>
                  <p className="text-slate-400 text-[11px]">Require OTP verification upon signing into platform accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security_access.enforce_mfa}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security_access: {
                        ...settings.security_access,
                        enforce_mfa: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 accent-purple-600 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 8: SYSTEM DEFAULTS */}
        {activeTab === "defaults" && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="text-emerald-600" size={18} />
                System Defaults for New Business Workspaces
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preset configuration automatically applied when new tenants are provisioned.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Business Currency</label>
                <select
                  value={settings.system_defaults.default_business_currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      system_defaults: {
                        ...settings.system_defaults,
                        default_business_currency: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Business Timezone</label>
                <input
                  type="text"
                  value={settings.system_defaults.default_business_timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      system_defaults: {
                        ...settings.system_defaults,
                        default_business_timezone: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Subscription Plan</label>
                <input
                  type="text"
                  readOnly
                  value="FREE_TRIAL (5 Projects Limit)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Initial Status</label>
                <select
                  value={settings.system_defaults.default_business_status}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      system_defaults: {
                        ...settings.system_defaults,
                        default_business_status: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-slate-900 dark:text-white"
                >
                  <option value="active">Active (Immediate access)</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
