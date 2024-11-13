import { CURRENCIES } from './constants';

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `$${amount.toFixed(2)}`; // Fallback to USD

  return `${currency.symbol}${amount.toFixed(2)}`;
}