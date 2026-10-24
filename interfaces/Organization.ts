export interface OrgMember {
  uid: string
  email: string | null
  role: "owner" | "member"
  status: "active" | "pending"
  joinedAt: string
}

export interface OrgSuggestion {
  id: string
  orgOwnerId: string
  memberUid: string
  memberEmail: string | null
  type: "client" | "order" | "fabric" | "measurement"
  targetId: string | null
  changes: Record<string, unknown>
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  reviewedAt: string | null
}

export interface OrgJoinRequest {
  id: string
  orgOwnerId: string
  memberUid: string
  memberEmail: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface PublicOrg {
  ownerId: string
  orgName: string
  inviteCode: string
  memberCount: number
  createdAt: string
}
