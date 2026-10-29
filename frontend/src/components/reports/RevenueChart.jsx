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

export default function RevenueChart({
  data = DEFAULT_DATA,
  currencySymbol = "₹",
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Revenue
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Revenue generated over time
          </p>
        </div>

        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none">
          <option>
            This year
          </option>

          <option>
            Last year
          </option>
        </select>
      </div>

      <div className="mt-6 h-[310px]">
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
                  value / 1000
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
                `${currencySymbol}${Number(
                  value
                ).toLocaleString(
                  "en-IN"
                )}`,
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
      </div>
    </motion.div>
  );
}