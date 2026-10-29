import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    RefreshCw,
    TrendingUp,
    XCircle,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import toast from "react-hot-toast";

import PageHeader from "../../../components/layout/PageHeader";
import paymentService from "../../../services/paymentService";
import useSettings from "../../../hooks/useSettings";

// =========================================================
// HELPERS
// =========================================================



const normalizeList = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    if (Array.isArray(response?.payments)) {
        return response.payments;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
};

const getStatus = (payment) =>
    String(
        payment?.status ||
        payment?.payment_status ||
        ""
    ).toLowerCase();

const getAmount = (payment) =>
    Number(
        payment?.amount ||
        payment?.paid_amount ||
        payment?.total ||
        0
    );

// =========================================================
// COMPONENT
// =========================================================

export default function PaymentHistory() {
    const { formatCurrency } = useSettings();
    const [payments, setPayments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [period, setPeriod] =
        useState("6");

    // =======================================================
    // LOAD
    // =======================================================

    const loadHistory = async () => {
        try {
            setLoading(true);

            const response =
                await paymentService.getAll();

            setPayments(
                normalizeList(response)
            );
        } catch (error) {
            console.error(
                "Payment history error:",
                error
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to load payment history"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // =======================================================
    // MONTHLY DATA
    // =======================================================

    const chartData = useMemo(() => {
        const now = new Date();

        const months = [];

        const count =
            Number(period);

        for (
            let index = count - 1;
            index >= 0;
            index--
        ) {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - index,
                1
            );

            months.push({
                key: `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`,

                month: date.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short",
                    }
                ),

                received: 0,

                pending: 0,

                failed: 0,
            });
        }

        payments.forEach((payment) => {
            const dateValue =
                payment.created_at ||
                payment.date ||
                payment.payment_date;

            if (!dateValue) {
                return;
            }

            const date =
                new Date(dateValue);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return;
            }

            const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            const month =
                months.find(
                    (item) =>
                        item.key === key
                );

            if (!month) {
                return;
            }

            const amount =
                getAmount(payment);

            const status =
                getStatus(payment);

            if (
                ["success", "paid", "completed"].includes(
                    status
                )
            ) {
                month.received += amount;
            }

            if (status === "pending") {
                month.pending += amount;
            }

            if (status === "failed") {
                month.failed += amount;
            }
        });

        return months;
    }, [payments, period]);

    // =======================================================
    // TOTALS
    // =======================================================

    const totals = useMemo(() => {
        let received = 0;
        let pending = 0;
        let failed = 0;

        payments.forEach((payment) => {
            const amount =
                getAmount(payment);

            const status =
                getStatus(payment);

            if (
                ["success", "paid", "completed"].includes(
                    status
                )
            ) {
                received += amount;
            }

            if (status === "pending") {
                pending += amount;
            }

            if (status === "failed") {
                failed += amount;
            }
        });

        return {
            received,
            pending,
            failed,
        };
    }, [payments]);

    // =======================================================
    // UI
    // =======================================================

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="space-y-6"
        >
            <PageHeader
                title="Payment History"
                subtitle="Analyze your payment collection and transaction trends."
                action={
                    <button
                        onClick={loadHistory}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                }
            />

            {/* =================================================
          SUMMARY
      ================================================= */}

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                    title="Received"
                    value={totals.received}
                    icon={CheckCircle2}
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <SummaryCard
                    title="Pending"
                    value={totals.pending}
                    icon={Clock3}
                    iconClass="bg-amber-50 text-amber-600"
                />

                <SummaryCard
                    title="Failed"
                    value={totals.failed}
                    icon={XCircle}
                    iconClass="bg-red-50 text-red-600"
                />
            </div>

            {/* =================================================
          CHART
      ================================================= */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                                <TrendingUp
                                    size={17}
                                    className="text-slate-700"
                                />
                            </div>

                            <h2 className="font-bold text-slate-900">
                                Payments Received
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                            Monthly collection trend
                        </p>
                    </div>

                    <select
                        value={period}
                        onChange={(e) =>
                            setPeriod(e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
                    >
                        <option value="3">
                            Last 3 months
                        </option>

                        <option value="6">
                            Last 6 months
                        </option>

                        <option value="12">
                            Last 12 months
                        </option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex h-[320px] items-center justify-center">
                        <RefreshCw
                            size={28}
                            className="animate-spin text-slate-400"
                        />
                    </div>
                ) : (
                    <div className="mt-6 h-[320px]">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 5,
                                    left: -15,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    tickFormatter={(value) =>
                                        `₹${(
                                            value / 1000
                                        ).toFixed(0)}k`
                                    }
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "#f8fafc",
                                    }}
                                    formatter={(value) => [
                                        formatCurrency(
                                            value
                                        ),
                                        "Received",
                                    ]}
                                    contentStyle={{
                                        borderRadius:
                                            "14px",

                                        border:
                                            "1px solid #e2e8f0",
                                    }}
                                />

                                <Bar
                                    dataKey="received"
                                    radius={[
                                        7,
                                        7,
                                        0,
                                        0,
                                    ]}
                                    maxBarSize={42}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* =================================================
          RECENT HISTORY
      ================================================= */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <CreditCard
                            size={18}
                            className="text-slate-700"
                        />
                    </div>

                    <div>
                        <h2 className="font-bold text-slate-900">
                            Recent Transactions
                        </h2>

                        <p className="text-xs text-slate-400">
                            Latest payment activity
                        </p>
                    </div>
                </div>

                {payments.length === 0 ? (
                    <div className="p-10 text-center">
                        <CalendarDays
                            size={35}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            No payment history available.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {payments
                            .slice(0, 10)
                            .map((payment) => {
                                const status =
                                    getStatus(payment);

                                return (
                                    <div
                                        key={
                                            payment.id ||
                                            payment.payment_id
                                        }
                                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                                                <CreditCard
                                                    size={18}
                                                    className="text-slate-600"
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    PAY-
                                                    {payment.id ||
                                                        payment.payment_id}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {payment.invoice
                                                        ?.invoice_number ||
                                                        payment.invoice_number ||
                                                        payment.invoice ||
                                                        "Invoice"}{" "}
                                                    •{" "}
                                                    {payment.payment_method ||
                                                        payment.method ||
                                                        "Online"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">
                                                    {formatCurrency(
                                                        getAmount(
                                                            payment
                                                        )
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {payment.created_at
                                                        ? new Date(
                                                            payment.created_at
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "-"}
                                                </p>
                                            </div>

                                            <HistoryStatus
                                                status={status}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
    title,
    value,
    icon: Icon,
    iconClass,
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                        {formatCurrency(value)}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

// =========================================================
// HISTORY STATUS
// =========================================================

function HistoryStatus({ status }) {
    if (
        ["success", "paid", "completed"].includes(
            status
        )
    ) {
        return (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Success
            </span>
        );
    }

    if (status === "failed") {
        return (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                Failed
            </span>
        );
    }

    return (
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            Pending
        </span>
    );
}