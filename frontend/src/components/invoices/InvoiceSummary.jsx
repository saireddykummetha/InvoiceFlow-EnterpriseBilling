import {
  Calculator,
  CircleDollarSign,
} from "lucide-react";
import useSettings from "../../hooks/useSettings";

export default function InvoiceSummary({
  calculations = {},
}) {
  const { formatCurrency } = useSettings();
  const {
    subtotal = 0,
    itemDiscount = 0,
    invoiceDiscount = 0,
    taxableSubtotal = 0,
    tax = 0,
    shipping = 0,
    adjustment = 0,
    roundOff = 0,
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
            Invoice summary
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Live calculation
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SummaryRow
          label="Subtotal"
          value={subtotal}
          formatCurrency={formatCurrency}
        />

        {itemDiscount !== 0 && (
          <SummaryRow
            label="Item discount"
            value={-itemDiscount}
            negative
            formatCurrency={formatCurrency}
          />
        )}

        {invoiceDiscount !==
          0 && (
          <SummaryRow
            label="Discount"
            value={-invoiceDiscount}
            negative
            formatCurrency={formatCurrency}
          />
        )}

        <SummaryRow
          label="Taxable subtotal"
          value={taxableSubtotal}
          formatCurrency={formatCurrency}
        />

        <SummaryRow
          label="Tax"
          value={tax}
          formatCurrency={formatCurrency}
        />

        {shipping !== 0 && (
          <SummaryRow
            label="Shipping"
            value={shipping}
            formatCurrency={formatCurrency}
          />
        )}

        {adjustment !==
          0 && (
          <SummaryRow
            label="Adjustment"
            value={adjustment}
            formatCurrency={formatCurrency}
          />
        )}

        {roundOff !== 0 && (
          <SummaryRow
            label="Round off"
            value={roundOff}
            formatCurrency={formatCurrency}
          />
        )}

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-base font-bold text-white">
              Grand total
            </span>

            <span className="text-xl font-black text-indigo-400">
              {formatCurrency(grandTotal)}
            </span>
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