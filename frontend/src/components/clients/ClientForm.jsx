import { useEffect, useState } from "react";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";

import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const EMPTY_FORM = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  gstin: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  status: "active",
  notes: "",
};

const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Kerala",
  "Delhi",
  "Gujarat",
  "West Bengal",
  "Other",
];

export default function ClientForm({
  initialData,
  initial,
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Save client",
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const source = initialData || initial;
    if (source) {
      setForm({
        ...EMPTY_FORM,
        ...source,
        // Normalize: backend uses company_name, frontend may receive either
        company_name: source.company_name || source.company || "",
        // status field: backend uses is_active boolean, map to active/inactive
        status: source.is_active === false ? "inactive" : (source.status || "active"),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData, initial]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Per-field specific toast messages
    if (!form.name.trim()) {
      toast.error("⚠️ Client Name is required. Please enter the client's name.");
      setErrors((e) => ({ ...e, name: "Client name is required." }));
      return;
    }
    if (!form.email.trim()) {
      toast.error("⚠️ Email Address is required. Please enter a valid email.");
      setErrors((e) => ({ ...e, email: "Email is required." }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("⚠️ Email Address is not valid. Please enter a correct email (e.g. name@example.com).");
      setErrors((e) => ({ ...e, email: "Enter a valid email." }));
      return;
    }
    if (!form.phone.trim()) {
      toast.error("⚠️ Phone Number is required. Please enter a contact number.");
      setErrors((e) => ({ ...e, phone: "Phone number is required." }));
      return;
    }

    // Build the payload that matches backend field names
    const payload = {
      name: form.name.trim(),
      company_name: form.company_name || "",
      email: form.email.trim(),
      phone: form.phone.trim(),
      gstin: form.gstin || "",
      address: form.address || "",
      notes: form.notes || "",
      is_active: form.status !== "inactive",
    };

    setErrors({});

    try {
      await onSubmit?.(payload);
    } catch (error) {
      toast.error(error?.message || "Unable to save client.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BASIC INFORMATION */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Basic information</h2>
          <p className="mt-1 text-xs text-slate-400">Add the primary customer information.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Client name *"
            name="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter client name"
            required
            error={errors.name}
            icon={Building2}
          />

          <Input
            label="Company"
            name="company_name"
            value={form.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            placeholder="Company name"
            icon={Building2}
          />

          <Input
            label="Email *"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="client@example.com"
            required
            error={errors.email}
            icon={Mail}
          />

          <Input
            label="Phone *"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+91 98765 43210"
            required
            error={errors.phone}
            icon={Phone}
          />

          <Input
            label="GSTIN"
            name="gstin"
            value={form.gstin}
            onChange={(e) => update("gstin", e.target.value.toUpperCase())}
            placeholder="22AAAAA0000A1Z5"
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </section>

      {/* ADDRESS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Address</h2>
          <p className="mt-1 text-xs text-slate-400">Customer billing and business address.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Address"
            name="address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street, building, area"
            icon={MapPin}
            className="md:col-span-2"
          />

          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Hyderabad"
          />

          <Select
            label="State"
            name="state"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            options={STATE_OPTIONS}
            placeholder="Select state"
          />

          <Input
            label="Postal code"
            name="postalCode"
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            placeholder="500001"
          />

          <Input
            label="Country"
            name="country"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="India"
          />
        </div>
      </section>

      {/* NOTES */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">Additional notes</h2>
          <p className="mt-1 text-xs text-slate-400">Optional internal notes about this client.</p>
        </div>

        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={5}
          placeholder="Add internal notes..."
          className="input-base min-h-[130px] resize-y"
        />
      </section>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
}
