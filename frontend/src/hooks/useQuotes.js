import { useCallback, useEffect, useState } from "react";
import {
  getQuotes,
  getQuote,
  createQuote as apiCreateQuote,
  updateQuote as apiUpdateQuote,
  deleteQuote as apiDeleteQuote,
  approveQuote as apiApproveQuote,
  rejectQuote as apiRejectQuote,
  convertToInvoice as apiConvertToInvoice,
} from "../api/quotes.js";

export default function useQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQuotes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuotes(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setQuotes(normalized);
      return normalized;
    } catch (err) {
      console.error("Load quotes error:", err);
      setQuotes([]);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load quotes"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuote = useCallback(async (id) => {
    if (!id) {
      setQuote(null);
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getQuote(id);
      setQuote(data);
      return data;
    } catch (err) {
      console.error("Load quote error:", err);
      setQuote(null);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load quote"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const createQuote = async (data) => {
    const created = await apiCreateQuote(data);
    setQuotes((prev) => [created, ...prev]);
    return created;
  };

  const updateQuote = async (id, data) => {
    const updated = await apiUpdateQuote(id, data);
    setQuote(updated);
    setQuotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  const deleteQuote = async (id) => {
    await apiDeleteQuote(id);
    setQuotes((prev) => prev.filter((item) => item.id !== id));
    if (quote?.id === id) {
      setQuote(null);
    }
  };

  const approveQuote = async (id) => {
    const updated = await apiApproveQuote(id);
    setQuotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    if (quote?.id === id) setQuote(updated);
    return updated;
  };

  const rejectQuote = async (id) => {
    const updated = await apiRejectQuote(id);
    setQuotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    if (quote?.id === id) setQuote(updated);
    return updated;
  };

  const convertToInvoice = async (id) => {
    return apiConvertToInvoice(id);
  };

  return {
    quotes,
    quote,
    loading,
    error,
    loadQuotes,
    loadQuote,
    createQuote,
    updateQuote,
    deleteQuote,
    approveQuote,
    rejectQuote,
    convertToInvoice,
    reload: loadQuotes,
  };
}