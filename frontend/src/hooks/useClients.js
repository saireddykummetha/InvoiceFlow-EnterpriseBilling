import { useCallback, useEffect, useState } from "react";
import {
  getClients,
  getClient,
  createClient as apiCreateClient,
  updateClient as apiUpdateClient,
  deleteClient as apiDeleteClient,
} from "../api/clients.js";

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClients(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setClients(normalized);
      return normalized;
    } catch (err) {
      console.error("Load clients error:", err);
      setClients([]);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load clients"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClient = useCallback(async (id) => {
    if (!id) {
      setClient(null);
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getClient(id);
      setClient(data);
      return data;
    } catch (err) {
      console.error("Load client error:", err);
      setClient(null);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load client"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const createClient = async (data) => {
    const created = await apiCreateClient(data);
    setClients((prev) => [created, ...prev]);
    return created;
  };

  const updateClient = async (id, data) => {
    const updated = await apiUpdateClient(id, data);
    setClient(updated);
    setClients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  const deleteClient = async (id) => {
    await apiDeleteClient(id);
    setClients((prev) => prev.filter((item) => item.id !== id));
    if (client?.id === id) {
      setClient(null);
    }
  };

  return {
    clients,
    client,
    loading,
    error,
    loadClients,
    loadClient,
    createClient,
    updateClient,
    deleteClient,
    reload: loadClients,
  };
}