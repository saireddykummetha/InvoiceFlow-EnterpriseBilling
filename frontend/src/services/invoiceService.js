import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  createInvoiceFromQuote,
  downloadInvoicePdf,
  sendInvoice,
} from "../api/invoices.js";

export const invoiceService = {
  getAll: getInvoices,
  get: getInvoice,
  getById: getInvoice,
  create: createInvoice,
  update: updateInvoice,
  remove: deleteInvoice,
  delete: deleteInvoice,
  fromQuote: createInvoiceFromQuote,
  pdf: downloadInvoicePdf,
  downloadPdf: downloadInvoicePdf,
  send: sendInvoice,
};

export default invoiceService;