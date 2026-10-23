export type CurrencyCode = "USD" | "EUR" | "GBP"

export function toMinorUnits(amount: number, currency: CurrencyCode): number {
  return Math.round(amount * 100)
}

export function fromMinorUnits(amount: number, currency: CurrencyCode): number {
  return amount / 100
}

export function roundMoney(value: number, precision = 2): number {
  return Math.round(value * 10 ** precision) / 10 ** precision
}

export function formatMoney(amount: number | null | undefined, currency: CurrencyCode, locale = "en-US"): string {
  if (amount === null || amount === undefined) return "—"
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  })
  return formatter.format(roundMoney(amount))
}

export function calculateBalance(price: number | null, deposit: number | null): number | null {
  if (price === null || deposit === null) return null
  return roundMoney(price - deposit)
}

export function calculateDepositPercentage(price: number | null, deposit: number | null): number | null {
  if (price === null || price === 0 || deposit === null) return null
  return roundMoney((deposit / price) * 100, 1)
}
