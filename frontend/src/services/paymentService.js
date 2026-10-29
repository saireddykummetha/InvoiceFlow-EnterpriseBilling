import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  createManualPayment,
  createPaymentOrder,
  verifyPayment,
  confirmPayment,
  cleanPendingPayments,
  paymentWebhook,
} from "../api/payments.js";

export const paymentService = {
  getAll: getPayments,
  get: getPayment,
  getById: getPayment,
  create: createPayment,
  update: updatePayment,
  remove: deletePayment,
  delete: deletePayment,
  manual: createManualPayment,
  createOrder: createPaymentOrder,
  verify: verifyPayment,
  confirm: confirmPayment,
  cleanPending: cleanPendingPayments,
  webhook: paymentWebhook,
};

export default paymentService;
