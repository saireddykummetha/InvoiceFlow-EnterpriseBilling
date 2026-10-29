import {
  getProfile,
  updateProfile,
  uploadLogo,
} from "../api/profile.js";

export const profileService = {
  get: getProfile,
  update: updateProfile,
  uploadLogo,
};

export default profileService;
