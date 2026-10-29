import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

import Loading from "./Loading";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription =
    "There are no records to display.",
  onRowClick,
  sortBy,
  sortDirection = "asc",
  onSort,
  rowKey = "id",
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <Loading text="Loading records..." />
      </div>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const getRowKey = (row, index) => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }

    return row[rowKey] ?? index;
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {columns.map((column) => {
                const sortable =
                  column.sortable !== false &&
                  Boolean(onSort);

                const active =
                  sortBy === column.key;

                return (
                  <th
                    key={column.key}
                    className={`
                      px-5
                      py-4
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                      ${column.headerClassName || ""}
                    `}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSort(column.key)
                        }
                        className="inline-flex items-center gap-1.5 transition hover:text-slate-900"
                      >
                        {column.label}

                        {active ? (
                          sortDirection ===
                          "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown
                              size={14}
                            />
                          )
                        ) : (
                          <ChevronDown
                            size={13}
                            className="text-slate-300"
                          />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                key={getRowKey(
                  row,
                  rowIndex
                )}
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    rowIndex * 0.025,
                }}
                onClick={() =>
                  onRowClick?.(row)
                }
                className={`
                  group
                  border-b
                  border-slate-100
                  last:border-0
                  ${
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/80"
                      : ""
                  }
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-5
                      py-4
                      text-sm
                      text-slate-700
                      ${column.cellClassName || ""}
                    `}
                  >
                    {column.render
                      ? column.render(
                          row,
                          rowIndex
                        )
                      : row[column.key] ?? (
                          <span className="text-slate-300">
                            —
                          </span>
                        )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <p className="text-xs text-slate-400">
          {data.length}{" "}
          {data.length === 1
            ? "record"
            : "records"}
        </p>

        <MoreHorizontal
          size={17}
          className="text-slate-300"
        />
      </div>
    </div>
  );
}