import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { motion } from "framer-motion";

const DEFAULT_DATA = [
  {
    name: "Paid",
    value: 58,
  },
  {
    name: "Pending",
    value: 21,
  },
  {
    name: "Overdue",
    value: 14,
  },
  {
    name: "Draft",
    value: 7,
  },
];

const COLORS = [
  "#0f172a",
  "#f59e0b",
  "#ef4444",
  "#cbd5e1",
];

export default function InvoiceChart({
  data = DEFAULT_DATA,
}) {
  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.value || 0),
    0
  );

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
          Invoice status
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Current invoice distribution
        </p>
      </div>

      <div className="relative mt-5 h-[230px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              strokeWidth={0}
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

            <Tooltip
              contentStyle={{
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-slate-900">
            {total}
          </p>

          <p className="text-xs text-slate-400">
            Total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.map(
          (item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      COLORS[
                        index %
                          COLORS.length
                      ],
                  }}
                />

                <span className="text-xs font-medium text-slate-600">
                  {item.name}
                </span>
              </div>

              <span className="text-xs font-bold text-slate-800">
                {item.value}
              </span>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}