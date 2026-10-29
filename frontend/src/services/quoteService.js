import {
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  approveQuote,
  rejectQuote,
  convertToInvoice,
  syncInvoiceFromQuote,
  downloadQuotePdf,
} from "../api/quotes.js";

export const quoteService = {
  getAll: getQuotes,
  get: getQuote,
  getById: getQuote,
  create: createQuote,
  update: updateQuote,
  delete: deleteQuote,
  remove: deleteQuote,
  approve: approveQuote,
  reject: rejectQuote,
  convertToInvoice,
  syncInvoice: syncInvoiceFromQuote,
  pdf: downloadQuotePdf,
  downloadPdf: downloadQuotePdf,
};

export default quoteService;
