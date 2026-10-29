import  { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import useSettings from "../../hooks/useSettings";

export default function QuoteDetails() {
  const { formatCurrency } = useSettings();
  const { id } = useParams();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);



  const loadQuote = async () => {
    try {
      const response = await api.get(`/quotes/${id}/`);
      setQuote(response?.data?.data || null);
    } catch (error) {
      console.error("Quote details error:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadQuote();
  }, [id]);

  const action = async (type) => {
    try {
      setActionLoading(true);

      await api.post(`/quotes/${id}/${type}/`);

      await loadQuote();
    } catch (error) {
      console.error("Quote action error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Quote not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/client/quotes"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotes
        </Link>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {quote.quote_number}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Quote details
                </p>
              </div>

              <span className="h-fit rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold capitalize text-indigo-700">
                {quote.status || "pending"}
              </span>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">
                Issue Date
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {quote.issue_date || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-400">
                Expiry Date
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {quote.expiry_date || "-"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {(quote.items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      {item.description}
                    </td>

                    <td className="px-6 py-4">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4">
                      {formatCurrency(item.unit_price || 0)}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(item.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 p-6">
            <div className="ml-auto max-w-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>
                   {formatCurrency(quote.subtotal || 0)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span>
                   {formatCurrency(quote.discount || 0)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>
                <span>
                   {formatCurrency(quote.tax || 0)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Total</span>
                <span>
                   {formatCurrency(quote.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {quote.status !== "accepted" &&
            quote.status !== "rejected" &&
            quote.status !== "converted" && (
              <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
                <button
                  disabled={actionLoading}
                  onClick={() => action("reject")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  Reject
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => action("approve")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  Accept Quote
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}