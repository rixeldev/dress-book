import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth"
import { auth } from "@/db/firebaseConfig"

interface AuthContextValue {
  user: FirebaseAuthTypes.User | null
  initializing: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(auth.currentUser)
  const [initializing, setInitializing] = useState(true)
  const [, setUserVersion] = useState(0)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setInitializing(false)
    })

    return unsubscribe
  }, [])

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      setUser(null)
      return
    }

    await currentUser.reload()
    setUser(auth.currentUser)
    setUserVersion((version) => version + 1)
  }, [])

  return (
    <AuthContext.Provider value={{ user, initializing, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
