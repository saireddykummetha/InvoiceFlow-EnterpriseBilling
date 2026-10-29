import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    Receipt,
    CreditCard,
    Wallet,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    LifeBuoy,
    // Plus,
} from "lucide-react";

import api from "../../services/api";
import CreateTicketModal from "../../components/tickets/CreateTicketModal";

export default function ClientDashboard() {
    const [data, setData] = useState({
        quotes: [],
        invoices: [],
        payments: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticketModalOpen, setTicketModalOpen] = useState(false);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [quotesResponse, invoicesResponse, paymentsResponse] =
                await Promise.all([
                    api.get("/quotes/"),
                    api.get("/invoices/"),
                    api.get("/payments/"),
                ]);

            const quotes =
                quotesResponse.data?.data ||
                quotesResponse.data ||
                [];

            const invoices =
                invoicesResponse.data?.data ||
                invoicesResponse.data ||
                [];

            const payments =
                paymentsResponse.data?.data ||
                paymentsResponse.data ||
                [];

            setData({
                quotes: Array.isArray(quotes) ? quotes : [],
                invoices: Array.isArray(invoices) ? invoices : [],
                payments: Array.isArray(payments) ? payments : [],
            });
        } catch (err) {
            console.error("Client dashboard error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // ============================================================
    // HELPERS
    // ============================================================

    const formatMoney = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    };

    const formatDate = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const statusClass = (status) => {
        switch (String(status || "").toLowerCase()) {
            case "paid":
            case "success":
            case "accepted":
                return "bg-emerald-50 text-emerald-700";

            case "pending":
            case "sent":
            case "partially_paid":
                return "bg-amber-50 text-amber-700";

            case "overdue":
            case "rejected":
            case "failed":
                return "bg-red-50 text-red-700";

            case "converted":
                return "bg-blue-50 text-blue-700";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    // ============================================================
    // CALCULATIONS
    // ============================================================

    const totalQuotes = data.quotes.length;

    const acceptedQuotes = data.quotes.filter(
        (quote) =>
            String(quote.status || "").toLowerCase() ===
            "accepted"
    ).length;

    const totalInvoices = data.invoices.length;

    const paidInvoices = data.invoices.filter(
        (invoice) =>
            String(invoice.status || "").toLowerCase() ===
            "paid"
    ).length;

    const pendingInvoices = data.invoices.filter((invoice) =>
        [
            "sent",
            "partially_paid",
            "pending",
        ].includes(
            String(invoice.status || "").toLowerCase()
        )
    ).length;

    const overdueInvoices = data.invoices.filter(
        (invoice) =>
            String(invoice.status || "").toLowerCase() ===
            "overdue"
    ).length;

    const totalInvoiceAmount = data.invoices.reduce(
        (total, invoice) =>
            total + Number(invoice.total || 0),
        0
    );

    const outstandingAmount = data.invoices.reduce(
        (total, invoice) =>
            total + Number(invoice.balance_due || 0),
        0
    );

    const totalPaidAmount = data.invoices.reduce(
        (total, invoice) =>
            total + Number(invoice.paid_amount || 0),
        0
    );

    const recentQuotes = [...data.quotes]
        .sort(
            (a, b) =>
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
        )
        .slice(0, 5);

    const recentInvoices = [...data.invoices]
        .sort(
            (a, b) =>
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
        )
        .slice(0, 5);

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-32 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                />
                            ))}
                        </div>

                        <div className="h-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* ======================================================
            HEADER
        ====================================================== */}

                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm sm:p-8 border border-slate-800">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                                Client Portal
                            </p>

                            <h1 className="mt-2 text-2xl font-bold">
                                Dashboard
                            </h1>

                            <p className="mt-2 max-w-xl text-sm text-slate-300">
                                View your quotations, invoices, payments and
                                outstanding balances.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setTicketModalOpen(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-500 shadow-sm cursor-pointer"
                            >
                                <LifeBuoy size={15} />
                                Raise Support Ticket
                            </button>
                            <button
                                type="button"
                                onClick={loadDashboard}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                                title="Refresh"
                            >
                                <RefreshCw size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ======================================================
            ERROR
        ====================================================== */}

                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-400">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="text-sm font-bold">
                                Unable to load dashboard
                            </p>

                            <p className="mt-1 text-xs">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* ======================================================
            STAT CARDS
        ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        icon={FileText}
                        title="Quotations"
                        value={totalQuotes}
                        subtitle={`${acceptedQuotes} accepted`}
                    />

                    <StatCard
                        icon={Receipt}
                        title="Invoices"
                        value={totalInvoices}
                        subtitle={`${paidInvoices} paid`}
                    />

                    <StatCard
                        icon={CreditCard}
                        title="Paid amount"
                        value={formatMoney(totalPaidAmount)}
                        subtitle={`${data.payments.length} payments`}
                    />

                    <StatCard
                        icon={Wallet}
                        title="Outstanding"
                        value={formatMoney(outstandingAmount)}
                        subtitle={`${pendingInvoices} pending`}
                    />

                </div>

                {/* ======================================================
            ALERTS
        ====================================================== */}

                {(overdueInvoices > 0 ||
                    outstandingAmount > 0) && (
                        <div className="rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-5">
                            <div className="flex items-start gap-3">
                                <Wallet
                                    size={20}
                                    className="mt-0.5 text-amber-600 dark:text-amber-400"
                                />

                                <div>
                                    <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                                        Payment summary
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                                        You have{" "}
                                        <strong>
                                            {formatMoney(outstandingAmount)}
                                        </strong>{" "}
                                        outstanding across your invoices.
                                        {overdueInvoices > 0 && (
                                            <>
                                                {" "}
                                                {overdueInvoices} invoice
                                                {overdueInvoices > 1
                                                    ? "s are"
                                                    : " is"}{" "}
                                                overdue.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* ======================================================
            SUMMARY
        ====================================================== */}

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* QUOTE SUMMARY */}

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Recent quotations
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Latest quotations available to you.
                                </p>
                            </div>

                            <Link
                                to="/client/quotes"
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                View all
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        {recentQuotes.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                text="No quotations available."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentQuotes.map((quote) => (
                                    <div
                                        key={quote.id}
                                        className="flex items-center justify-between gap-4 p-5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                                {quote.quote_number ||
                                                    `Quote #${quote.id}`}
                                            </p>

                                            <p className="mt-1 text-[11px] text-slate-400">
                                                {formatDate(
                                                    quote.issue_date
                                                )}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                {formatMoney(quote.total)}
                                            </p>

                                            <span
                                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${statusClass(
                                                    quote.status
                                                )}`}
                                            >
                                                {quote.status || "draft"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INVOICE SUMMARY */}

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Recent invoices
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Latest invoices and payment status.
                                </p>
                            </div>

                            <Link
                                to="/client/invoices"
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                View all
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        {recentInvoices.length === 0 ? (
                            <EmptyState
                                icon={Receipt}
                                text="No invoices available."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentInvoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between gap-4 p-5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                                {invoice.invoice_number ||
                                                    `Invoice #${invoice.id}`}
                                            </p>

                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Due{" "}
                                                {formatDate(
                                                    invoice.due_date
                                                )}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                {formatMoney(invoice.total)}
                                            </p>

                                            <span
                                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${statusClass(
                                                    invoice.status
                                                )}`}
                                            >
                                                {String(
                                                    invoice.status || "draft"
                                                ).replace(
                                                    "_",
                                                    " "
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ======================================================
            FINANCIAL SUMMARY
        ====================================================== */}

                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">

                    <div className="mb-5">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Financial overview
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Summary calculated from your invoices and
                            payments.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">

                        <SummaryItem
                            label="Total invoiced"
                            value={formatMoney(
                                totalInvoiceAmount
                            )}
                        />

                        <SummaryItem
                            label="Total paid"
                            value={formatMoney(
                                totalPaidAmount
                            )}
                        />

                        <SummaryItem
                            label="Balance due"
                            value={formatMoney(
                                outstandingAmount
                            )}
                        />

                    </div>
                </div>

            </div>

            <CreateTicketModal
                open={ticketModalOpen}
                onClose={() => setTicketModalOpen(false)}
                onSuccess={() => loadDashboard()}
            />
        </div>
    );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    icon: Icon,
    title,
    value,
    subtitle,
}) {
    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {subtitle}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// SUMMARY ITEM
// ============================================================

function SummaryItem({
    label,
    value,
}) {
    return (
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
    icon: Icon,
    text,
}) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <Icon
                size={32}
                className="text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {text}
            </p>
        </div>
    );
}