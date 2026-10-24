import type { ImageSourcePropType } from "react-native"

export interface CountryOption {
  /** ISO 3166-1 alpha-2 code, lowercase to match the flag asset names. */
  code: string
  name: string
  currency: string
  flag: ImageSourcePropType
}

/**
 * Curated country list. It covers every major trade currency plus the regions
 * where Dress Book is most likely to be used, which keeps the flag bundle small
 * (the artwork ships all 254 flags).
 */
export const COUNTRIES: CountryOption[] = [
  { code: "us", name: "United States", currency: "USD", flag: require("../assets/flags/us.png") },
  { code: "ca", name: "Canada", currency: "CAD", flag: require("../assets/flags/ca.png") },
  { code: "mx", name: "Mexico", currency: "MXN", flag: require("../assets/flags/mx.png") },
  {
    code: "do",
    name: "Dominican Republic",
    currency: "DOP",
    flag: require("../assets/flags/do.png"),
  },
  { code: "pr", name: "Puerto Rico", currency: "USD", flag: require("../assets/flags/pr.png") },
  { code: "gt", name: "Guatemala", currency: "GTQ", flag: require("../assets/flags/gt.png") },
  { code: "cr", name: "Costa Rica", currency: "CRC", flag: require("../assets/flags/cr.png") },
  { code: "pa", name: "Panama", currency: "PAB", flag: require("../assets/flags/pa.png") },
  { code: "cu", name: "Cuba", currency: "CUP", flag: require("../assets/flags/cu.png") },
  { code: "co", name: "Colombia", currency: "COP", flag: require("../assets/flags/co.png") },
  { code: "ve", name: "Venezuela", currency: "VES", flag: require("../assets/flags/ve.png") },
  { code: "ec", name: "Ecuador", currency: "USD", flag: require("../assets/flags/ec.png") },
  { code: "pe", name: "Peru", currency: "PEN", flag: require("../assets/flags/pe.png") },
  { code: "bo", name: "Bolivia", currency: "BOB", flag: require("../assets/flags/bo.png") },
  { code: "py", name: "Paraguay", currency: "PYG", flag: require("../assets/flags/py.png") },
  { code: "uy", name: "Uruguay", currency: "UYU", flag: require("../assets/flags/uy.png") },
  { code: "ar", name: "Argentina", currency: "ARS", flag: require("../assets/flags/ar.png") },
  { code: "cl", name: "Chile", currency: "CLP", flag: require("../assets/flags/cl.png") },
  { code: "br", name: "Brazil", currency: "BRL", flag: require("../assets/flags/br.png") },
  { code: "gb", name: "United Kingdom", currency: "GBP", flag: require("../assets/flags/gb.png") },
  { code: "ie", name: "Ireland", currency: "EUR", flag: require("../assets/flags/ie.png") },
  { code: "fr", name: "France", currency: "EUR", flag: require("../assets/flags/fr.png") },
  { code: "es", name: "Spain", currency: "EUR", flag: require("../assets/flags/es.png") },
  { code: "pt", name: "Portugal", currency: "EUR", flag: require("../assets/flags/pt.png") },
  { code: "de", name: "Germany", currency: "EUR", flag: require("../assets/flags/de.png") },
  { code: "it", name: "Italy", currency: "EUR", flag: require("../assets/flags/it.png") },
  { code: "nl", name: "Netherlands", currency: "EUR", flag: require("../assets/flags/nl.png") },
  { code: "be", name: "Belgium", currency: "EUR", flag: require("../assets/flags/be.png") },
  { code: "at", name: "Austria", currency: "EUR", flag: require("../assets/flags/at.png") },
  { code: "ch", name: "Switzerland", currency: "CHF", flag: require("../assets/flags/ch.png") },
  { code: "se", name: "Sweden", currency: "SEK", flag: require("../assets/flags/se.png") },
  { code: "no", name: "Norway", currency: "NOK", flag: require("../assets/flags/no.png") },
  { code: "dk", name: "Denmark", currency: "DKK", flag: require("../assets/flags/dk.png") },
  { code: "fi", name: "Finland", currency: "EUR", flag: require("../assets/flags/fi.png") },
  { code: "pl", name: "Poland", currency: "PLN", flag: require("../assets/flags/pl.png") },
  { code: "cz", name: "Czechia", currency: "CZK", flag: require("../assets/flags/cz.png") },
  { code: "hu", name: "Hungary", currency: "HUF", flag: require("../assets/flags/hu.png") },
  { code: "ro", name: "Romania", currency: "RON", flag: require("../assets/flags/ro.png") },
  { code: "gr", name: "Greece", currency: "EUR", flag: require("../assets/flags/gr.png") },
  { code: "tr", name: "Türkiye", currency: "TRY", flag: require("../assets/flags/tr.png") },
  { code: "ru", name: "Russia", currency: "RUB", flag: require("../assets/flags/ru.png") },
  { code: "ua", name: "Ukraine", currency: "UAH", flag: require("../assets/flags/ua.png") },
  { code: "ma", name: "Morocco", currency: "MAD", flag: require("../assets/flags/ma.png") },
  { code: "tn", name: "Tunisia", currency: "TND", flag: require("../assets/flags/tn.png") },
  { code: "eg", name: "Egypt", currency: "EGP", flag: require("../assets/flags/eg.png") },
  { code: "ng", name: "Nigeria", currency: "NGN", flag: require("../assets/flags/ng.png") },
  { code: "gh", name: "Ghana", currency: "GHS", flag: require("../assets/flags/gh.png") },
  { code: "ke", name: "Kenya", currency: "KES", flag: require("../assets/flags/ke.png") },
  { code: "za", name: "South Africa", currency: "ZAR", flag: require("../assets/flags/za.png") },
  { code: "sa", name: "Saudi Arabia", currency: "SAR", flag: require("../assets/flags/sa.png") },
  {
    code: "ae",
    name: "United Arab Emirates",
    currency: "AED",
    flag: require("../assets/flags/ae.png"),
  },
  { code: "qa", name: "Qatar", currency: "QAR", flag: require("../assets/flags/qa.png") },
  { code: "il", name: "Israel", currency: "ILS", flag: require("../assets/flags/il.png") },
  { code: "in", name: "India", currency: "INR", flag: require("../assets/flags/in.png") },
  { code: "pk", name: "Pakistan", currency: "PKR", flag: require("../assets/flags/pk.png") },
  { code: "bd", name: "Bangladesh", currency: "BDT", flag: require("../assets/flags/bd.png") },
  { code: "cn", name: "China", currency: "CNY", flag: require("../assets/flags/cn.png") },
  { code: "jp", name: "Japan", currency: "JPY", flag: require("../assets/flags/jp.png") },
  { code: "kr", name: "South Korea", currency: "KRW", flag: require("../assets/flags/kr.png") },
  { code: "tw", name: "Taiwan", currency: "TWD", flag: require("../assets/flags/tw.png") },
  { code: "hk", name: "Hong Kong", currency: "HKD", flag: require("../assets/flags/hk.png") },
  { code: "sg", name: "Singapore", currency: "SGD", flag: require("../assets/flags/sg.png") },
  { code: "my", name: "Malaysia", currency: "MYR", flag: require("../assets/flags/my.png") },
  { code: "th", name: "Thailand", currency: "THB", flag: require("../assets/flags/th.png") },
  { code: "vn", name: "Vietnam", currency: "VND", flag: require("../assets/flags/vn.png") },
  { code: "id", name: "Indonesia", currency: "IDR", flag: require("../assets/flags/id.png") },
  { code: "ph", name: "Philippines", currency: "PHP", flag: require("../assets/flags/ph.png") },
  { code: "au", name: "Australia", currency: "AUD", flag: require("../assets/flags/au.png") },
  { code: "nz", name: "New Zealand", currency: "NZD", flag: require("../assets/flags/nz.png") },
]

export const CURRENCIES = Array.from(new Set(COUNTRIES.map((country) => country.currency))).sort()

export const DEFAULT_COUNTRY: CountryOption =
  COUNTRIES.find((country) => country.code === "us") ?? COUNTRIES[0]

export function findCountry(code: string | null | undefined): CountryOption | undefined {
  if (!code) return undefined
  const normalized = code.toLowerCase()
  return COUNTRIES.find((country) => country.code === normalized)
}

export function countryName(code: string | null | undefined, locale = "en"): string {
  const country = findCountry(code)
  if (country) {
    try {
      return new Intl.DisplayNames([locale], { type: "region" }).of(country.code.toUpperCase()) ?? country.name
    } catch {
      return country.name
    }
  }
  return code?.toUpperCase() ?? "—"
}

export function currencyForCountry(code: string | null | undefined): string {
  return findCountry(code)?.currency ?? DEFAULT_COUNTRY.currency
}
