import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { motion } from "framer-motion";

const DEFAULT_DATA = [
  {
    month: "Jan",
    paid: 35000,
    outstanding: 18000,
  },
  {
    month: "Feb",
    paid: 42000,
    outstanding: 21000,
  },
  {
    month: "Mar",
    paid: 38000,
    outstanding: 24000,
  },
  {
    month: "Apr",
    paid: 55000,
    outstanding: 17000,
  },
  {
    month: "May",
    paid: 61000,
    outstanding: 22000,
  },
  {
    month: "Jun",
    paid: 76000,
    outstanding: 19000,
  },
  {
    month: "Jul",
    paid: 84000,
    outstanding: 16000,
  },
];

export default function PaymentChart({
  data = DEFAULT_DATA,
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
        <h2 className="text-base font-bold text-slate-900">
          Payment performance
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Paid versus outstanding amounts
        </p>
      </div>

      <div className="mt-6 h-[300px]">
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
                `₹${(
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
                `₹${Number(
                  value
                ).toLocaleString(
                  "en-IN"
                )}`,
              ]}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                fontSize: 11,
                paddingBottom: 15,
              }}
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
      </div>
    </motion.div>
  );
}