const fs = require("fs")
const additions = `

export async function setOrgPublic(userId: string, isPublic: boolean, orgName: string, inviteCode: string): Promise<void> {
  await setDoc(doc(db, "users", userId), { isPublic, orgName, inviteCode, updatedAt: new Date().toISOString() }, { merge: true })
  if (isPublic) {
    const members = await getOrgMembers(userId)
    await setDoc(doc(db, "publicOrgs", userId), {
      ownerId: userId,
      orgName,
      inviteCode,
      memberCount: members.length,
      createdAt: new Date().toISOString(),
    })
  } else {
    await deleteDoc(doc(db, "publicOrgs", userId))
  }
}

export async function searchPublicOrgs(term: string): Promise<PublicOrg[]> {
  const snapshot = await getDocs(collection(db, "publicOrgs"))
  const all = snapshot.docs.map((d: { id: string; data: () => unknown }) => d.data() as PublicOrg)
  const t = term.trim().toLowerCase()
  if (!t) return all
  return all.filter((o) => o.orgName.toLowerCase().includes(t))
}

export async function createJoinRequest(ownerId: string, memberUid: string, memberEmail: string | null): Promise<void> {
  await setDoc(doc(db, "users", ownerId, "joinRequests", memberUid), {
    id: memberUid,
    orgOwnerId: ownerId,
    memberUid,
    memberEmail,
    status: "pending",
    createdAt: new Date().toISOString(),
  })
}

export async function getJoinRequests(ownerId: string): Promise<OrgJoinRequest[]> {
  const snapshot = await getDocs(collection(db, "users", ownerId, "joinRequests"))
  return snapshot.docs
    .map((d: { id: string; data: () => unknown }) => ({ ...(d.data() as OrgJoinRequest), id: d.id }))
    .sort((a: OrgJoinRequest, b: OrgJoinRequest) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function approveJoinRequest(ownerId: string, memberUid: string, memberEmail: string | null): Promise<void> {
  await addOrgMember(ownerId, {
    uid: memberUid,
    email: memberEmail,
    role: "member",
    status: "active",
    joinedAt: new Date().toISOString(),
  })
  await setDoc(doc(db, "users", ownerId, "joinRequests", memberUid), { status: "approved" }, { merge: true })
}

export async function rejectJoinRequest(ownerId: string, memberUid: string): Promise<void> {
  await setDoc(doc(db, "users", ownerId, "joinRequests", memberUid), { status: "rejected" }, { merge: true })
}
`
fs.appendFileSync("features/organizations/repository.ts", additions)
console.log("appended")
