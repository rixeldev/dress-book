import { doc, getFirestore, setDoc } from "@react-native-firebase/firestore"

export type MeasurementUnitPreference = "cm" | "in"
export type CurrencyPreference = "USD" | "EUR"

const db = getFirestore()

export async function saveOnboardingProfile({
  userId,
  units,
  currency,
}: {
  userId: string
  units: MeasurementUnitPreference
  currency: CurrencyPreference
}) {
  const now = new Date().toISOString()

  await setDoc(
    doc(db, "users", userId),
    {
      currency,
      units,
      onboardingComplete: true,
      schemaVersion: 1,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true },
  )
}
