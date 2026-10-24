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
  setOrgPublic,
  searchPublicOrgs,
  createJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@/features/organizations/repository"
import type { OrgMember, OrgSuggestion, OrgJoinRequest, PublicOrg } from "@/interfaces/Organization"

interface OrganizationContextValue {
  activeOwnerId: string | null
  readOnly: boolean
  members: OrgMember[]
  suggestions: OrgSuggestion[]
  joinRequests: OrgJoinRequest[]
  orgName: string | null
  inviteCode: string
  isPublic: boolean
  searchResults: PublicOrg[]
  setActiveOrg: (ownerId: string | null) => Promise<void>
  setupOrg: (name: string) => Promise<void>
  togglePublic: (isPublic: boolean) => Promise<void>
  joinOrg: (ownerId: string) => Promise<void>
  requestJoin: (ownerId: string) => Promise<void>
  leaveOrg: () => Promise<void>
  removeMember: (memberUid: string) => Promise<void>
  searchOrgs: (term: string) => Promise<void>
  submitSuggestion: (input: { type: OrgSuggestion["type"]; targetId: string | null; changes: Record<string, unknown> }) => Promise<void>
  reviewSuggestion: (id: string, status: "accepted" | "rejected") => Promise<void>
  approveJoinRequest: (memberUid: string, memberEmail: string | null) => Promise<void>
  rejectJoinRequest: (memberUid: string) => Promise<void>
  refresh: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { getItem, setItem } = useStorage()
  const [activeOwnerId, setActiveOwnerIdState] = useState<string | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [suggestions, setSuggestions] = useState<OrgSuggestion[]>([])
  const [joinRequests, setJoinRequests] = useState<OrgJoinRequest[]>([])
  const [orgName, setOrgName] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [searchResults, setSearchResults] = useState<PublicOrg[]>([])

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
    setIsPublic(profile.isPublic)

    if (target === user.uid) {
      setMembers(await getOrgMembers(user.uid))
      setSuggestions(await getSuggestions(user.uid))
      setJoinRequests(await getJoinRequests(user.uid))
    } else {
      setMembers(await getOrgMembers(target))
      setSuggestions([])
      setJoinRequests([])
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

  const togglePublic = useCallback(
    async (value: boolean) => {
      if (!user) return
      const name = orgName || "My Studio"
      const code = inviteCode || user.uid
      await setOrgPublic(user.uid, value, name, code)
      setIsPublic(value)
      await refresh()
    },
    [user, orgName, inviteCode, refresh],
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

  const requestJoin = useCallback(
    async (ownerIdValue: string) => {
      if (!user) return
      await createJoinRequest(ownerIdValue, user.uid, user.email ?? null)
    },
    [user],
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

  const searchOrgs = useCallback(async (term: string) => {
    const results = await searchPublicOrgs(term)
    setSearchResults(results)
  }, [])

  const submitSuggestion = useCallback(
    async (input: { type: OrgSuggestion["type"]; targetId: string | null; changes: Record<string, unknown> }) => {
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

  const approve = useCallback(
    async (memberUid: string, memberEmail: string | null) => {
      if (!user) return
      await approveJoinRequest(user.uid, memberUid, memberEmail)
      await refresh()
    },
    [user, refresh],
  )

  const reject = useCallback(
    async (memberUid: string) => {
      if (!user) return
      await rejectJoinRequest(user.uid, memberUid)
      await refresh()
    },
    [user, refresh],
  )

  const value: OrganizationContextValue = {
    activeOwnerId,
    readOnly,
    members,
    suggestions,
    joinRequests,
    orgName,
    inviteCode,
    isPublic,
    searchResults,
    setActiveOrg,
    setupOrg,
    togglePublic,
    joinOrg,
    requestJoin,
    leaveOrg,
    removeMember,
    searchOrgs,
    submitSuggestion,
    reviewSuggestion: review,
    approveJoinRequest: approve,
    rejectJoinRequest: reject,
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
