import {
    ArrowDown,
    ArrowUp,
    RefreshCw,
    TrendingUp,
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

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import useReports from "../../hooks/useReports";
import useSettings from "../../hooks/useSettings";


const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};





export default function ProfitLoss() {
    const { formatCurrency: currency } = useSettings();
    const {
        profitLoss,
        loading,
        error,
        loadProfitLoss,
    } = useReports();

    const [period, setPeriod] =
        useState("This Month");


    useEffect(() => {
        loadProfitLoss({
            period,
        });
    }, [loadProfitLoss, period]);


    const report =
        profitLoss?.data ??
        profitLoss;


    const revenue =
        numberValue(
            report?.revenue ??
            report?.total_revenue
        );


    const expenses =
        numberValue(
            report?.expenses ??
            report?.total_expenses
        );


    const profit =
        numberValue(
            report?.profit ??
            report?.net_profit ??
            revenue - expenses
        );


    const margin =
        revenue > 0
            ? (profit / revenue) * 100
            : 0;


    const data = useMemo(() => {
        const source =
            report?.chart ??
            report?.profit_loss_chart ??
            report?.profitLossChart ??
            report?.monthly ??
            [];

        if (!Array.isArray(source)) {
            return [];
        }

        return source.map(
            (item, index) => ({
                month:
                    item.month ??
                    item.label ??
                    item.name ??
                    String(index + 1),

                revenue: numberValue(
                    item.revenue
                ),

                expenses: numberValue(
                    item.expenses
                ),

                profit: numberValue(
                    item.profit ??
                    item.net_profit
                ),
            })
        );
    }, [report]);


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
                                loadProfitLoss({
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


            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

                <FinanceCard
                    icon={ArrowUp}
                    title="Revenue"
                    value={currency(
                        revenue
                    )}
                    positive
                />

                <FinanceCard
                    icon={ArrowDown}
                    title="Expenses"
                    value={currency(
                        expenses
                    )}
                />

                <FinanceCard
                    icon={TrendingUp}
                    title="Net Profit"
                    value={currency(
                        profit
                    )}
                    positive={
                        profit >= 0
                    }
                />

                <FinanceCard
                    icon={TrendingUp}
                    title="Profit Margin"
                    value={`${margin.toFixed(
                        1
                    )}%`}
                    positive={
                        margin >= 0
                    }
                />

            </div>


            <div className="p-6">

                <div className="rounded-2xl border border-slate-200 bg-white p-6">

                    <h2 className="font-bold text-slate-900">
                        Profit & Loss Trend
                    </h2>

                    {data.length > 0 ? (

                        <div className="mt-6 h-[380px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart data={data}>

                                    <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) =>
                                            `₹${(
                                                numberValue(
                                                    value
                                                ) / 1000
                                            ).toFixed(0)}k`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            currency(value)
                                        }
                                    />

                                    <Bar
                                        dataKey="revenue"
                                        name="Revenue"
                                        fill="#0f172a"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0,
                                        ]}
                                    />

                                    <Bar
                                        dataKey="expenses"
                                        name="Expenses"
                                        fill="#cbd5e1"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0,
                                        ]}
                                    />

                                    <Bar
                                        dataKey="profit"
                                        name="Profit"
                                        fill="#10b981"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    ) : (

                        <div className="flex h-[380px] items-center justify-center text-sm text-slate-400">

                            {loading
                                ? "Loading..."
                                : error ||
                                "No profit/loss data available."}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


function FinanceCard({
    icon: Icon,
    title,
    value,
    positive,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                        {value}
                    </p>

                </div>

                <div
                    className={`rounded-xl p-3 ${positive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                >
                    <Icon size={20} />
                </div>

            </div>

        </div>
    );
}