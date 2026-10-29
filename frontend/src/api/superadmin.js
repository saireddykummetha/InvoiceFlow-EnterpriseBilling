import api from "./api";

export const getSuperAdminStats = async () => {
  const response = await api.get("superadmin/stats/");
  return response.data;
};

export const getSuperAdminTenants = async (params = {}) => {
  const response = await api.get("superadmin/tenants/", { params });
  return response.data;
};

export const getSuperAdminUsers = async (params = {}) => {
  const response = await api.get("superadmin/users/", { params });
  return response.data;
};

export const updateSuperAdminUser = async (data) => {
  const response = await api.patch("superadmin/users/", data);
  return response.data;
};

export const getSuperAdminHealth = async () => {
  const response = await api.get("superadmin/health/");
  return response.data;
};
