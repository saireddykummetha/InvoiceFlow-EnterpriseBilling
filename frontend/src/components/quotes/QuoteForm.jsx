import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import QuoteItems from "./QuoteItems";
import QuoteSummary from "./QuoteSummary";
import useSettings from "../../hooks/useSettings";

const createItem = (taxRate = 18) => ({
  id:
    Date.now() +
    Math.random(),
  description: "",
  quantity: 1,
  rate: 0,
  taxRate: Number(taxRate) || 0,
  discount: 0,
});

const EMPTY_FORM = {
  clientId: "",
  quoteNumber: "",
  quoteDate: new Date()
    .toISOString()
    .slice(0, 10),
  expiryDate: "",
  notes: "",
  terms: "",
  discountType: "amount",
  discountValue: 0,
  taxType: "gst",
};

export default function QuoteForm({
  initialData,
  clients = [],
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Save quote",
}) {
  const { getQuoteDefaults, settings } = useSettings();
  const [form, setForm] =
    useState(EMPTY_FORM);

  const [items, setItems] =
    useState([createItem()]);

  useEffect(() => {
    if (!initialData) {
      const defaults = getQuoteDefaults();
      setForm({
        ...EMPTY_FORM,
        quoteNumber: defaults.quoteNumber || "",
        quoteDate: defaults.issueDate,
        expiryDate: defaults.expiryDate,
        notes: defaults.notes || "",
        terms: defaults.terms || "",
        discountType: defaults.discountType || "amount",
      });
      setItems([createItem(defaults.taxRate)]);
      return;
    }

    setForm({
      ...EMPTY_FORM,
      ...initialData,
    });

    setItems(
      initialData.items?.length
        ? initialData.items
        : [createItem()]
    );
  }, [initialData, getQuoteDefaults, settings]);

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateItem = (
    itemId,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      createItem(),
    ]);
  };

  const removeItem = (itemId) => {
    if (items.length === 1) {
      toast.error(
        "At least one line item is required."
      );
      return;
    }

    setItems((previous) =>
      previous.filter(
        (item) =>
          item.id !== itemId
      )
    );
  };

  const calculations = useMemo(
    () => calculateQuote(
      items,
      form
    ),
    [items, form]
  );

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!form.clientId) {
      toast.error(
        "Please select a client."
      );
      return;
    }

    const validItems =
      items.every(
        (item) =>
          item.description.trim() &&
          Number(item.quantity) > 0 &&
          Number(item.rate) >= 0
      );

    if (!validItems) {
      toast.error(
        "Please complete all line items."
      );
      return;
    }

    const payload = {
      client: parseInt(form.clientId, 10),
      quote_number: form.quoteNumber || undefined,
      issue_date: form.quoteDate || undefined,
      expiry_date: form.expiryDate || undefined,
      notes: form.notes || "",
      terms: form.terms || "",
      status: initialData?.status || "draft",
      items: items.map((item) => ({
        description: String(item.description).trim(),
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.rate) || 0,
        tax_rate: Number(item.taxRate) || 0,
        discount: Number(item.discount) || 0,
      })),
    };

    // Remove undefined fields so backend doesn't get confused
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    await onSubmit?.(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* QUOTE INFORMATION */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FileText size={18} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Quote information
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Select the client and define quote dates.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Client"
            name="clientId"
            value={form.clientId}
            onChange={(event) =>
              updateForm(
                "clientId",
                event.target.value
              )
            }
            options={clients.map(
              (client) => ({
                value: String(
                  client.id
                ),
                label: client.name,
              })
            )}
            placeholder="Select client"
            required
          />

          <Input
            label="Quote number"
            name="quoteNumber"
            value={form.quoteNumber}
            onChange={(event) =>
              updateForm(
                "quoteNumber",
                event.target.value
              )
            }
            placeholder="QT-0001"
          />

          <Input
            label="Quote date"
            name="quoteDate"
            type="date"
            value={form.quoteDate}
            onChange={(event) =>
              updateForm(
                "quoteDate",
                event.target.value
              )
            }
          />

          <Input
            label="Expiry date"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={(event) =>
              updateForm(
                "expiryDate",
                event.target.value
              )
            }
          />
        </div>
      </section>

      {/* LINE ITEMS */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Services / line items
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Add products or services to this quote.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={addItem}
          >
            Add item
          </Button>
        </div>

        <QuoteItems
          items={items}
          onChange={updateItem}
          onRemove={removeItem}
        />
      </section>

      {/* CALCULATIONS */}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900">
            Additional information
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Optional notes and payment terms.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="label-base">
                Notes
              </label>

              <textarea
                rows={5}
                value={form.notes}
                onChange={(event) =>
                  updateForm(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Add notes for the client..."
                className="input-base min-h-[130px] resize-y"
              />
            </div>

            <div>
              <label className="label-base">
                Terms & conditions
              </label>

              <textarea
                rows={5}
                value={form.terms}
                onChange={(event) =>
                  updateForm(
                    "terms",
                    event.target.value
                  )
                }
                placeholder="Payment terms, validity, conditions..."
                className="input-base min-h-[130px] resize-y"
              />
            </div>
          </div>
        </section>

        <QuoteSummary
          calculations={calculations}
          discountType={
            form.discountType
          }
          discountValue={
            form.discountValue
          }
          onDiscountTypeChange={(
            value
          ) =>
            updateForm(
              "discountType",
              value
            )
          }
          onDiscountValueChange={(
            value
          ) =>
            updateForm(
              "discountValue",
              value
            )
          }
        />
      </div>

      {/* ACTIONS */}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
}

function calculateQuote(
  items,
  form
) {
  const normalized = items.map(
    (item) => {
      const quantity = Math.max(
        0,
        Number(item.quantity) || 0
      );

      const rate = Math.max(
        0,
        Number(item.rate) || 0
      );

      const discount = Math.max(
        0,
        Number(item.discount) || 0
      );

      const taxRate = Math.max(
        0,
        Number(item.taxRate) || 0
      );

      const gross =
        quantity * rate;

      const itemDiscount = Math.min(
        gross,
        discount
      );

      const taxable =
        gross - itemDiscount;

      const tax =
        taxable *
        (taxRate / 100);

      return {
        ...item,
        quantity,
        rate,
        discount,
        taxRate,
        amount: gross,
        taxableAmount: taxable,
        taxAmount: tax,
        total:
          taxable + tax,
      };
    }
  );

  const subtotal =
    normalized.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const itemDiscount =
    normalized.reduce(
      (sum, item) =>
        sum + item.discount,
      0
    );

  let invoiceDiscount = 0;

  if (
    form.discountType ===
    "percentage"
  ) {
    invoiceDiscount =
      Math.max(
        0,
        Number(
          form.discountValue
        ) || 0
      ) *
      Math.max(
        0,
        subtotal - itemDiscount
      ) /
      100;
  } else {
    invoiceDiscount =
      Math.max(
        0,
        Number(
          form.discountValue
        ) || 0
      );
  }

  const taxableSubtotal =
    Math.max(
      0,
      subtotal -
        itemDiscount -
        invoiceDiscount
    );

  const itemTax =
    normalized.reduce(
      (sum, item) =>
        sum + item.taxAmount,
      0
    );

  const grandTotal =
    Math.max(
      0,
      taxableSubtotal + itemTax
    );

  return {
    items: normalized,
    subtotal,
    itemDiscount,
    invoiceDiscount,
    taxableSubtotal,
    tax: itemTax,
    grandTotal,
  };
}