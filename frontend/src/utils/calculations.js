export function calculateSubtotal(items = []) {

  return items.reduce(
    (total, item) => {

      const quantity =
        Number(item.quantity) || 0;

      const price =
        Number(item.price) || 0;

      return total + quantity * price;

    },
    0
  );

}

export function calculateDiscount(
  subtotal,
  discount = 0,
  type = "amount"
) {

  if (type === "percentage") {

    return (
      subtotal *
      (Number(discount) / 100)
    );

  }

  return Number(discount) || 0;
}

export function calculateTax(
  amount,
  taxRate = 0
) {

  return (
    amount *
    (Number(taxRate) / 100)
  );

}

export function calculateInvoiceTotal({
  items = [],
  discount = 0,
  discountType = "amount",
  taxRate = 0,
  shipping = 0,
  adjustment = 0,
}) {

  const subtotal =
    calculateSubtotal(items);

  const discountAmount =
    calculateDiscount(
      subtotal,
      discount,
      discountType
    );

  const taxableAmount =
    Math.max(
      0,
      subtotal - discountAmount
    );

  const tax =
    calculateTax(
      taxableAmount,
      taxRate
    );

  const total =
    taxableAmount +
    tax +
    Number(shipping || 0) +
    Number(adjustment || 0);

  return {

    subtotal,

    discount:
      discountAmount,

    taxableAmount,

    tax,

    shipping:
      Number(shipping || 0),

    adjustment:
      Number(adjustment || 0),

    total,

  };

}