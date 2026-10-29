import api from "./api";

export const getProjects = async (params = {}) => {
  const response = await api.get("projects/", { params });
  return response.data;
};

export const getProjectStats = async () => {
  const response = await api.get("projects/stats/");
  return response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`projects/${id}/`);
  return response.data;
};

export const createProject = async (data) => {
  const response = await api.post("projects/", data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await api.patch(`projects/${id}/`, data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`projects/${id}/`);
  return response.data;
};

export const assignVendorToProject = async (projectId, data) => {
  const response = await api.post(`projects/${projectId}/assign-vendor/`, data);
  return response.data;
};

export const removeVendorFromProject = async (projectId, vendorId) => {
  const response = await api.delete(`projects/${projectId}/remove-vendor/${vendorId}/`);
  return response.data;
};
