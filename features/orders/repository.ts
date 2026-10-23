import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, startAfter } from "@react-native-firebase/firestore"
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
  const page = await getOrdersPage(userId, 200)
  return page.items
}

export async function getOrdersPage(
  userId: string,
  pageSize = 30,
  cursor?: Order | null,
): Promise<{ items: Order[]; nextCursor: Order | null; hasMore: boolean }> {
  const constraints = [orderBy("dueDate", "asc"), limit(pageSize + 1)]
  const pageQuery = cursor && cursor.dueDate
    ? query(collection(db, "users", userId, "orders"), orderBy("dueDate", "asc"), limit(pageSize + 1), startAfter(cursor.dueDate))
    : query(collection(db, "users", userId, "orders"), orderBy("dueDate", "asc"), limit(pageSize + 1))
  const snapshot = await getDocs(pageQuery)
  const docs = snapshot.docs.slice(0, pageSize)
  const items = docs.map((snapshotDoc: { id: string; data: () => unknown }) => ({
    ...(snapshotDoc.data() as Order),
    id: snapshotDoc.id,
  }))
  const hasMore = snapshot.docs.length > pageSize
  const lastDoc = docs[docs.length - 1]
  const nextCursor = hasMore && lastDoc ? ({ ...(lastDoc.data() as Order), id: lastDoc.id } as Order) : null
  return { items, nextCursor, hasMore }
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

export async function duplicateOrder(userId: string, order: Order): Promise<Order> {
  const now = new Date().toISOString()
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "consultation",
    dueDate: null,
    startDate: now,
    deliveredAt: null,
    createdAt: now,
    updatedAt: now,
    title: `${order.title} (copy)`,
  }
  await setDoc(doc(db, "users", userId, "orders", newOrder.id), newOrder)
  return newOrder
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
