import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useStorage } from "@/hooks/useStorage"

interface OnboardingContextValue {
  complete: boolean | null
  markComplete: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { getItem, setItem } = useStorage()
  const [complete, setComplete] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setComplete(null)
      return
    }

    const loadOnboarding = async () => {
      const storageKey = `onboarding:${user.uid}`
      const storedValue = await getItem(storageKey)
      if (storedValue === "complete") {
        setComplete(true)
        return
      }

      const legacyRegs = await getItem("regs")
      const hasLegacyData = legacyRegs ? JSON.parse(legacyRegs).length > 0 : false
      if (hasLegacyData) await setItem(storageKey, "complete")
      setComplete(hasLegacyData)
    }

    loadOnboarding()
  }, [user?.uid])

  return (
    <OnboardingContext.Provider value={{ complete, markComplete: () => setComplete(true) }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }

  return context
}
