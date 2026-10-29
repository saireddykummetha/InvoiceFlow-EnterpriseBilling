import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import Input from "../common/Input";

export default function QuoteItems({
  items = [],
  onChange,
  onRemove,
}) {
  return (
    <div className="space-y-3">
      {/* DESKTOP HEADER */}

      <div className="hidden grid-cols-[minmax(220px,1fr)_110px_140px_110px_120px_40px] gap-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
        <span>Description</span>
        <span>Quantity</span>
        <span>Rate</span>
        <span>Tax %</span>
        <span>Amount</span>
        <span />
      </div>

      {items.map(
        (item, index) => {
          const amount =
            (Number(
              item.quantity
            ) || 0) *
            (Number(item.rate) || 0);

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 lg:grid lg:grid-cols-[minmax(220px,1fr)_110px_140px_110px_120px_40px] lg:items-end lg:gap-3 lg:border-0 lg:bg-slate-50/70"
            >
              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 lg:hidden">
                  Item {index + 1} · Description
                </label>

                <Input
                  name={`description-${item.id}`}
                  value={
                    item.description
                  }
                  onChange={(event) =>
                    onChange(
                      item.id,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Service or product description"
                />
              </div>

              {/* QUANTITY */}

              <div className="mt-3 lg:mt-0">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 lg:hidden">
                  Quantity
                </label>

                <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        item.id,
                        "quantity",
                        Math.max(
                          1,
                          Number(
                            item.quantity
                          ) - 1
                        )
                      )
                    }
                    className="flex w-8 items-center justify-center text-slate-400 hover:bg-slate-50"
                  >
                    <Minus size={13} />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={
                      item.quantity
                    }
                    onChange={(event) =>
                      onChange(
                        item.id,
                        "quantity",
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 border-x border-slate-200 text-center text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        item.id,
                        "quantity",
                        Number(
                          item.quantity
                        ) + 1
                      )
                    }
                    className="flex w-8 items-center justify-center text-slate-400 hover:bg-slate-50"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* RATE */}

              <div className="mt-3 lg:mt-0">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 lg:hidden">
                  Rate
                </label>

                <Input
                  name={`rate-${item.id}`}
                  type="number"
                  min="0"
                  value={item.rate}
                  onChange={(event) =>
                    onChange(
                      item.id,
                      "rate",
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                />
              </div>

              {/* TAX */}

              <div className="mt-3 lg:mt-0">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 lg:hidden">
                  Tax %
                </label>

                <Input
                  name={`tax-${item.id}`}
                  type="number"
                  min="0"
                  value={
                    item.taxRate
                  }
                  onChange={(event) =>
                    onChange(
                      item.id,
                      "taxRate",
                      event.target.value
                    )
                  }
                  placeholder="18"
                />
              </div>

              {/* AMOUNT */}

              <div className="mt-4 lg:mt-0">
                <p className="mb-1.5 text-xs font-semibold text-slate-600 lg:hidden">
                  Amount
                </p>

                <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900">
                  ₹
                  {amount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>

              {/* DELETE */}

              <div className="mt-3 flex justify-end lg:mt-0">
                <button
                  type="button"
                  onClick={() =>
                    onRemove?.(item.id)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove item"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}