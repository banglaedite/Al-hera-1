// Service Worker for Al-Hera Madrasah PWA
const CACHE_NAME = 'al-hera-pwa-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not intercept API, JSON requests, Vite internals, node_modules, or WebSocket
  if (
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('.json') ||
    url.pathname.includes('/@') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('vite') ||
    url.pathname.includes('hmr') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // Network first with fast 3-second fallback to cache, always ensuring the app opens
  event.respondWith(
    new Promise((resolve) => {
      let isResolved = false;
      
      const tryFallback = async () => {
        if (isResolved) return;
        isResolved = true;
        const cached = await caches.match(event.request);
        if (cached) return resolve(cached);
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/') || await caches.match('/index.html');
          if (fallback) return resolve(fallback);
        }
        resolve(new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
      };

      const timeoutId = setTimeout(tryFallback, 3000);

      fetch(event.request)
        .then((response) => {
          clearTimeout(timeoutId);
          if (isResolved) return;
          isResolved = true;
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            });
          }
          resolve(response);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          tryFallback();
        });
    })
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  let data = { title: 'আল-হেরা মাদরাসা', body: 'নতুন বার্তা বা নোটিশ এসেছে।' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const isCall = data.type === 'call' || data.title.includes('কল');
  
  const options = {
    body: data.body,
    icon: 'https://i.postimg.cc/jSZykhDB/IMG-20260330-WA0001.png',
    badge: 'https://i.postimg.cc/jSZykhDB/IMG-20260330-WA0001.png',
    vibrate: isCall ? [500, 200, 500, 200, 500, 200, 500] : [200, 100, 200],
    tag: isCall ? 'incoming-call' : (data.tag || 'general-notification'),
    renotify: true,
    requireInteraction: isCall,
    data: {
      url: data.url || (isCall ? '/parent?action=call' : '/'),
      isCall: isCall
    },
    // Note: 'sound' property is deprecated in most browsers, but vibrate helps
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
