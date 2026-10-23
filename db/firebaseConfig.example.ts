// Copy this file to db/firebaseConfig.ts and replace the placeholders with the
// values from your Firebase project. The real file is gitignored.
import { getApp, getApps, initializeApp } from "@react-native-firebase/app"
import { getReactNativePersistence } from "firebase/auth"
import { getStorage } from "@react-native-firebase/storage"
import { initializeAuth } from "@react-native-firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"

export const appVersionId = "replace-me"
export const adBannerId = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
export const adInterstitialId = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"

export const firebaseConfig = {
  apiKey: "replace-me",
  authDomain: "replace-me.firebaseapp.com",
  projectId: "replace-me",
  storageBucket: "replace-me.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
  measurementId: "G-XXXXXXXXXX",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = initializeAuth(getApp(), {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})
const storage = getStorage(getApp())

export { app, auth, storage }
