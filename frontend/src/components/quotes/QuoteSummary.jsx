import {
  Calculator,
  Percent,
} from "lucide-react";

import Input from "../common/Input";
import Select from "../common/Select";
import useSettings from "../../hooks/useSettings";

export default function QuoteSummary({
  calculations = {},
  discountType = "amount",
  discountValue = 0,
  onDiscountTypeChange,
  onDiscountValueChange,
}) {
  const { formatCurrency } = useSettings();
  const {
    subtotal = 0,
    itemDiscount = 0,
    invoiceDiscount = 0,
    taxableSubtotal = 0,
    tax = 0,
    grandTotal = 0,
  } = calculations;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Calculator size={18} />
        </div>

        <div>
          <h2 className="text-base font-bold">
            Quote summary
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Automatic calculation
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SummaryRow
          label="Subtotal"
          value={subtotal}
          formatCurrency={formatCurrency}
        />

        {itemDiscount > 0 && (
          <SummaryRow
            label="Item discount"
            value={-itemDiscount}
            negative
            formatCurrency={formatCurrency}
          />
        )}

        <div className="border-t border-white/10 pt-4">
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <Select
              label="Discount"
              name="discountType"
              value={discountType}
              onChange={(event) =>
                onDiscountTypeChange?.(
                  event.target.value
                )
              }
              options={[
                {
                  value: "amount",
                  label: "Fixed amount",
                },
                {
                  value: "percentage",
                  label: "Percentage",
                },
              ]}
            />

            <Input
              label={
                discountType ===
                "percentage"
                  ? "%"
                  : "Amount"
              }
              name="discountValue"
              type="number"
              min="0"
              value={
                discountValue
              }
              onChange={(event) =>
                onDiscountValueChange?.(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {invoiceDiscount > 0 && (
          <SummaryRow
            label="Quote discount"
            value={-invoiceDiscount}
            negative
            formatCurrency={formatCurrency}
          />
        )}

        <SummaryRow
          label="Taxable amount"
          value={taxableSubtotal}
          formatCurrency={formatCurrency}
        />

        <SummaryRow
          label="GST / Tax"
          value={tax}
          formatCurrency={formatCurrency}
        />

        <div className="border-t border-white/10 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Grand total
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-indigo-400">
                {formatCurrency(grandTotal)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Percent size={17} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  negative = false,
  formatCurrency,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${
          negative
            ? "text-red-300"
            : "text-white"
        }`}
      >
        {negative
          ? "−"
          : ""}
        {formatCurrency
          ? formatCurrency(Math.abs(Number(value || 0)))
          : `₹${Math.abs(Number(value || 0)).toFixed(2)}`}
      </span>
    </div>
  );
}