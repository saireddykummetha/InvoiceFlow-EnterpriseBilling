import api from "../api/api.js";

const pdfService = {
  // GET /api/invoices/:id/pdf/
  downloadInvoice: async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}/pdf/`, {
      responseType: "blob",
    });
    return response.data;
  },

  // GET /api/receipts/:id/pdf/
  downloadReceipt: async (receiptId) => {
    const response = await api.get(`/receipts/${receiptId}/pdf/`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Open invoice PDF in new tab with authentication
  openInvoicePdf: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf/`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Open invoice PDF error:", err);
    }
  },

  // Open receipt PDF in new tab with authentication
  openReceiptPdf: async (receiptId) => {
    try {
      const response = await api.get(`/receipts/${receiptId}/pdf/`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Open receipt PDF error:", err);
    }
  },
};

export default pdfService;
