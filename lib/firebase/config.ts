import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton)
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  
  if (!app && getApps().length === 0) {
    // Check if config is valid
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn("[Firebase] Missing configuration. Push notifications will not work.");
      return null;
    }
    app = initializeApp(firebaseConfig);
  } else if (!app) {
    app = getApps()[0];
  }
  
  return app;
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  
  // Check if messaging is supported
  const supported = await isSupported();
  if (!supported) {
    console.warn("[Firebase] Messaging is not supported in this browser.");
    return null;
  }
  
  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }
  
  return messaging;
}

// Get VAPID key for push notifications
export function getVapidKey(): string | undefined {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
}
