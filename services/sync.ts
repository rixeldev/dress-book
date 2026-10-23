import { getFirestore } from "@react-native-firebase/firestore"

export function configureFirestoreOffline() {
  const db = getFirestore()
  // React Native Firebase enables offline persistence by default.
  // This helper documents the intended cache configuration for future tuning.
  return db
}
