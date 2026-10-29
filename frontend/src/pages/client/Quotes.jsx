import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    Eye,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import api from "../../services/api";

export default function ClientQuotes() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadQuotes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/quotes/");

            const data = response.data?.data || response.data || [];

            setQuotes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load quotes:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load quotations."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuotes();
    }, []);

    const formatMoney = (value) => {
        const amount = Number(value || 0);

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClass = (status) => {
        switch (String(status || "").toLowerCase()) {
            case "accepted":
                return "bg-emerald-50 text-emerald-700";

            case "rejected":
                return "bg-red-50 text-red-700";

            case "converted":
                return "bg-blue-50 text-blue-700";

            case "sent":
                return "bg-purple-50 text-purple-700";

            case "expired":
                return "bg-orange-50 text-orange-700";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                                <FileText size={20} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    My Quotations
                                </h1>

                                <p className="text-sm text-slate-500">
                                    View quotations prepared for you.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={loadQuotes}
                        disabled={loading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />

                        Refresh
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="text-sm font-semibold">
                                Unable to load quotations
                            </p>

                            <p className="mt-1 text-xs">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* CONTENT */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900">
                                Quotations
                            </h2>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {quotes.length} total
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-3 p-5">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                                />
                            ))}
                        </div>
                    ) : quotes.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <FileText
                                size={40}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 text-sm font-bold text-slate-800">
                                No quotations found
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Your quotations will appear here when they are created.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                Quote
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                Date
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                Valid Until
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                Total
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {quotes.map((quote) => (
                                            <tr
                                                key={quote.id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {quote.quote_number ||
                                                            `Quote #${quote.id}`}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {quote.client_name || "-"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatDate(quote.issue_date)}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatDate(quote.expiry_date)}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                                    {formatMoney(quote.total)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold capitalize ${getStatusClass(
                                                            quote.status
                                                        )}`}
                                                    >
                                                        {quote.status || "draft"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        to={`/client/quotes/${quote.id}`}
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE */}
                            <div className="divide-y divide-slate-100 md:hidden">
                                {quotes.map((quote) => (
                                    <div
                                        key={quote.id}
                                        className="p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {quote.quote_number ||
                                                        `Quote #${quote.id}`}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {formatDate(quote.issue_date)}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClass(
                                                    quote.status
                                                )}`}
                                            >
                                                {quote.status || "draft"}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Valid until
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                                    {formatDate(quote.expiry_date)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Total
                                                </p>

                                                <p className="mt-1 text-xs font-bold text-slate-900">
                                                    {formatMoney(quote.total)}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/client/quotes/${quote.id}`}
                                            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-bold text-white hover:bg-slate-800"
                                        >
                                            <Eye size={14} />
                                            View quotation
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}