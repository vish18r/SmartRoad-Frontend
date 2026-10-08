// Single shared currency formatting utility. Reuse this everywhere a rupee amount is
// displayed instead of formatting amounts individually in each component.

/** "₹20,500.00" from a number. Null/undefined/NaN render as "₹0.00". */
export function formatINR(amount?: number | null): string {
  const value = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** "8.50" from a number of hours or days, always with two decimal places. */
export function formatNumber(value?: number | null): string {
  const resolved = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return resolved.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
