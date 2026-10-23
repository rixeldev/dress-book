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

export async function scheduleOrderDueReminder({
  orderId,
  title,
  dueDate,
}: {
  orderId: string
  title: string
  dueDate: string
}): Promise<string | null> {
  const due = new Date(dueDate)
  const reminderAt = new Date(due.getTime() - 24 * 60 * 60 * 1000)
  if (reminderAt.getTime() <= Date.now()) return null
  return Notifications.scheduleNotificationAsync({
    content: { title: "Order due tomorrow", body: title },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderAt },
  })
}
