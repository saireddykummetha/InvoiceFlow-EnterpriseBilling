import api from "./api";

export const getClientDashboard = async () => {
  const response = await api.get("client-portal/dashboard/");
  return response.data;
};

export const getClientProjects = async () => {
  const response = await api.get("client-portal/projects/");
  return response.data;
};

export const getClientApprovals = async () => {
  const response = await api.get("client-portal/approvals/");
  return response.data;
};
