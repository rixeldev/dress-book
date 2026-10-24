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
