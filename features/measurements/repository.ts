import { collection, doc, getDocs, getFirestore, setDoc } from "@react-native-firebase/firestore"
import type { Measurement } from "@/interfaces/Measurement"
import { createId } from "@/libs/ids"
import { measurementSchema } from "@/libs/schemas"
import { toCanonicalCm } from "@/libs/units"

const db = getFirestore()

export async function createMeasurement(
  userId: string,
  input: Omit<Measurement, "id" | "createdAt">,
): Promise<Measurement> {
  const parsed = measurementSchema.parse(input)
  const now = new Date().toISOString()
  const measurement: Measurement = {
    id: createId("measurement"),
    clientId: parsed.clientId,
    version: input.version,
    unit: parsed.unit,
    values: input.values,
    source: parsed.source,
    takenAt: input.takenAt,
    notes: parsed.notes ?? null,
    createdAt: now,
  }

  await setDoc(doc(db, "users", userId, "clients", measurement.clientId, "measurements", measurement.id), measurement)
  return measurement
}

export function getMeasurementInCanonicalCm(measurement: Measurement, value: number): number {
  return toCanonicalCm(value, measurement.unit)
}

export async function getMeasurements(userId: string, clientId: string): Promise<Measurement[]> {
  const snapshot = await getDocs(collection(db, "users", userId, "clients", clientId, "measurements"))
  return snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({
      ...(snapshotDoc.data() as Measurement),
      id: snapshotDoc.id,
    }))
    .sort((left: Measurement, right: Measurement) => right.version - left.version)
}
