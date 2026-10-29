import { useCallback, useEffect, useState } from "react";
import {
  getReportDashboard,
  getSalesReport,
  getPaymentsReport,
  getTaxReport,
  getClientsReport,
  getProfitLossReport,
} from "../api/reports.js";

export default function useReports(initialYear = new Date().getFullYear()) {
  const [year, setYear] = useState(initialYear);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [clientsData, setClientsData] = useState(null);
  const [profitLossData, setProfitLossData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async (selectedYear = year) => {
    try {
      setLoading(true);
      setError(null);
      const params = typeof selectedYear === "object" ? selectedYear : { year: selectedYear };
      const [dash, sales, pay, tax, clients, pl] = await Promise.allSettled([
        getReportDashboard(params),
        getSalesReport(params),
        getPaymentsReport(params),
        getTaxReport(params),
        getClientsReport(),
        getProfitLossReport(params),
      ]);

      if (dash.status === "fulfilled") setDashboardData(dash.value);
      if (sales.status === "fulfilled") setSalesData(sales.value);
      if (pay.status === "fulfilled") setPaymentsData(pay.value);
      if (tax.status === "fulfilled") setTaxData(tax.value);
      if (clients.status === "fulfilled") setClientsData(clients.value);
      if (pl.status === "fulfilled") setProfitLossData(pl.value);
    } catch (err) {
      console.error("Load reports error:", err);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load reports"
      );
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadAll(year);
  }, [year, loadAll]);

  return {
    year,
    setYear,
    dashboard: dashboardData,
    dashboardData,
    salesData,
    paymentsData,
    taxData,
    clientsData,
    profitLossData,
    loading,
    error,
    loadDashboard: loadAll,
    reload: loadAll,
  };
}