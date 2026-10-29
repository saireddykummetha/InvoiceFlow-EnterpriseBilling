import api from "../api/api.js";

const emailService = {
  // POST /api/invoices/:id/send/
  sendInvoice: async (invoiceId) => {
    const response = await api.post(`/invoices/${invoiceId}/send/`);
    return response.data;
  },
};

export default emailService;
