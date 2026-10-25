import AsyncStorage from "@react-native-async-storage/async-storage"

const TTL = 5 * 60 * 1000

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { t: number; v: T }
    if (Date.now() - parsed.t > TTL) return null
    return parsed.v
  } catch {
    return null
  }
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }))
  } catch {
    // ignore
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch {
    // ignore
  }
}
