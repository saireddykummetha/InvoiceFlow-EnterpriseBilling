import {
  getSettings,
  updateSettings,
  updateSettingsSection,
} from "../api/settings.js";

export const settingsService = {
  get: getSettings,
  update: updateSettings,
  updateSection: updateSettingsSection,
};

export default settingsService;