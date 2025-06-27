// Basic service worker for PWA
const CACHE_NAME = 'inventory-app-v1';

self.addEventListener('install', (event) => {
  
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handling - just pass through for now
  event.respondWith(fetch(event.request));
});