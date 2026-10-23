import * as Notifications from "expo-notifications"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  const permissions = await Notifications.requestPermissionsAsync()
  return Boolean((permissions as { granted?: boolean }).granted)
}

export async function scheduleAppointmentReminder({
  title,
  body,
  triggerAt,
}: {
  title: string
  body: string
  triggerAt: Date
}): Promise<string | null> {
  if (triggerAt.getTime() <= Date.now()) return null
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerAt },
  })
}

export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId)
}
