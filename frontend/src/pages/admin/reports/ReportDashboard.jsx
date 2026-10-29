import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  FileText,
  IndianRupee,
  RefreshCw,
  Receipt,
  Users,
} from "lucide-react";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import useReports from "../../../hooks/useReports";

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value, symbol = "₹") => {
  const number = Number(value || 0);

  return `${symbol}${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const getValue = (object, keys, fallback = 0) => {
  if (!object) return fallback;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return fallback;
};

// ============================================================
// DEFAULT EMPTY DATA
// NO MOCK / INITIAL BUSINESS DATA
// ============================================================

const EMPTY_MONTHLY_DATA = [];

const EMPTY_TAX_DATA = [];

// ============================================================
// REPORT CARD
// ============================================================

function ReportCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) {
  const numericTrend = Number(trend || 0);

  const positive = numericTrend > 0;
  const negative = numericTrend < 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -2,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          {Icon && <Icon size={20} />}
        </div>

        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${positive
                ? "bg-emerald-50 text-emerald-600"
                : negative
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-500"
              }`}
          >
            {positive ? (
              <ArrowUpRight size={12} />
            ) : negative ? (
              <ArrowDownRight size={12} />
            ) : null}

            {Math.abs(numericTrend).toFixed(1)}%
          </div>
        )}
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      {subtitle && (
        <p className="mt-2 text-[11px] leading-5 text-slate-400">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

// ============================================================
// REVENUE CHART
// ============================================================

function RevenueChart({
  data,
  currencySymbol,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-900">
          Revenue
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Revenue generated over time
        </p>
      </div>

      <div className="mt-6 h-[310px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 5,
                left: -15,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="reportRevenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopOpacity={0.22}
                  />

                  <stop
                    offset="100%"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
                tickFormatter={(value) =>
                  `${currencySymbol}${(
                    Number(value) / 1000
                  ).toFixed(0)}k`
                }
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border:
                    "1px solid #e2e8f0",
                }}
                formatter={(value) => [
                  formatCurrency(
                    value,
                    currencySymbol
                  ),
                  "Revenue",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={3}
                fill="url(#reportRevenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// PAYMENT CHART
// ============================================================

function PaymentChart({
  data,
  currencySymbol,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-900">
          Payment performance
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Paid versus outstanding amounts
        </p>
      </div>

      <div className="mt-6 h-[300px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No payment data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 5,
                left: -15,
                bottom: 0,
              }}
              barGap={6}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
                tickFormatter={(value) =>
                  `${currencySymbol}${(
                    Number(value) / 1000
                  ).toFixed(0)}k`
                }
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border:
                    "1px solid #e2e8f0",
                }}
                formatter={(value) => [
                  formatCurrency(
                    value,
                    currencySymbol
                  ),
                ]}
              />

              <Bar
                dataKey="paid"
                name="Paid"
                fill="#0f172a"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={25}
              />

              <Bar
                dataKey="outstanding"
                name="Outstanding"
                fill="#cbd5e1"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// TAX CHART
// ============================================================

function TaxChart({
  data,
  currencySymbol,
}) {
  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.value || 0),
    0
  );

  const colors = [
    "#0f172a",
    "#64748b",
    "#94a3b8",
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-900">
          GST distribution
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Tax collected by category
        </p>
      </div>

      <div className="relative mt-4 h-[240px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No tax data available
          </div>
        ) : (
          <>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RechartsPieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {data.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          colors[
                          index %
                          colors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(
                      value,
                      currencySymbol
                    )
                  }
                  contentStyle={{
                    borderRadius: 14,
                    border:
                      "1px solid #e2e8f0",
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(
                  total,
                  currencySymbol
                )}
              </span>

              <span className="mt-1 text-[10px] font-medium text-slate-400">
                Total GST
              </span>
            </div>
          </>
        )}
      </div>

      {data.length > 0 && (
        <div className="space-y-2">
          {data.map(
            (item, index) => {
              const percentage =
                total > 0
                  ? (
                    (Number(
                      item.value || 0
                    ) /
                      total) *
                    100
                  ).toFixed(1)
                  : "0.0";

              return (
                <div
                  key={
                    item.name ||
                    index
                  }
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          colors[
                          index %
                          colors.length
                          ],
                      }}
                    />

                    <span className="text-xs font-semibold text-slate-600">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">
                      {percentage}%
                    </span>

                    <span className="text-xs font-bold text-slate-800">
                      {formatCurrency(
                        item.value,
                        currencySymbol
                      )}
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// REPORT DASHBOARD
// ============================================================

export default function ReportDashboard() {
  const {
    dashboard,
    loading,
    error,
    loadDashboard,
  } = useReports();

  const [period, setPeriod] =
    useState("This year");

  // ==========================================================
  // NORMALIZE API DATA
  // ==========================================================

  const report = useMemo(() => {
    if (!dashboard) {
      return {
        clients: 0,
        quotes: 0,
        invoices: 0,
        payments: 0,
        receipts: 0,
        revenue: 0,
        outstanding: 0,
        paid: 0,
        tax: 0,
        currencySymbol: "₹",
        revenueMonthly:
          EMPTY_MONTHLY_DATA,
        paymentMonthly:
          EMPTY_MONTHLY_DATA,
        taxBreakdown:
          EMPTY_TAX_DATA,
      };
    }

    const data =
      dashboard.data ||
      dashboard;

    const currencySymbol =
      getValue(
        data,
        [
          "currencySymbol",
          "currency_symbol",
        ],
        "₹"
      );

    const monthlyRevenue =
      getValue(
        data,
        [
          "revenueMonthly",
          "revenue_monthly",
          "monthlyRevenue",
          "monthly_revenue",
        ],
        []
      );

    const monthlyPayments =
      getValue(
        data,
        [
          "paymentMonthly",
          "payment_monthly",
          "monthlyPayments",
          "monthly_payments",
        ],
        []
      );

    const taxBreakdown =
      getValue(
        data,
        [
          "taxBreakdown",
          "tax_breakdown",
          "taxes",
          "tax",
        ],
        []
      );

    return {
      ...data,

      clients: Number(
        getValue(
          data,
          ["clients", "client_count"],
          0
        )
      ),

      quotes: Number(
        getValue(
          data,
          ["quotes", "quote_count"],
          0
        )
      ),

      invoices: Number(
        getValue(
          data,
          ["invoices", "invoice_count"],
          0
        )
      ),

      payments: Number(
        getValue(
          data,
          ["payments", "payment_count"],
          0
        )
      ),

      receipts: Number(
        getValue(
          data,
          ["receipts", "receipt_count"],
          0
        )
      ),

      revenue: Number(
        getValue(
          data,
          [
            "revenue",
            "total_revenue",
          ],
          0
        )
      ),

      outstanding: Number(
        getValue(
          data,
          [
            "outstanding",
            "outstanding_amount",
          ],
          0
        )
      ),

      paid: Number(
        getValue(
          data,
          [
            "paid",
            "paid_amount",
            "total_paid",
          ],
          0
        )
      ),

      tax: Number(
        getValue(
          data,
          [
            "tax",
            "total_tax",
            "tax_collected",
          ],
          0
        )
      ),

      currencySymbol,

      revenueMonthly:
        Array.isArray(
          monthlyRevenue
        )
          ? monthlyRevenue
          : [],

      paymentMonthly:
        Array.isArray(
          monthlyPayments
        )
          ? monthlyPayments
          : [],

      taxBreakdown:
        Array.isArray(
          taxBreakdown
        )
          ? taxBreakdown
          : [],
    };
  }, [dashboard]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await loadDashboard({
      period,
    });
  };

  // ==========================================================
  // PERIOD CHANGE
  // ==========================================================

  const handlePeriodChange = async (
    event
  ) => {
    const value =
      event.target.value;

    setPeriod(value);

    await loadDashboard({
      period: value,
    });
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    !dashboard
  ) {
    return (
      <div className="min-h-[500px] rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              className="mx-auto animate-spin text-slate-500"
              size={28}
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Loading reports...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching live database data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-8">
        <div className="text-center">
          <p className="text-sm font-bold text-red-600">
            Unable to load reports
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex items-center justify-end gap-2">
          <select
            value={period}
            onChange={
              handlePeriodChange
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none"
          >
            <option>
              This year
            </option>

            <option>
              Last year
            </option>

            <option>
              This month
            </option>

            <option>
              Last month
            </option>
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

      {/* ================================================== */}
      {/* ERROR BANNER */}
      {/* ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ================================================== */}
      {/* SUMMARY CARDS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Total Revenue"
          value={formatCurrency(
            report.revenue,
            report.currencySymbol
          )}
          subtitle="Live revenue from database"
          icon={IndianRupee}
          trend={report.revenueTrend}
        />

        <ReportCard
          title="Clients"
          value={formatNumber(
            report.clients
          )}
          subtitle="Total registered clients"
          icon={Users}
          trend={report.clientsTrend}
        />

        <ReportCard
          title="Invoices"
          value={formatNumber(
            report.invoices
          )}
          subtitle="Total invoices"
          icon={FileText}
          trend={report.invoiceTrend}
        />

        <ReportCard
          title="Payments"
          value={formatCurrency(
            report.paid ||
            report.payments,
            report.currencySymbol
          )}
          subtitle="Payments received"
          icon={Receipt}
          trend={report.paymentTrend}
        />
      </div>

      {/* ================================================== */}
      {/* SECONDARY METRICS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Outstanding"
          value={formatCurrency(
            report.outstanding,
            report.currencySymbol
          )}
          subtitle="Pending payment amount"
          icon={BarChart3}
        />

        <ReportCard
          title="Quotes"
          value={formatNumber(
            report.quotes
          )}
          subtitle="Total quotations"
          icon={FileText}
        />

        <ReportCard
          title="Receipts"
          value={formatNumber(
            report.receipts
          )}
          subtitle="Generated receipts"
          icon={Receipt}
        />

        <ReportCard
          title="GST Collected"
          value={formatCurrency(
            report.tax,
            report.currencySymbol
          )}
          subtitle="Total tax collected"
          icon={IndianRupee}
        />
      </div>

      {/* ================================================== */}
      {/* CHARTS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart
          data={
            report.revenueMonthly
          }
          currencySymbol={
            report.currencySymbol
          }
        />

        <PaymentChart
          data={
            report.paymentMonthly
          }
          currencySymbol={
            report.currencySymbol
          }
        />
      </div>

      {/* ================================================== */}
      {/* TAX */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TaxChart
          data={
            report.taxBreakdown
          }
          currencySymbol={
            report.currencySymbol
          }
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Report summary
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Current live database totals
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-medium text-slate-500">
                Revenue
              </span>

              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(
                  report.revenue,
                  report.currencySymbol
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-medium text-slate-500">
                Paid
              </span>

              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(
                  report.paid,
                  report.currencySymbol
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-medium text-slate-500">
                Outstanding
              </span>

              <span className="text-sm font-bold text-amber-600">
                {formatCurrency(
                  report.outstanding,
                  report.currencySymbol
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-medium text-slate-500">
                GST
              </span>

              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(
                  report.tax,
                  report.currencySymbol
                )}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}