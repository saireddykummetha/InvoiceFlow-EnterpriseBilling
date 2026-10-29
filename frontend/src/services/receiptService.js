import {
  getReceipts,
  getReceipt,
  downloadReceiptPdf,
} from "../api/receipts.js";

export const receiptService = {
  getAll: getReceipts,
  get: getReceipt,
  getById: getReceipt,
  pdf: downloadReceiptPdf,
  downloadPdf: downloadReceiptPdf,
};

export default receiptService;
