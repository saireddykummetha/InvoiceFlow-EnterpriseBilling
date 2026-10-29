import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient, updateClient} from "../../api/clients";

export default function ClientModal({
  open,
  client = null, // null = Create, object = Edit
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(client?.id || client?._id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Portal Login Credentials State
  const [enablePortalAccess, setEnablePortalAccess] = useState(true);
  const [portalPassword, setPortalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [saving, setSaving] = useState(false);

  const generateRandomPassword = () => {
    const now = Date.now();
    const digits = String(now).slice(-4);
    return `Client#${digits}!`;
  };

  useEffect(() => {
    if (open) {
      setCreatedCredentials(null);
      setCopiedCreds(false);
      if (client) {
        setName(client.name || client.client_name || "");
        setEmail(client.email || "");
        setPhone(client.phone || "");
        setCompany(client.company || client.company_name || "");
        setGstin(client.gstin || client.tax_number || "");
        setAddress(client.address || client.street || "");
        setCity(client.city || "");
        setStateVal(client.state || "");
        setPostalCode(client.postal_code || client.zip || "");
        setCountry(client.country || "India");
        setNotes(client.notes || "");
        setIsActive(
          client.is_active !== false &&
          String(client.status || "").toLowerCase() !== "inactive"
        );
        setEnablePortalAccess(Boolean(client.email));
        setPortalPassword("");
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setGstin("");
        setAddress("");
        setCity("");
        setStateVal("");
        setPostalCode("");
        setCountry("India");
        setNotes("");
        setIsActive(true);
        setEnablePortalAccess(true);
        setPortalPassword(generateRandomPassword());
      }
    }
  }, [open, client]);

  const handleCopyCredentials = (creds) => {
    const loginUrl = `${window.location.origin}/login`;
    const text = `Client Portal Login Details:\nPortal URL: ${loginUrl} (Select Client tab)\nEmail: ${creds.email}\nPassword: ${creds.password}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    toast.success("Login credentials copied to clipboard!");
    setTimeout(() => setCopiedCreds(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a client name");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company_name: company.trim() || name.trim(),
        gstin: gstin.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateVal.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
        notes: notes.trim(),
        is_active: isActive,
        status: isActive ? "active" : "inactive",
        create_portal_access: enablePortalAccess && Boolean(email.trim()),
        password: portalPassword.trim(),
      };

      let result;
      if (isEdit) {
        result = await updateClient(client.id || client._id, payload);
        toast.success("Client updated successfully");
      } else {
        result = await createClient(payload);
        toast.success("Client created successfully");
      }

      const clientData = result?.data || result;
      const genCreds = clientData?.generated_credentials;

      if (genCreds && genCreds.password) {
        setCreatedCredentials(genCreds);
      } else if (portalPassword.trim() && email.trim()) {
        setCreatedCredentials({
          email: email.trim(),
          password: portalPassword.trim(),
        });
      } else {
        onSuccess?.(clientData);
        onClose?.();
      }
    } catch (err) {
      console.error("Save client error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.name?.[0] ||
        `Unable to ${isEdit ? "update" : "create"} client`;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="client-modal-overlay"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
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
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isEdit ? `Edit Client: ${client?.name || ""}` : "Add New Client"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isEdit ? "Update client contact details and portal credentials" : "Create client and generate login password for the Client Portal"}
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

            {/* If Credentials Success View */}
            {createdCredentials ? (
              <div className="p-8 text-center space-y-6 flex-1 overflow-y-auto">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck size={32} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Client Portal Access Ready!
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    The client has been registered in the system. They can immediately log into the <strong>Client Portal</strong> using the credentials below:
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 text-left space-y-3 max-w-md mx-auto dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs font-bold uppercase text-slate-400">Portal URL</span>
                    <span className="font-semibold text-indigo-600">/login (Client tab)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs font-bold uppercase text-slate-400">Login Email</span>
                    <span className="font-bold text-slate-900 dark:text-white">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs font-bold uppercase text-slate-400">Login Password</span>
                    <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-emerald-600 dark:bg-slate-900 dark:border-slate-600">
                      {createdCredentials.password}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(createdCredentials)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
                  >
                    {copiedCreds ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCreds ? "Copied!" : "Copy Login Info"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSuccess?.();
                      onClose?.();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Form Content */
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Row 1: Name & Company */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Company / Organization
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email & Phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address <span className="text-indigo-600">(Used for Client Portal Login)</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="client@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                {/* Client Portal Credentials Setup */}
                {email.trim() && (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound size={16} className="text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                          Client Portal Login Credentials
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPortalPassword(generateRandomPassword())}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <RefreshCw size={12} />
                        Generate Password
                      </button>
                    </div>

                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter or generate login password for client"
                        value={portalPassword}
                        onChange={(e) => setPortalPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-24 rounded-xl border border-indigo-200 bg-white text-sm font-mono outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      💡 The client can immediately sign into the portal using <strong>{email.trim()}</strong> and this password. No separate signup needed.
                    </p>
                  </div>
                )}

                {/* Row 3: Address & GSTIN */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Billing Address
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Street, area, building..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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
                      placeholder="22AAAAA0000A1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 4: City, State, Postal */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Telangana"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 5: Notes & Status */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Internal Notes
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes or special instructions..."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="client-active-toggle"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="client-active-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                      Client account is Active (eligible for new invoices and quotes)
                    </label>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-md shadow-slate-950/20 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving
                      ? isEdit
                        ? "Updating..."
                        : "Saving..."
                      : isEdit
                      ? "Update Client"
                      : "Save Client"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
