import { useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const useStorage = () => {
  const [isSaving, setIsSaving] = useState(false)

  const setItem = async (key: string, value: any) => {
    try {
      setIsSaving(true)
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      console.log("Error saving item:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const getItem = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value !== null) {
        return value
      }
      return null
    } catch (e) {
      console.log("Error reading item:", e)
      return null
    }
  }

  const removeItem = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (e) {
      console.log("Error removing item:", e)
    }
  }

  return {
    setItem,
    getItem,
    removeItem,
    isSaving,
  }
}
