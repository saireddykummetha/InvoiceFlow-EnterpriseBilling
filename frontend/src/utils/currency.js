/**
 * Dynamic currency formatter.
 * All formatting values (symbol, separators, decimals, position) are passed in
 * explicitly from the SettingsContext — never hardcoded here.
 *
 * @param {number} amount
 * @param {string} symbol        - currency symbol from settings (e.g. "₹")
 * @param {number} decimals      - decimal places from settings (e.g. 2)
 * @param {string} thousandSep   - thousand separator from settings (e.g. ",")
 * @param {string} decimalSep    - decimal separator from settings (e.g. ".")
 * @param {string} position      - "left" or "right"
 */
export function formatCurrency(
  amount,
  symbol     = "",
  decimals   = 2,
  thousandSep = ",",
  decimalSep  = ".",
  position    = "left"
) {
  const num     = Number(amount) || 0;
  const parts   = num.toFixed(decimals).split(".");
  const intPart = thousandSep
    ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep)
    : parts[0];
  const decPart = decimals > 0 && parts[1] ? `${decimalSep}${parts[1]}` : "";
  const formatted = `${intPart}${decPart}`;

  if (!symbol) return formatted;
  return position === "right" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

export default formatCurrency;