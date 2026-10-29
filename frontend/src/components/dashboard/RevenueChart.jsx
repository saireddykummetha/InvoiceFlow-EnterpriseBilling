import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { motion } from "framer-motion";

const DEFAULT_DATA = [
  {
    month: "Jan",
    revenue: 42000,
  },
  {
    month: "Feb",
    revenue: 51000,
  },
  {
    month: "Mar",
    revenue: 48000,
  },
  {
    month: "Apr",
    revenue: 68000,
  },
  {
    month: "May",
    revenue: 72000,
  },
  {
    month: "Jun",
    revenue: 86000,
  },
  {
    month: "Jul",
    revenue: 94000,
  },
  {
    month: "Aug",
    revenue: 105000,
  },
];

const currency = (value) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value);

export default function RevenueChart({
  data = DEFAULT_DATA,
  title = "Revenue overview",
  subtitle = "Monthly revenue performance",
  currencySymbol = "₹",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
          Revenue
        </div>
      </div>

      <div className="mt-6 h-[300px] w-full">
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
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
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
              tickFormatter={currency}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 30px rgba(15,23,42,0.08)",
              }}
              formatter={(value) => [
                `${currencySymbol}${Number(
                  value
                ).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0f172a"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              activeDot={{
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}