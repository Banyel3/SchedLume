// Firebase Cloud Messaging Service Worker
// This file must be at the root of the public folder for FCM to work

importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Firebase configuration - these will be replaced with actual values
// when the service worker is registered
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Initialize Firebase if config is valid
let messaging = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    // Receive config from main app
    Object.assign(firebaseConfig, event.data.config);
    
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      firebase.initializeApp(firebaseConfig);
      messaging = firebase.messaging();
      
      // Handle background messages
      messaging.onBackgroundMessage((payload) => {
        console.log("[Firebase SW] Background message received:", payload);
        
        const notificationTitle = payload.notification?.title || "SchedLume Reminder";
        const notificationOptions = {
          body: payload.notification?.body || "",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: payload.data?.tag || "schedlume-notification",
          data: payload.data || {},
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  }
  
  // Handle notification requests from main thread
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, data } = event.data.payload;
    
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag,
      data,
      requireInteraction: true,
      actions: [
        { action: "open", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[Firebase SW] Notification clicked:", event.notification.tag);
  
  event.notification.close();
  
  if (event.action === "dismiss") {
    return;
  }
  
  // Open or focus the app
  const urlToOpen = "/calendar";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
