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
    name: "CGST",
    value: 32000,
  },
  {
    name: "SGST",
    value: 32000,
  },
  {
    name: "IGST",
    value: 18000,
  },
];

const COLORS = [
  "#0f172a",
  "#64748b",
  "#94a3b8",
];

export default function TaxChart({
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
          GST distribution
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Tax collected by category
        </p>
      </div>

      <div className="relative mt-4 h-[240px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
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
              formatter={(value) =>
                `₹${Number(
                  value
                ).toLocaleString(
                  "en-IN"
                )}`
              }
              contentStyle={{
                borderRadius: 14,
                border:
                  "1px solid #e2e8f0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">
            ₹
            {total.toLocaleString(
              "en-IN"
            )}
          </span>

          <span className="mt-1 text-[10px] font-medium text-slate-400">
            Total GST
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {data.map(
          (item, index) => {
            const percentage =
              total > 0
                ? (
                    (Number(
                      item.value
                    ) /
                      total) *
                    100
                  ).toFixed(1)
                : 0;

            return (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
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

                  <span className="text-xs font-semibold text-slate-600">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">
                    {percentage}%
                  </span>

                  <span className="text-xs font-bold text-slate-800">
                    ₹
                    {Number(
                      item.value
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </motion.div>
  );
}