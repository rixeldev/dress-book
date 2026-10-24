import AsyncStorage from "@react-native-async-storage/async-storage"
import { getRemoteNumber } from "@/services/remoteConfig"

export async function isPremium(): Promise<boolean> {
  const value = await AsyncStorage.getItem("premium")
  return value === "true"
}

export async function setPremium(value: boolean): Promise<void> {
  await AsyncStorage.setItem("premium", String(value))
}

export async function canCreateClient(currentCount: number): Promise<{ allowed: boolean; reason?: string }> {
  if (await isPremium()) return { allowed: true }
  const limit = getRemoteNumber("free_client_limit")
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows up to ${limit} clients. Upgrade to add more.`,
    }
  }
  return { allowed: true }
}

export async function canCreateOrder(currentCount: number): Promise<{ allowed: boolean; reason?: string }> {
  if (await isPremium()) return { allowed: true }
  const limit = getRemoteNumber("free_order_limit")
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows up to ${limit} orders. Upgrade to add more.`,
    }
  }
  return { allowed: true }
}
