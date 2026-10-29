import {
    Percent,
    RefreshCw,
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
    "#0f172a",
    "#64748b",
    "#94a3b8",
    "#cbd5e1",
];


const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};





export default function TaxReport() {
    const { formatCurrency: currency } = useSettings();
    const {
        tax,
        loading,
        error,
        loadTax,
    } = useReports();

    const [period, setPeriod] =
        useState("This Month");


    useEffect(() => {
        loadTax({
            period,
        });
    }, [loadTax, period]);


    const report =
        tax?.data ?? tax;


    const data = useMemo(() => {
        const source =
            report?.breakdown ??
            report?.tax_breakdown ??
            report?.taxBreakdown ??
            report?.taxes ??
            report?.chart ??
            [];

        if (!Array.isArray(source)) {
            return [];
        }

        return source.map(
            (item) => ({
                name:
                    item.name ??
                    item.tax_name ??
                    item.taxName ??
                    item.label ??
                    "Tax",

                value: numberValue(
                    item.value ??
                    item.amount ??
                    item.tax ??
                    item.total
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
                                loadTax({
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


            <div className="p-6">

                <div className="rounded-2xl border border-slate-200 bg-white p-6">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                            <Percent size={20} />
                        </div>

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Total Tax
                            </h2>

                            <p className="text-xs text-slate-400">
                                Current selected period
                            </p>

                        </div>

                    </div>

                    <p className="mt-4 text-3xl font-black text-slate-900">
                        {currency(total)}
                    </p>


                    {data.length > 0 ? (

                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">

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


                            <div className="space-y-3">

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

                                                <span className="font-semibold text-slate-700">
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
                                "No tax data available."}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}