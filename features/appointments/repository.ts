import { collection, doc, getDocs, getFirestore, setDoc, deleteDoc } from "@react-native-firebase/firestore"
import type { Appointment } from "@/interfaces/Appointment"
import { createId } from "@/libs/ids"
import { appointmentSchema } from "@/libs/schemas"
import { readCache, writeCache, clearCache } from "@/libs/cache"

const db = getFirestore()

export async function createAppointment(
  userId: string,
  input: Omit<Appointment, "id" | "userId" | "createdAt">,
): Promise<Appointment> {
  const parsed = appointmentSchema.parse(input)
  const appointment: Appointment = {
    id: createId("appointment"),
    userId,
    clientId: parsed.clientId ?? null,
    orderId: parsed.orderId ?? null,
    title: parsed.title,
    startsAt: parsed.startsAt,
    endsAt: parsed.endsAt ?? null,
    location: parsed.location ?? null,
    notes: parsed.notes ?? null,
    createdAt: new Date().toISOString(),
  }
  await setDoc(doc(db, "users", userId, "appointments", appointment.id), appointment)
  await clearCache(`cache:appointments:${userId}`)
  return appointment
}

export async function getAppointments(userId: string): Promise<Appointment[]> {
  const cacheKey = `cache:appointments:${userId}`
  const cached = await readCache<Appointment[]>(cacheKey)
  if (cached) return cached
  const snapshot = await getDocs(collection(db, "users", userId, "appointments"))
  const items = snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({ ...(snapshotDoc.data() as Appointment), id: snapshotDoc.id }))
    .sort((left: Appointment, right: Appointment) => left.startsAt.localeCompare(right.startsAt))
  await writeCache(cacheKey, items)
  return items
}

export async function deleteAppointment(userId: string, appointmentId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "appointments", appointmentId))
  await clearCache(`cache:appointments:${userId}`)
}
