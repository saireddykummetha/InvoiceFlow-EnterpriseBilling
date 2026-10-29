import { useCallback, useEffect, useState } from "react";
import {
  getPayments,
  getPayment,
  createPayment as apiCreatePayment,
  updatePayment as apiUpdatePayment,
  deletePayment as apiDeletePayment,
  createManualPayment as apiCreateManualPayment,
  createPaymentOrder as apiCreatePaymentOrder,
  verifyPayment as apiVerifyPayment,
} from "../api/payments.js";

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPayments = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPayments(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setPayments(normalized);
      return normalized;
    } catch (err) {
      console.error("Load payments error:", err);
      setPayments([]);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load payments"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPayment = useCallback(async (id) => {
    if (!id) {
      setPayment(null);
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getPayment(id);
      setPayment(data);
      return data;
    } catch (err) {
      console.error("Load payment error:", err);
      setPayment(null);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load payment"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const createPayment = async (data) => {
    const created = await apiCreatePayment(data);
    setPayments((prev) => [created, ...prev]);
    return created;
  };

  const manualPayment = async (data) => {
    const created = await apiCreateManualPayment(data);
    setPayments((prev) => [created, ...prev]);
    return created;
  };

  const updatePayment = async (id, data) => {
    const updated = await apiUpdatePayment(id, data);
    setPayment(updated);
    setPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  const deletePayment = async (id) => {
    await apiDeletePayment(id);
    setPayments((prev) => prev.filter((item) => item.id !== id));
    if (payment?.id === id) {
      setPayment(null);
    }
  };

  const createOrder = async (data) => {
    return apiCreatePaymentOrder(data);
  };

  const verify = async (data) => {
    return apiVerifyPayment(data);
  };

  return {
    payments,
    payment,
    loading,
    error,
    loadPayments,
    loadPayment,
    createPayment,
    manualPayment,
    updatePayment,
    deletePayment,
    createOrder,
    verify,
    reload: loadPayments,
  };
}