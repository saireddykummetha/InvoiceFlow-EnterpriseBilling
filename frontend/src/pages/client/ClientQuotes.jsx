import {
  useMemo,
  useState,
} from "react";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useQuotes from "../../../hooks/useQuotes";

export default function ClientQuotes() {
  const navigate = useNavigate();

  const {
    quotes = [],
    loading,
    error,
    reload,
  } = useQuotes();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const filteredQuotes =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return quotes.filter(
        (quote) => {
          const number =
            String(
              quote?.number ||
              quote?.quote_number ||
              quote?.quoteNumber ||
              quote?.id ||
              ""
            );

          const title =
            String(
              quote?.title ||
              quote?.description ||
              quote?.subject ||
              ""
            );

          const quoteStatus =
            String(
              quote?.status ||
              "Pending"
            );

          const matchesSearch =
            !query ||
            number
              .toLowerCase()
              .includes(query) ||
            title
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            status === "All" ||
            quoteStatus
              .toLowerCase() ===
            status.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      quotes,
      search,
      status,
    ]);

  const totalQuotes =
    quotes.length;

  const approvedQuotes =
    quotes.filter(
      (quote) =>
        String(
          quote?.status || ""
        ).toLowerCase() ===
        "approved"
    ).length;

  const pendingQuotes =
    quotes.filter(
      (quote) =>
        String(
          quote?.status || ""
        ).toLowerCase() ===
        "pending"
    ).length;

  const money = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span className="text-sm font-medium">
            Loading quotes...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">

      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FileText size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  My Quotes
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View quotations received from the business.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => reload()}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <SummaryCard
            title="Total Quotes"
            value={totalQuotes}
          />

          <SummaryCard
            title="Approved"
            value={approvedQuotes}
          />

          <SummaryCard
            title="Pending"
            value={pendingQuotes}
          />

        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search quotes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 outline-none"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>

          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Quote
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Expiry
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredQuotes.map(
                  (quote) => {
                    const number =
                      quote?.number ||
                      quote?.quote_number ||
                      quote?.quoteNumber ||
                      `QT-${quote?.id}`;

                    const description =
                      quote?.title ||
                      quote?.description ||
                      quote?.subject ||
                      "—";

                    const amount =
                      quote?.total ??
                      quote?.grand_total ??
                      quote?.total_amount ??
                      quote?.amount ??
                      0;

                    const expiry =
                      quote?.expiry_date ||
                      quote?.expiry ||
                      quote?.valid_until ||
                      "—";

                    return (
                      <tr
                        key={
                          quote.id
                        }
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {number}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {quote?.date ||
                              quote?.created_at ||
                              ""}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {description}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                          {money(
                            amount
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {expiry}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              quote?.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/client/quotes/${quote.id}`
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye
                              size={
                                17
                              }
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">

            {filteredQuotes.map(
              (quote) => {
                const number =
                  quote?.number ||
                  quote?.quote_number ||
                  quote?.quoteNumber ||
                  `QT-${quote?.id}`;

                const description =
                  quote?.title ||
                  quote?.description ||
                  quote?.subject ||
                  "—";

                const amount =
                  quote?.total ??
                  quote?.grand_total ??
                  quote?.total_amount ??
                  quote?.amount ??
                  0;

                const expiry =
                  quote?.expiry_date ||
                  quote?.expiry ||
                  quote?.valid_until ||
                  "—";

                return (
                  <div
                    key={
                      quote.id
                    }
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {number}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {description}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          quote?.status
                        }
                      />
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {money(
                            amount
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Expires{" "}
                          {expiry}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/client/quotes/${quote.id}`
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      >
                        <ArrowUpRight
                          size={
                            17
                          }
                        />
                      </button>
                    </div>
                  </div>
                );
              }
            )}

          </div>

          {filteredQuotes.length === 0 && (
            <div className="px-6 py-16 text-center">
              <FileText
                size={28}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-slate-900">
                No quotes found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your quotations will appear here when they are created.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized =
    String(
      status || "Pending"
    ).toLowerCase();

  if (normalized === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock3 size={14} />
      Pending
    </span>
  );
}