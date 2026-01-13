/// <reference lib="webworker" />

const CACHE_NAME = "schedlume-v1";
const STATIC_CACHE = "schedlume-static-v1";
const DYNAMIC_CACHE = "schedlume-dynamic-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/today",
  "/week",
  "/calendar",
  "/settings",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Some static assets failed to cache:", err);
      });
    })
  );
  // Immediately activate the new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, falling back to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Skip API calls and external resources
  if (url.origin !== self.location.origin) {
    return;
  }

  // For navigation requests (pages), use network-first strategy
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the page for offline use
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Try to serve from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback page
            return caches.match("/");
          });
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version but update in background
          fetch(request).then((networkResponse) => {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, networkResponse);
            });
          });
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // For other requests, use network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});

// Background sync for offline changes (future enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    console.log("[SW] Background sync triggered");
  }
});

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "SchedLume Reminder";
  const options = {
    body: data.body || "You have a reminder",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: data.tag || "schedlume-push",
    data: data.data || {},
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);
  
  event.notification.close();
  
  // Open or focus the app on calendar page
  const urlToOpen = "/calendar";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          if (event.notification.data?.noteId) {
            client.navigate(`${urlToOpen}?note=${event.notification.data.noteId}`);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle messages from main thread for showing local notifications
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, data } = event.data.payload;
    
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag,
      data,
      requireInteraction: true,
    });
  }
});
