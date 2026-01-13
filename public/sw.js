/// <reference lib="webworker" />

const CACHE_VERSION = "v2";
const STATIC_CACHE = `schedlume-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `schedlume-dynamic-${CACHE_VERSION}`;
const OFFLINE_PAGE = "/offline.html";

// Static assets that rarely change - cache on install
const PRECACHE_ASSETS = [
  OFFLINE_PAGE,
  "/manifest.json",
  "/favicon.svg",
];

// Install event - pre-cache critical assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Pre-caching critical assets");
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache failed for some assets:", err);
        // Don't fail installation if some assets fail
        return Promise.resolve();
      });
    })
  );
  // Immediately activate
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("schedlume-") && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - handle all requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // Skip _next/webpack-hmr for dev mode
  if (url.pathname.includes("webpack-hmr")) return;

  // Strategy: Network first for navigations, cache first for assets
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
  } else if (isAssetRequest(request)) {
    event.respondWith(handleAssetRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request is for a static asset
function isAssetRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
}

// Handle navigation requests (page loads)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the successful response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed for navigation, trying cache...");
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try to get the root page from cache
    const rootCached = await caches.match("/");
    if (rootCached) {
      return rootCached;
    }
    
    // Fallback to offline page
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
      return offlinePage;
    }
    
    // Last resort: return a basic offline response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Offline - SchedLume</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #F8F9FE; color: #1a1c29; }
            .container { text-align: center; padding: 2rem; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            p { color: #666; margin-bottom: 1.5rem; }
            button { background: #2E2C78; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 1rem; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

// Handle static asset requests (cache-first)
async function handleAssetRequest(request) {
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background (stale-while-revalidate)
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, networkResponse);
          });
        }
      })
      .catch(() => {}); // Ignore network errors for background update
    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Asset fetch failed:", request.url);
    // Return empty response for missing assets
    return new Response("", { status: 404 });
  }
}

// Handle other requests (network-first)
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("", { status: 404 });
  }
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, data } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag,
      data,
      requireInteraction: true,
    });
  }
});

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");
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
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: data.tag || "schedlume-push",
    data: data.data || {},
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  const urlToOpen = "/calendar";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync (future)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    console.log("[SW] Background sync triggered");
  }
});
