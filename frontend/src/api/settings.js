import api from "./api.js";

// ============================================================
// GET SETTINGS
// ============================================================

export async function getSettings() {
  const response = await api.get("settings/");
  return response.data;
}

// ============================================================
// UPDATE COMPLETE SETTINGS
// ============================================================

export async function updateSettings(data) {
  const response = await api.put("settings/", data);
  return response.data;
}

// ============================================================
// UPDATE ONE SETTINGS SECTION
// ============================================================

export async function updateSettingsSection(section, values) {
  if (!section) {
    throw new Error("Settings section is required.");
  }

  const response = await api.patch("settings/", {
    [section]: values,
  });

  return response.data;
}

export default {
  getSettings,
  updateSettings,
  updateSettingsSection,
};