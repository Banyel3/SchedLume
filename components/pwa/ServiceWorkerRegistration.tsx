'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered with scope:', reg.scope);
          setRegistration(reg);

          // Check for updates periodically
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage('skipWaiting');
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white rounded-xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">Update Available</p>
            <p className="text-xs text-gray-400">Tap to refresh</p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default ServiceWorkerRegistration;
