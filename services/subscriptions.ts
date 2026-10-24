import { useEffect, useState } from "react"
import { setPremium } from "@/services/entitlements"
import {
  initConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
  type Product,
} from "react-native-iap"

const PRODUCT_IDS = ["premium_monthly", "premium_yearly"]

let connectionReady = false

export async function initIAP(): Promise<void> {
  try {
    await initConnection()
    connectionReady = true
  } catch (error) {
    console.log("IAP init failed", error)
  }
}

export async function syncPremiumFromStore(): Promise<boolean> {
  if (!connectionReady) await initIAP()
  try {
    const purchases = await getAvailablePurchases()
    const active = purchases.some((p: Purchase) => PRODUCT_IDS.includes(p.productId))
    await setPremium(active)
    return active
  } catch (error) {
    console.log("Restore purchases failed", error)
    return false
  }
}

export async function loadProducts(): Promise<Product[]> {
  if (!connectionReady) await initIAP()
  try {
    const result = await fetchProducts({ skus: PRODUCT_IDS, type: "subs" })
    return (result as Product[]) ?? []
  } catch (error) {
    console.log("Fetch products failed", error)
    return []
  }
}

export async function purchaseSubscription(productId: string): Promise<boolean> {
  if (!connectionReady) await initIAP()
  return new Promise<boolean>((resolve) => {
    const sub = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        if (purchase.productId === productId) {
          await finishTransaction({ purchase, isConsumable: false })
          await setPremium(true)
          resolve(true)
        }
      } catch (error) {
        console.log("Finish transaction failed", error)
        resolve(false)
      } finally {
        sub.remove()
      }
    })
    const errSub = purchaseErrorListener((error) => {
      console.log("Purchase error", error)
      resolve(false)
      errSub.remove()
      sub.remove()
    })
    requestPurchase({ request: { apple: { sku: productId }, google: { skus: [productId] } }, type: "subs" }).catch((error) => {
      console.log("Request purchase failed", error)
      resolve(false)
      errSub.remove()
      sub.remove()
    })
  })
}

export function formatProductPrice(product: Product): string {
  const p = product as { displayPrice?: string; title?: string }
  return p.displayPrice ?? ""
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    loadProducts().then((p) => {
      setProducts(p)
      setLoading(false)
    })
  }, [])
  return { products, loading }
}
