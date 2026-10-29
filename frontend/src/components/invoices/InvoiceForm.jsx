import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FileText,
} from "lucide-react";

import toast from "react-hot-toast";

import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

import InvoiceItems from "./InvoiceItems";
import InvoiceSummary from "./InvoiceSummary";
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

  invoiceNumber: "",

  invoiceDate: new Date()
    .toISOString()
    .slice(0, 10),

  dueDate: "",

  discountType: "amount",

  discountValue: 0,

  shipping: 0,

  adjustment: 0,

  roundOff: true,

  notes: "",

  terms: "",
};

export default function InvoiceForm({
  initialData,
  clients = [],
  quotes = [],
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Save invoice",
}) {
  const { getInvoiceDefaults, settings } = useSettings();
  const [form, setForm] =
    useState(EMPTY_FORM);

  const [items, setItems] =
    useState([createItem()]);

  useEffect(() => {
    if (!initialData) {
      const defaults = getInvoiceDefaults();
      setForm({
        ...EMPTY_FORM,
        invoiceNumber: defaults.invoiceNumber || "",
        invoiceDate: defaults.issueDate,
        dueDate: defaults.dueDate,
        notes: defaults.notes || "",
        terms: defaults.terms || "",
        roundOff: defaults.autoRoundOff ?? true,
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
  }, [initialData, getInvoiceDefaults, settings]);

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

  const removeItem = (
    itemId
  ) => {
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

  const importQuote = (
    quoteId
  ) => {
    const quote =
      quotes.find(
        (item) =>
          String(item.id) ===
          String(quoteId)
      );

    if (!quote) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      quoteId: quote.id,

      clientId:
        quote.client ||
        quote.clientId ||
        previous.clientId,

      discountType:
        quote.discountType ||
        "amount",

      discountValue:
        quote.discountValue ||
        0,

      notes:
        quote.notes ||
        previous.notes,

      terms:
        quote.terms ||
        previous.terms,
    }));

    const mappedItems = quote.items?.length
      ? quote.items.map((item) => ({
          ...createItem(),
          ...item,
          rate: item.unit_price || item.rate || 0,
          taxRate: item.tax_rate || item.taxRate || 0,
        }))
      : [createItem()];

    setItems(mappedItems);

    toast.success(
      "Quote imported into invoice."
    );
  };

  const calculations = useMemo(
    () =>
      calculateInvoice(
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

    const valid =
      items.every(
        (item) =>
          item.description.trim() &&
          Number(item.quantity) > 0 &&
          Number(item.rate) >= 0
      );

    if (!valid) {
      toast.error(
        "Please complete all invoice items."
      );
      return;
    }

    const payload = {
      client: form.clientId,
      ...(form.quoteId ? { quote: form.quoteId } : {}),
      invoice_number: form.invoiceNumber,
      issue_date: form.invoiceDate,
      due_date: form.dueDate,
      notes: form.notes,
      terms: form.terms,
      status: initialData?.status || "draft",
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.rate,
        tax_rate: item.taxRate,
        discount: item.discount,
      })),
    };

    await onSubmit?.(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* HEADER */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FileText size={18} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Invoice information
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Create an invoice manually or import an approved quote.
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

          <Select
            label="Import quote"
            name="quoteId"
            value={form.quoteId || ""}
            onChange={(event) =>
              importQuote(
                event.target.value
              )
            }
            options={quotes.map(
              (quote) => ({
                value: String(
                  quote.id
                ),
                label: `${
                  quote.quoteNumber ||
                  quote.quote_number ||
                  `QT-${quote.id}`
                } · ${
                  quote.clientName ||
                  quote.client_name ||
                  "Client"
                }`,
              })
            )}
            placeholder="Choose quote"
          />

          <Input
            label="Invoice number"
            name="invoiceNumber"
            value={
              form.invoiceNumber
            }
            onChange={(event) =>
              updateForm(
                "invoiceNumber",
                event.target.value
              )
            }
            placeholder="INV-0001"
          />

          <Input
            label="Invoice date"
            name="invoiceDate"
            type="date"
            value={
              form.invoiceDate
            }
            onChange={(event) =>
              updateForm(
                "invoiceDate",
                event.target.value
              )
            }
          />

          <Input
            label="Due date"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              updateForm(
                "dueDate",
                event.target.value
              )
            }
          />
        </div>
      </section>

      {/* ITEMS */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Invoice items
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Add services, quantities, prices and taxes.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addItem}
          >
            + Add item
          </Button>
        </div>

        <InvoiceItems
          items={items}
          onChange={updateItem}
          onRemove={removeItem}
        />
      </section>

      {/* SUMMARY */}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900">
            Invoice details
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Discounts, shipping, adjustments and notes.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Select
              label="Discount type"
              name="discountType"
              value={
                form.discountType
              }
              onChange={(event) =>
                updateForm(
                  "discountType",
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
                form.discountType ===
                "percentage"
                  ? "Discount %"
                  : "Discount amount"
              }
              name="discountValue"
              type="number"
              min="0"
              value={
                form.discountValue
              }
              onChange={(event) =>
                updateForm(
                  "discountValue",
                  event.target.value
                )
              }
            />

            <Input
              label="Shipping"
              name="shipping"
              type="number"
              min="0"
              value={form.shipping}
              onChange={(event) =>
                updateForm(
                  "shipping",
                  event.target.value
                )
              }
            />

            <Input
              label="Adjustment"
              name="adjustment"
              type="number"
              value={
                form.adjustment
              }
              onChange={(event) =>
                updateForm(
                  "adjustment",
                  event.target.value
                )
              }
              hint="Use negative value for deduction."
            />
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input
              type="checkbox"
              checked={
                form.roundOff
              }
              onChange={(event) =>
                updateForm(
                  "roundOff",
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm font-medium text-slate-700">
              Apply round off
            </span>
          </label>

          <div className="mt-6 space-y-5">
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) =>
                updateForm(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Customer notes..."
              className="input-base resize-y"
            />

            <textarea
              rows={4}
              value={form.terms}
              onChange={(event) =>
                updateForm(
                  "terms",
                  event.target.value
                )
              }
              placeholder="Terms & conditions..."
              className="input-base resize-y"
            />
          </div>
        </section>

        <InvoiceSummary
          calculations={calculations}
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

function calculateInvoice(
  items,
  form
) {
  const normalized =
    items.map((item) => {
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

      const amount =
        quantity * rate;

      const taxable =
        Math.max(
          0,
          amount - discount
        );

      const tax =
        taxable *
        (taxRate / 100);

      return {
        ...item,
        quantity,
        rate,
        discount,
        taxRate,
        amount,
        taxableAmount: taxable,
        taxAmount: tax,
        total:
          taxable + tax,
      };
    });

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

  const tax =
    normalized.reduce(
      (sum, item) =>
        sum + item.taxAmount,
      0
    );

  const shipping = Math.max(
    0,
    Number(form.shipping) || 0
  );

  const adjustment =
    Number(form.adjustment) || 0;

  const beforeRound =
    taxableSubtotal +
    tax +
    shipping +
    adjustment;

  const rounded =
    form.roundOff
      ? Math.round(
          beforeRound
        )
      : beforeRound;

  const roundOff =
    rounded - beforeRound;

  return {
    items: normalized,

    subtotal,

    itemDiscount,

    invoiceDiscount,

    taxableSubtotal,

    tax,

    shipping,

    adjustment,

    roundOff,

    grandTotal: Math.max(
      0,
      rounded
    ),
  };
}