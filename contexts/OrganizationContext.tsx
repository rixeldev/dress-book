import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useStorage } from "@/hooks/useStorage"
import {
  getOrgMembers,
  addOrgMember,
  removeOrgMember,
  isOrgMember,
  getSuggestions,
  createSuggestion,
  reviewSuggestion,
  setOrgProfile,
  getOrgProfile,
} from "@/features/organizations/repository"
import type { OrgMember, OrgSuggestion } from "@/interfaces/Organization"

interface OrganizationContextValue {
  activeOwnerId: string | null
  readOnly: boolean
  members: OrgMember[]
  suggestions: OrgSuggestion[]
  orgName: string | null
  inviteCode: string
  setActiveOrg: (ownerId: string | null) => Promise<void>
  setupOrg: (name: string) => Promise<void>
  joinOrg: (ownerId: string) => Promise<void>
  leaveOrg: () => Promise<void>
  removeMember: (memberUid: string) => Promise<void>
  submitSuggestion: (input: Omit<OrgSuggestion, "id" | "orgOwnerId" | "status" | "createdAt" | "reviewedAt" | "memberUid" | "memberEmail"> & { targetId: string | null }) => Promise<void>
  reviewSuggestion: (id: string, status: "accepted" | "rejected") => Promise<void>
  refresh: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { getItem, setItem } = useStorage()
  const [activeOwnerId, setActiveOwnerIdState] = useState<string | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [suggestions, setSuggestions] = useState<OrgSuggestion[]>([])
  const [orgName, setOrgName] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState("")

  const ownerId = activeOwnerId ?? user?.uid ?? null
  const readOnly = Boolean(activeOwnerId && activeOwnerId !== user?.uid)

  const refresh = useCallback(async () => {
    if (!user) return
    const stored = await getItem("active_org")
    const active = stored && stored !== user.uid ? stored : null
    setActiveOwnerIdState(active)

    const target = active ?? user.uid
    const profile = await getOrgProfile(target)
    setOrgName(profile.orgName)
    setInviteCode(profile.inviteCode ?? target)

    if (target === user.uid) {
      setMembers(await getOrgMembers(user.uid))
      setSuggestions(await getSuggestions(user.uid))
    } else {
      setMembers(await getOrgMembers(target))
      setSuggestions([])
    }
  }, [user, getItem])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActiveOrg = useCallback(
    async (ownerIdValue: string | null) => {
      if (ownerIdValue && ownerIdValue !== user?.uid) {
        await setItem("active_org", ownerIdValue)
      } else {
        await setItem("active_org", "")
      }
      await refresh()
    },
    [user, setItem, refresh],
  )

  const setupOrg = useCallback(
    async (name: string) => {
      if (!user) return
      await setOrgProfile(user.uid, name, user.uid)
      await refresh()
    },
    [user, refresh],
  )

  const joinOrg = useCallback(
    async (ownerIdValue: string) => {
      if (!user) return
      const ok = await isOrgMember(ownerIdValue, user.uid)
      if (!ok) {
        await addOrgMember(ownerIdValue, {
          uid: user.uid,
          email: user.email ?? null,
          role: "member",
          status: "active",
          joinedAt: new Date().toISOString(),
        })
      }
      await setActiveOrg(ownerIdValue)
    },
    [user, setActiveOrg],
  )

  const leaveOrg = useCallback(async () => {
    await setActiveOrg(null)
  }, [setActiveOrg])

  const removeMember = useCallback(
    async (memberUid: string) => {
      if (!user) return
      await removeOrgMember(user.uid, memberUid)
      await refresh()
    },
    [user, refresh],
  )

  const submitSuggestion = useCallback(
    async (input: Omit<OrgSuggestion, "id" | "orgOwnerId" | "status" | "createdAt" | "reviewedAt" | "memberUid" | "memberEmail"> & { targetId: string | null }) => {
      if (!user || !activeOwnerId) return
      await createSuggestion(activeOwnerId, {
        memberUid: user.uid,
        memberEmail: user.email ?? null,
        type: input.type,
        targetId: input.targetId,
        changes: input.changes,
      })
      await refresh()
    },
    [user, activeOwnerId, refresh],
  )

  const review = useCallback(
    async (id: string, status: "accepted" | "rejected") => {
      if (!user) return
      await reviewSuggestion(user.uid, id, status)
      await refresh()
    },
    [user, refresh],
  )

  const value: OrganizationContextValue = {
    activeOwnerId,
    readOnly,
    members,
    suggestions,
    orgName,
    inviteCode,
    setActiveOrg,
    setupOrg,
    joinOrg,
    leaveOrg,
    removeMember,
    submitSuggestion,
    reviewSuggestion: review,
    refresh,
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext)
  if (!context) throw new Error("useOrganization must be used within OrganizationProvider")
  return context
}

export function useEffectiveOwnerId(): string {
  const { user } = useAuth()
  const { activeOwnerId } = useOrganization()
  return activeOwnerId ?? user?.uid ?? ""
}
