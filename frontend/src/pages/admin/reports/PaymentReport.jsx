import {
    CreditCard,
    RefreshCw,
    IndianRupee,
} from "lucide-react";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import useReports from "../../hooks/useReports";
import useSettings from "../../hooks/useSettings";


const COLORS = [
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#64748b",
];


const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};





export default function PaymentReport() {
    const { formatCurrency: currency } = useSettings();
    const {
        payments,
        loading,
        error,
        loadPayments,
    } = useReports();

    const [period, setPeriod] =
        useState("This Month");


    useEffect(() => {
        loadPayments({
            period,
        });
    }, [loadPayments, period]);


    const report =
        payments?.data ?? payments;


    const data = useMemo(() => {
        const source =
            report?.breakdown ??
            report?.payment_breakdown ??
            report?.paymentBreakdown ??
            report?.statuses ??
            report?.chart ??
            [];

        if (!Array.isArray(source)) {
            return [];
        }

        return source.map(
            (item) => ({
                name:
                    item.name ??
                    item.status ??
                    item.label ??
                    "Unknown",

                value: numberValue(
                    item.value ??
                    item.amount ??
                    item.count
                ),
            })
        );
    }, [report]);


    const total =
        data.reduce(
            (sum, item) =>
                sum + numberValue(item.value),
            0
        );


    return (
        <div className="min-h-full bg-slate-50">

            <div className="border-b border-slate-200 bg-white p-6">

                <div className="flex items-center justify-end gap-2">
                    <div className="flex gap-2">

                        <select
                            value={period}
                            onChange={(e) =>
                                setPeriod(
                                    e.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                        >

                            <option>
                                This Week
                            </option>

                            <option>
                                This Month
                            </option>

                            <option>
                                Last Month
                            </option>

                            <option>
                                This Year
                            </option>

                        </select>

                        <button
                            type="button"
                            onClick={() =>
                                loadPayments({
                                    period,
                                })
                            }
                            className="rounded-xl border border-slate-200 bg-white p-2.5"
                        >
                            <RefreshCw
                                size={18}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                        </button>

                    </div>

                </div>

            </div>


            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                            <IndianRupee size={20} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Total Payments
                        </p>

                    </div>

                    <p className="mt-4 text-2xl font-black text-slate-900">
                        {currency(total)}
                    </p>

                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <CreditCard size={20} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Transactions
                        </p>

                    </div>

                    <p className="mt-4 text-2xl font-black text-slate-900">
                        {data.reduce(
                            (sum, item) =>
                                sum +
                                numberValue(
                                    item.value
                                ),
                            0
                        )}
                    </p>

                </div>

            </div>


            <div className="p-6">

                <div className="rounded-2xl border border-slate-200 bg-white p-6">

                    <h2 className="font-bold text-slate-900">
                        Payment Distribution
                    </h2>


                    {data.length > 0 ? (

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                            <div className="h-[350px]">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={data}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={4}
                                        >

                                            {data.map(
                                                (_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            COLORS[
                                                            index %
                                                            COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}

                                        </Pie>

                                        <Tooltip />

                                    </PieChart>

                                </ResponsiveContainer>

                            </div>


                            <div className="flex flex-col justify-center gap-3">

                                {data.map(
                                    (item, index) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                                        >

                                            <div className="flex items-center gap-3">

                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        background:
                                                            COLORS[
                                                            index %
                                                            COLORS.length
                                                            ],
                                                    }}
                                                />

                                                <span className="text-sm font-semibold text-slate-700">
                                                    {item.name}
                                                </span>

                                            </div>

                                            <span className="font-bold text-slate-900">
                                                {currency(
                                                    item.value
                                                )}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                    ) : (

                        <div className="flex h-[350px] items-center justify-center text-sm text-slate-400">

                            {loading
                                ? "Loading..."
                                : error ||
                                "No payment data available."}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}