import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging, getVapidKey } from "./config";
import {
  getGeneralNotesWithDueDates,
  getGeneralNote,
} from "@/lib/db/generalNoteStore";
import {
  hasNotificationBeenShown,
  recordNotificationShown,
} from "@/lib/db/notificationRecordStore";
import { getSettings, saveSettings } from "@/lib/db/settingsStore";
import type { GeneralNote } from "@/types";

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<{
  permission: NotificationPermission;
  token: string | null;
}> {
  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.warn("[Notifications] Not supported in this browser.");
    return { permission: "denied", token: null };
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  // Update settings with permission status
  const settings = await getSettings();
  await saveSettings({
    ...settings,
    notificationPermission: permission,
  });

  if (permission !== "granted") {
    return { permission, token: null };
  }

  // Get FCM token
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return { permission, token: null };
    }

    const vapidKey = getVapidKey();
    if (!vapidKey) {
      console.warn("[Notifications] VAPID key not configured.");
      return { permission, token: null };
    }

    const token = await getToken(messaging, { vapidKey });
    console.log("[Notifications] FCM token obtained:", token.substring(0, 20) + "...");
    
    return { permission, token };
  } catch (error) {
    console.error("[Notifications] Failed to get FCM token:", error);
    return { permission, token: null };
  }
}

// Check if notification permission is granted
export function isNotificationPermissionGranted(): boolean {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

// Calculate days until due date
function getDaysUntilDue(dueDate: string, today: string): number {
  const due = new Date(dueDate);
  const now = new Date(today);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Check for pending reminders and show notifications
export async function checkAndShowDueReminders(): Promise<number> {
  if (!isNotificationPermissionGranted()) {
    return 0;
  }

  const settings = await getSettings();
  if (!settings.notificationsEnabled) {
    return 0;
  }

  const today = getToday();
  
  // Get notes with due dates in the next 4 days (to cover 3-day reminders)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 4);
  const endDateStr = endDate.toISOString().split("T")[0];

  const notesWithDueDates = await getGeneralNotesWithDueDates(today, endDateStr);
  
  let notificationsShown = 0;

  for (const note of notesWithDueDates) {
    if (!note.dueDate) continue;

    const daysUntilDue = getDaysUntilDue(note.dueDate, today);
    
    // Only notify for 3, 2, or 1 days before (not on the due date or after)
    if (daysUntilDue < 1 || daysUntilDue > 3) continue;

    // Check if we've already shown this notification today
    const alreadyShown = await hasNotificationBeenShown(note.id, today);
    if (alreadyShown) continue;

    // Show the notification
    const shown = await showDueNotification(note, daysUntilDue);
    if (shown) {
      await recordNotificationShown(note.id, today);
      notificationsShown++;
    }
  }

  return notificationsShown;
}

// Show a due date notification
async function showDueNotification(
  note: GeneralNote,
  daysUntilDue: number
): Promise<boolean> {
  try {
    const title = "SchedLume Reminder";
    const body =
      daysUntilDue === 1
        ? `"${note.title}" is due tomorrow!`
        : `"${note.title}" is due in ${daysUntilDue} days`;

    // Try to use service worker notification first
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: {
          title,
          body,
          tag: `due-${note.id}`,
          data: { noteId: note.id, dueDate: note.dueDate },
        },
      });
      return true;
    }

    // Fallback to regular notification
    new Notification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      tag: `due-${note.id}`,
      data: { noteId: note.id, dueDate: note.dueDate },
    });
    return true;
  } catch (error) {
    console.error("[Notifications] Failed to show notification:", error);
    return false;
  }
}

// Listen for foreground messages (when app is open)
export function setupForegroundMessageHandler(): void {
  getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("[Notifications] Foreground message received:", payload);
      
      // Show notification when app is in foreground
      if (payload.notification) {
        new Notification(payload.notification.title || "SchedLume", {
          body: payload.notification.body || "",
          icon: "/icons/icon-192x192.png",
        });
      }
    });
  });
}

// Initialize notification system
export async function initializeNotifications(): Promise<void> {
  // Setup foreground message handler
  setupForegroundMessageHandler();

  // Check for pending due reminders
  await checkAndShowDueReminders();
}
