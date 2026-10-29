import {
  Bar,
  BarChart,
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
    received: 35000,
  },
  {
    month: "Feb",
    received: 42000,
  },
  {
    month: "Mar",
    received: 38000,
  },
  {
    month: "Apr",
    received: 55000,
  },
  {
    month: "May",
    received: 61000,
  },
  {
    month: "Jun",
    received: 76000,
  },
];

export default function PaymentChart({
  data = DEFAULT_DATA,
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
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Payments received
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Monthly collection trend
        </p>
      </div>

      <div className="mt-6 h-[270px]">
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
          >
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
              contentStyle={{
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0",
              }}
              formatter={(value) => [
                `₹${Number(
                  value
                ).toLocaleString(
                  "en-IN"
                )}`,
                "Received",
              ]}
            />

            <Bar
              dataKey="received"
              fill="#0f172a"
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
    </motion.div>
  );
}