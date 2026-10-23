import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import NetInfo from "@react-native-community/netinfo"

interface SyncContextValue {
  isOnline: boolean
  hasPendingWrites: boolean
  syncStatus: "synced" | "pending" | "offline" | "error"
  markPending: () => void
  markSynced: () => void
  markError: () => void
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined)

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false)
    })
    return unsubscribe
  }, [])

  const syncStatus: SyncContextValue["syncStatus"] = hasError
    ? "error"
    : !isOnline
      ? "offline"
      : hasPendingWrites
        ? "pending"
        : "synced"

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        hasPendingWrites,
        syncStatus,
        markPending: () => setHasPendingWrites(true),
        markSynced: () => {
          setHasPendingWrites(false)
          setHasError(false)
        },
        markError: () => setHasError(true),
      }}
    >
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider")
  }
  return context
}
