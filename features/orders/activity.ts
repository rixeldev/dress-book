import { collection, doc, getDocs, getFirestore, setDoc } from "@react-native-firebase/firestore"
import { createId } from "@/libs/ids"

const db = getFirestore()

export interface ActivityEntry {
  id: string
  type: string
  message: string
  from?: string | null
  to?: string | null
  createdAt: string
  actorUid: string
}

export async function addActivity(userId: string, orderId: string, entry: Omit<ActivityEntry, "id" | "createdAt">): Promise<ActivityEntry> {
  const now = new Date().toISOString()
  const activity: ActivityEntry = { ...entry, id: createId("activity"), createdAt: now }
  await setDoc(doc(db, "users", userId, "orders", orderId, "activity", activity.id), activity)
  return activity
}

export async function getActivity(userId: string, orderId: string): Promise<ActivityEntry[]> {
  const snapshot = await getDocs(collection(db, "users", userId, "orders", orderId, "activity"))
  return snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({
      ...(snapshotDoc.data() as ActivityEntry),
      id: snapshotDoc.id,
    }))
    .sort((left: ActivityEntry, right: ActivityEntry) => right.createdAt.localeCompare(left.createdAt))
}
