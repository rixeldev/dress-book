import analytics from "@react-native-firebase/analytics"

export async function logEvent(name: string, params?: Record<string, string | number | boolean>): Promise<void> {
  try {
    await analytics().logEvent(name, params)
  } catch (error) {
    console.log("Analytics log failed", error)
  }
}

export const AnalyticsEvents = {
  onboardingCompleted: (withClient: boolean) => logEvent("onboarding_completed", { with_client: withClient }),
  clientCreated: () => logEvent("client_created"),
  orderCreated: (type: string) => logEvent("order_created", { type }),
  orderStatusChanged: (from: string, to: string) => logEvent("order_status_changed", { from, to }),
  measurementSaved: (type: string) => logEvent("measurement_saved", { type }),
  fabricCreated: () => logEvent("fabric_created"),
  designUploaded: (count: number) => logEvent("design_uploaded", { count }),
  appointmentCreated: () => logEvent("appointment_created"),
  measurementExported: () => logEvent("measurement_exported"),
  accountDeleted: () => logEvent("account_deleted"),
  adShown: (placement: string) => logEvent("ad_shown", { placement }),
}
