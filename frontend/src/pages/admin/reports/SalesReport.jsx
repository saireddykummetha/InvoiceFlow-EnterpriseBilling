import {
    ArrowUpRight,
    BarChart3,
    RefreshCw,
    TrendingUp,
} from "lucide-react";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useEffect, useMemo, useState } from "react";

import useReports from "../../hooks/useReports";
import useSettings from "../../hooks/useSettings";


const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};





export default function SalesReport() {
    const { formatCurrency: currency } = useSettings();
    const {
        sales,
        loading,
        error,
        loadSales,
    } = useReports();

    const [period, setPeriod] =
        useState("This Month");


    useEffect(() => {
        loadSales({
            period,
        });
    }, [loadSales, period]);


    const data = useMemo(() => {
        const report =
            sales?.data ?? sales;

        const source =
            report?.chart ??
            report?.sales_chart ??
            report?.salesChart ??
            report?.monthly_sales ??
            report?.monthlySales ??
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

                sales: numberValue(
                    item.sales ??
                    item.revenue ??
                    item.amount ??
                    item.value
                ),
            })
        );
    }, [sales]);


    const report =
        sales?.data ?? sales;

    const totalSales =
        numberValue(
            report?.total_sales ??
            report?.totalSales ??
            report?.revenue
        );

    const totalInvoices =
        numberValue(
            report?.total_invoices ??
            report?.totalInvoices ??
            report?.invoices
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
                                loadSales({
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


            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">

                <SummaryCard
                    icon={TrendingUp}
                    title="Total Sales"
                    value={currency(
                        totalSales
                    )}
                />

                <SummaryCard
                    icon={BarChart3}
                    title="Invoices"
                    value={totalInvoices}
                />

                <SummaryCard
                    icon={ArrowUpRight}
                    title="Average Invoice"
                    value={currency(
                        totalInvoices > 0
                            ? totalSales /
                            totalInvoices
                            : 0
                    )}
                />

            </div>


            <div className="p-6">

                <div className="rounded-2xl border border-slate-200 bg-white p-6">

                    <h2 className="font-bold text-slate-900">
                        Sales Trend
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Dynamic sales data from API
                    </p>


                    {data.length > 0 ? (

                        <div className="mt-6 h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <AreaChart data={data}>

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
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            currency(value)
                                        }
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#0f172a"
                                        strokeWidth={3}
                                        fill="#e2e8f0"
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        </div>

                    ) : (

                        <EmptyState
                            loading={loading}
                            error={error}
                        />

                    )}

                </div>

            </div>

        </div>
    );
}


function SummaryCard({
    icon: Icon,
    title,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-3">

                <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                    <Icon size={19} />
                </div>

                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

            </div>

            <p className="mt-4 text-2xl font-black text-slate-900">
                {value}
            </p>

        </div>
    );
}


function EmptyState({
    loading,
    error,
}) {
    return (
        <div className="flex h-[350px] items-center justify-center">

            {loading ? (
                <RefreshCw
                    size={30}
                    className="animate-spin text-slate-400"
                />
            ) : (
                <div className="text-center">

                    <p className="text-sm text-slate-500">
                        {error ||
                            "No sales data available."}
                    </p>

                </div>
            )}

        </div>
    );
}