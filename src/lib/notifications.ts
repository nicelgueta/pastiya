import * as Notifications from 'expo-notifications';

import { formatDosage } from './format';
import type { Unit } from './types';

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return res.granted;
  } catch {
    return false;
  }
}

export async function cancelNotification(id: string | undefined): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired or unknown; nothing to do
  }
}

/** Schedules the "available again" notification; returns its id or null. */
export async function scheduleAvailableNotification(
  name: string,
  amount: number,
  unit: Unit,
  availableAt: number,
): Promise<string | null> {
  if (availableAt <= Date.now()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `${name} is available again`,
        body: `You can take your next dose: ${formatDosage(amount, unit)}.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(availableAt),
      },
    });
  } catch {
    return null;
  }
}
