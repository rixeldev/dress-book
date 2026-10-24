import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "@react-native-firebase/firestore"
import type { OrgMember, OrgSuggestion } from "@/interfaces/Organization"

const db = getFirestore()

export async function getOrgMembers(ownerId: string): Promise<OrgMember[]> {
  const snapshot = await getDocs(collection(db, "users", ownerId, "orgMembers"))
  return snapshot.docs.map((d: { id: string; data: () => unknown }) => ({
    ...(d.data() as OrgMember),
    uid: d.id,
  }))
}

export async function addOrgMember(ownerId: string, member: OrgMember): Promise<void> {
  await setDoc(doc(db, "users", ownerId, "orgMembers", member.uid), {
    ...member,
    joinedAt: member.joinedAt || new Date().toISOString(),
  })
}

export async function removeOrgMember(ownerId: string, memberUid: string): Promise<void> {
  await deleteDoc(doc(db, "users", ownerId, "orgMembers", memberUid))
}

export async function isOrgMember(ownerId: string, memberUid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", ownerId, "orgMembers", memberUid))
  return snap.exists()
}

export async function getSuggestions(ownerId: string): Promise<OrgSuggestion[]> {
  const snapshot = await getDocs(collection(db, "users", ownerId, "suggestions"))
  return snapshot.docs
    .map((d: { id: string; data: () => unknown }) => ({ ...(d.data() as OrgSuggestion), id: d.id }))
    .sort((a: OrgSuggestion, b: OrgSuggestion) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function createSuggestion(
  ownerId: string,
  input: Omit<OrgSuggestion, "id" | "orgOwnerId" | "status" | "createdAt" | "reviewedAt">,
): Promise<OrgSuggestion> {
  const id = `suggestion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const suggestion: OrgSuggestion = {
    id,
    orgOwnerId: ownerId,
    memberUid: input.memberUid,
    memberEmail: input.memberEmail,
    type: input.type,
    targetId: input.targetId,
    changes: input.changes,
    status: "pending",
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  }
  await setDoc(doc(db, "users", ownerId, "suggestions", id), suggestion)
  return suggestion
}

export async function reviewSuggestion(
  ownerId: string,
  suggestionId: string,
  status: "accepted" | "rejected",
): Promise<void> {
  await setDoc(
    doc(db, "users", ownerId, "suggestions", suggestionId),
    { status, reviewedAt: new Date().toISOString() },
    { merge: true },
  )
}

export async function setOrgProfile(userId: string, orgName: string, inviteCode: string): Promise<void> {
  await setDoc(
    doc(db, "users", userId),
    { orgName, inviteCode, updatedAt: new Date().toISOString() },
    { merge: true },
  )
}

export async function getOrgProfile(userId: string): Promise<{ orgName: string | null; inviteCode: string | null }> {
  const snap = await getDoc(doc(db, "users", userId))
  const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
  return {
    orgName: (data.orgName as string) ?? null,
    inviteCode: (data.inviteCode as string) ?? userId,
  }
}
