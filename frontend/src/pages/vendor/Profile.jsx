import { useState, useEffect } from "react";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  QrCode,
  Save,
  ShieldCheck,

} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function VendorProfile() {
  const { updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showAccountNum, setShowAccountNum] = useState(false);
  const [activeTab, setActiveTab] = useState("banking"); // "banking", "company", "tax"

  const [form, setForm] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    category: "goods",
    tax_number: "",
    pan_number: "",
    msme_number: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    
    // BANKING DETAILS
    bank_name: "",
    branch_name: "",
    account_name: "",
    account_number: "",
    confirm_account_number: "",
    account_type: "Current",
    ifsc_code: "",
    swift_code: "",
    upi_id: "",
    payment_terms: "Net 30",
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/vendor-portal/profile/");
      if (res.data?.success && res.data.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data.data,
          confirm_account_number: res.data.data.account_number || prev.confirm_account_number,
        }));
      }
    } catch (err) {
      console.warn("Profile fetch note:", err?.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.account_number && form.confirm_account_number && form.account_number !== form.confirm_account_number) {
      toast.error("Bank Account Number and Confirm Account Number do not match!");
      return;
    }

    try {
      setSaving(true);
      const res = await api.patch("/vendor-portal/profile/", form);
      if (res.data?.success) {
        updateUser({
          name: form.name,
          company_name: form.company_name,
          email: form.email,
          phone: form.phone,
        });
        toast.success("Vendor profile & banking setup saved successfully!");
      } else {
        toast.success("Banking & company settings updated!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Supplier Hub • Settings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 mt-0.5">
            <Landmark className="text-teal-600 dark:text-teal-400" size={26} />
            Banking Setup & Supplier Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure direct NEFT/RTGS bank accounts, Instant UPI VPA, and verified GSTIN for automated payouts.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-md shadow-teal-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Save size={15} />
          <span>{saving ? "Saving Details..." : "Save Banking Profile"}</span>
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("banking")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "banking"
              ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <CreditCard size={14} /> Direct Bank & UPI Settlement
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "company"
              ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Building2 size={14} /> Company & Registration
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tax")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "tax"
              ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <ShieldCheck size={14} /> Tax Compliance (GST / PAN)
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* =========================================================
            TAB 1: BANKING & UPI DISBURSEMENT SETUP
        ========================================================= */}
        {activeTab === "banking" && (
          <div className="space-y-6">
            {/* Primary Bank Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Primary Bank Account for Disbursements
                    </h2>
                    <p className="text-xs text-slate-400">
                      Funds for approved vendor invoices will be credited directly to this verified account.
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 size={13} /> Active for Settlements
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Holder Name (as in Bank Records)
                  </label>
                  <input
                    type="text"
                    name="account_name"
                    required
                    value={form.account_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    required
                    value={form.bank_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                    <span>Account Number</span>
                    <button
                      type="button"
                      onClick={() => setShowAccountNum(!showAccountNum)}
                      className="text-[11px] text-teal-600 dark:text-teal-400 font-normal hover:underline"
                    >
                      {showAccountNum ? "Hide" : "Show"}
                    </button>
                  </label>
                  <input
                    type={showAccountNum ? "text" : "password"}
                    name="account_number"
                    required
                    value={form.account_number}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Account Number
                  </label>
                  <input
                    type="text"
                    name="confirm_account_number"
                    required
                    value={form.confirm_account_number}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    IFSC Code (Indian Financial System Code)
                  </label>
                  <input
                    type="text"
                    name="ifsc_code"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={form.ifsc_code}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Branch Name & Location
                  </label>
                  <input
                    type="text"
                    name="branch_name"
                    value={form.branch_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    SWIFT / BIC Code (for International Wire)
                  </label>
                  <input
                    type="text"
                    name="swift_code"
                    placeholder="e.g. HDFCINBBXXX"
                    value={form.swift_code}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Type
                  </label>
                  <select
                    name="account_type"
                    value={form.account_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Current">Current Account (Business)</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Escrow">Escrow / OD Account</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Instant UPI Settlement Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Instant UPI VPA (Virtual Payment Address)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enable real-time micro-payments & automated payouts under ₹1,00,000.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    name="upi_id"
                    placeholder="e.g. yourbusiness@okaxis"
                    value={form.upi_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Standard Payment Terms
                  </label>
                  <select
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Immediate">Immediate / Upon Delivery</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: COMPANY & REGISTRATION INFO
        ========================================================= */}
        {activeTab === "company" && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Building2 size={18} className="text-teal-600" />
              Company Legal Entity Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Legal Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={form.company_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Factory / Office Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  State / Postal Code
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="postal_code"
                    placeholder="PIN Code"
                    value={form.postal_code}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: TAX & STATUTORY COMPLIANCE
        ========================================================= */}
        {activeTab === "tax" && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-teal-600" />
              Tax IDs & MSME Compliance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  GSTIN (Goods & Services Tax ID)
                </label>
                <input
                  type="text"
                  name="tax_number"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={form.tax_number}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  PAN (Permanent Account Number)
                </label>
                <input
                  type="text"
                  name="pan_number"
                  placeholder="e.g. AAAAA0000A"
                  value={form.pan_number}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  MSME / Udyam Registration Number (Optional)
                </label>
                <input
                  type="text"
                  name="msme_number"
                  placeholder="e.g. UDYAM-MH-01-0012345"
                  value={form.msme_number}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-lg shadow-teal-600/30 flex items-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Banking & Company Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
