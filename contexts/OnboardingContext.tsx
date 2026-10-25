import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useStorage } from "@/hooks/useStorage"
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore"

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

      // Fallback: check Firestore profile (survives AsyncStorage clears).
      try {
        const db = getFirestore()
        const snap = await getDoc(doc(db, "users", user.uid))
        const data = snap.exists() ? (snap.data() as Record<string, unknown>) : null
        if (data?.onboardingComplete === true) {
          await setItem(storageKey, "complete")
          setComplete(true)
          return
        }
      } catch (error) {
        console.log("Onboarding Firestore check failed", error)
      }

      const legacyRegs = await getItem("regs")
      const hasLegacyData = legacyRegs ? JSON.parse(legacyRegs).length > 0 : false
      if (hasLegacyData) await setItem(storageKey, "complete")
      setComplete(hasLegacyData)
    }

    loadOnboarding()
  }, [user?.uid])

  const markComplete = () => {
    setComplete(true)
    if (user) setItem(`onboarding:${user.uid}`, "complete")
  }

  return (
    <OnboardingContext.Provider value={{ complete, markComplete }}>
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
