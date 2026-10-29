import { useCallback, useEffect, useState } from "react";
import {
  getInvoices,
  getInvoice,
  createInvoice as apiCreateInvoice,
  updateInvoice as apiUpdateInvoice,
  deleteInvoice as apiDeleteInvoice,
  createInvoiceFromQuote as apiCreateInvoiceFromQuote,
  downloadInvoicePdf as apiDownloadInvoicePdf,
  sendInvoice as apiSendInvoice,
} from "../api/invoices.js";

export default function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInvoices = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoices(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setInvoices(normalized);
      return normalized;
    } catch (err) {
      console.error("Load invoices error:", err);
      setInvoices([]);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load invoices"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvoice = useCallback(async (id) => {
    if (!id) {
      setInvoice(null);
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoice(id);
      setInvoice(data);
      return data;
    } catch (err) {
      console.error("Load invoice error:", err);
      setInvoice(null);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load invoice"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const createInvoice = async (data) => {
    const created = await apiCreateInvoice(data);
    setInvoices((prev) => [created, ...prev]);
    return created;
  };

  const updateInvoice = async (id, data) => {
    const updated = await apiUpdateInvoice(id, data);
    setInvoice(updated);
    setInvoices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  const deleteInvoice = async (id) => {
    await apiDeleteInvoice(id);
    setInvoices((prev) => prev.filter((item) => item.id !== id));
    if (invoice?.id === id) {
      setInvoice(null);
    }
  };

  const fromQuote = async (quoteId) => {
    const created = await apiCreateInvoiceFromQuote(quoteId);
    setInvoices((prev) => [created, ...prev]);
    return created;
  };

  const downloadPdf = async (id, filename) => {
    return apiDownloadInvoicePdf(id, filename);
  };

  const send = async (id, data) => {
    return apiSendInvoice(id, data);
  };

  return {
    invoices,
    invoice,
    loading,
    error,
    loadInvoices,
    loadInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    fromQuote,
    downloadPdf,
    send,
    reload: loadInvoices,
  };
}