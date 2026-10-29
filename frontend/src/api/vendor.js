import api from "./api";

export const getVendorDashboard = async () => {
  const response = await api.get("vendor-portal/dashboard/");
  return response.data;
};

export const getVendorOrders = async () => {
  const response = await api.get("vendor-portal/orders/");
  return response.data;
};

export const getVendorInvoices = async () => {
  const response = await api.get("vendor-portal/invoices/");
  return response.data;
};

export const getVendorPayments = async () => {
  const response = await api.get("vendor-portal/payments/");
  return response.data;
};

export const getVendorProfile = async () => {
  const response = await api.get("vendor-portal/profile/");
  return response.data;
};

export const updateVendorProfile = async (data) => {
  const response = await api.put("vendor-portal/profile/", data);
  return response.data;
};
