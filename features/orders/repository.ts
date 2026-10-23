import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc } from "@react-native-firebase/firestore"
import type { Order, OrderStatus } from "@/interfaces/Order"
import { createId } from "@/libs/ids"
import { orderSchema } from "@/libs/schemas"

const db = getFirestore()

export async function createOrder(
  userId: string,
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "deliveredAt">,
): Promise<Order> {
  const parsed = orderSchema.parse(input)
  const now = new Date().toISOString()
  const order: Order = {
    id: createId("order"),
    clientId: parsed.clientId,
    clientName: parsed.clientName,
    title: parsed.title,
    type: parsed.type,
    status: parsed.status,
    dueDate: parsed.dueDate ?? null,
    startDate: parsed.startDate ?? null,
    priority: parsed.priority ?? "normal",
    price: parsed.price ?? null,
    deposit: parsed.deposit ?? null,
    currency: parsed.currency,
    measurementId: parsed.measurementId ?? null,
    fabricIds: input.fabricIds ?? [],
    referenceImageUrls: input.referenceImageUrls ?? [],
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
    deliveredAt: parsed.status === "delivered" ? now : null,
  }

  await setDoc(doc(db, "users", userId, "orders", order.id), order)
  return order
}

export async function getOrders(userId: string): Promise<Order[]> {
  const snapshot = await getDocs(collection(db, "users", userId, "orders"))
  return snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({
      ...(snapshotDoc.data() as Order),
      id: snapshotDoc.id,
    }))
    .sort((left: Order, right: Order) => {
      if (!left.dueDate && !right.dueDate) return right.updatedAt.localeCompare(left.updatedAt)
      if (!left.dueDate) return 1
      if (!right.dueDate) return -1
      return left.dueDate.localeCompare(right.dueDate)
    })
}

export async function getOrder(userId: string, orderId: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db, "users", userId, "orders", orderId))
  if (!snapshot.exists()) return null
  return { ...(snapshot.data() as Order), id: snapshot.id }
}

export async function updateOrder(userId: string, orderId: string, input: Partial<Order>): Promise<void> {
  await setDoc(doc(db, "users", userId, "orders", orderId), { ...input, updatedAt: new Date().toISOString() }, { merge: true })
}

export async function deleteOrder(userId: string, orderId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "orders", orderId))
}

export async function updateOrderStatus(
  userId: string,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const now = new Date().toISOString()
  await setDoc(
    doc(db, "users", userId, "orders", orderId),
    { status, updatedAt: now, deliveredAt: status === "delivered" ? now : null },
    { merge: true },
  )
}
