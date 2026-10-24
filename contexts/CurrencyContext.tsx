import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import * as RNLocalize from "react-native-localize"
import { useStorage } from "@/hooks/useStorage"
import {
  DEFAULT_COUNTRY,
  currencyForCountry,
  findCountry,
  type CountryOption,
} from "@/libs/countries"

interface CurrencyContextValue {
  /** False until the stored preference (or device region) has been resolved. */
  ready: boolean
  country: CountryOption
  currency: string
  setCountry: (code: string) => Promise<void>
  setCurrency: (code: string) => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

const isCurrencyCode = (value: string | null) => Boolean(value && /^[A-Z]{3}$/.test(value))

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { getItem, setItem } = useStorage()
  const [ready, setReady] = useState(false)
  const [country, setCountryState] = useState<CountryOption>(DEFAULT_COUNTRY)
  const [currency, setCurrencyState] = useState(DEFAULT_COUNTRY.currency)

  useEffect(() => {
    let active = true

    const load = async () => {
      const [savedCountryCode, savedCurrency] = await Promise.all([
        getItem("country"),
        getItem("currency"),
      ])
      if (!active) return

      let nextCountry = findCountry(savedCountryCode)

      if (!nextCountry) {
        nextCountry = findCountry(RNLocalize.getCountry()) ?? DEFAULT_COUNTRY
        await setItem("country", nextCountry.code)
      }

      const nextCurrency = isCurrencyCode(savedCurrency)
        ? (savedCurrency as string)
        : nextCountry.currency
      if (!isCurrencyCode(savedCurrency)) await setItem("currency", nextCurrency)

      if (!active) return
      setCountryState(nextCountry)
      setCurrencyState(nextCurrency)
      setReady(true)
    }

    load()

    return () => {
      active = false
    }
  }, [getItem, setItem])

  const setCountry = useCallback(
    async (code: string) => {
      const nextCountry = findCountry(code) ?? DEFAULT_COUNTRY
      const nextCurrency = nextCountry.currency
      setCountryState(nextCountry)
      setCurrencyState(nextCurrency)
      await Promise.all([setItem("country", nextCountry.code), setItem("currency", nextCurrency)])
    },
    [setItem],
  )

  const setCurrency = useCallback(
    async (code: string) => {
      const nextCurrency = isCurrencyCode(code) ? code : currencyForCountry(country.code)
      setCurrencyState(nextCurrency)
      await setItem("currency", nextCurrency)
    },
    [country.code, setItem],
  )

  const value = useMemo(
    () => ({ ready, country, currency, setCountry, setCurrency }),
    [ready, country, currency, setCountry, setCurrency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
