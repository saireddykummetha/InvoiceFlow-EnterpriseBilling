import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Search,
  Receipt,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import useSettings from "../../hooks/useSettings";

export default function Invoices() {
  const { formatCurrency } = useSettings();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadInvoices = async () => {
    try {
      const response = await api.get("/invoices/");
      const data = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data?.results)
        ? response.data.results
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setInvoices(data.map((inv) => ({ ...inv, id: inv.id || inv._id })));
    } catch (error) {
      console.error("Invoices error:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadInvoices();
  }, []);


  const filtered = invoices.filter((invoice) => {
    const q = search.toLowerCase();

    return (
      String(invoice.invoice_number || "")
        .toLowerCase()
        .includes(q) ||
      String(invoice.client_name || "")
        .toLowerCase()
        .includes(q) ||
      String(invoice.status || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const statusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "paid") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (value === "overdue") {
      return "bg-red-50 text-red-700";
    }

    if (value === "partially_paid") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            My Invoices
          </h1>
          <p className="text-sm text-slate-500">
            View and manage your invoices.
          </p>
        </div>

        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <Receipt className="h-12 w-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900">
                No invoices found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Issue Date</th>
                    <th className="px-5 py-4">Due Date</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Balance</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 font-semibold">
                        {invoice.invoice_number}
                      </td>

                      <td className="px-5 py-4">
                        {invoice.issue_date || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {invoice.due_date || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {formatCurrency(invoice.total || 0)}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatCurrency(invoice.balance_due || 0)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            invoice.status
                          )}`}
                        >
                          {invoice.status || "draft"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/client/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-indigo-600"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}