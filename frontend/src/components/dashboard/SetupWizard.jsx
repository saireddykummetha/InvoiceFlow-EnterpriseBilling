import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Settings, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../common/Button";
import Input from "../common/Input";
import useSettings from "../../hooks/useSettings";

export default function SetupWizard() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    currency: "INR",
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If settings are loaded and company name is empty, it's a first-time user
    if (!settingsLoading && settings && !settings?.business?.companyName) {
      setIsOpen(true);
    }
  }, [settings, settingsLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    try {
      setSaving(true);
      
      await updateSettings("business", {
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
      });
      
      await updateSettings("general", {
        currency: form.currency,
      });

      toast.success("Initial setup complete!");
      setIsOpen(false);
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("Unable to save setup data");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="bg-slate-900 px-8 py-10 text-center text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <Settings size={150} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Building2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Welcome to UltraKey!
              </h2>
              <p className="mt-2 text-slate-300">
                Let's set up your business profile to get started.
              </p>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-5">
              <Input
                label="Company Name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Enter your business name"
                required
                icon={Building2}
              />
              
              <Input
                label="Business Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@yourbusiness.com"
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Your contact number"
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  loading={saving}
                >
                  <span>Complete Setup</span>
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
