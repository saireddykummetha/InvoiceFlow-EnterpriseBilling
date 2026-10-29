import api from "./api.js";

// ============================================================
// GET PROFILE
// ============================================================

export async function getProfile() {
  const response = await api.get("profile/");
  return response.data?.data ?? response.data;
}

// ============================================================
// UPDATE PROFILE
// ============================================================

export async function updateProfile(data) {
  const response = await api.patch("profile/", data);
  return response.data?.data ?? response.data;
}

// ============================================================
// UPLOAD LOGO (FormData, automatic Content-Type multipart)
// ============================================================

export async function uploadLogo(file) {
  if (!file) {
    throw new Error("Logo file is required.");
  }

  const formData = new FormData();
  formData.append("logo", file);

  const response = await api.post("profile/logo/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data ?? response.data;
}

export default {
  getProfile,
  updateProfile,
  uploadLogo,
};