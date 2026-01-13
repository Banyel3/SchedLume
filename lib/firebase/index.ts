export { getFirebaseApp, getFirebaseMessaging, getVapidKey } from "./config";
export {
  requestNotificationPermission,
  isNotificationPermissionGranted,
  checkAndShowDueReminders,
  setupForegroundMessageHandler,
  initializeNotifications,
} from "./notificationService";
