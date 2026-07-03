const CACHE_NAME = 'fin-planner-v4';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/simple-auth.js',
  'js/app.js',
  'js/data.js',
  'js/chart.js'
];

// Install: cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first for all requests (to ensure auth works)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  
  // For CDN resources (chart.js, fontawesome, fonts) -> network first
  if (url.hostname.includes('cdn.') || 
      url.hostname.includes('fonts.') || 
      url.hostname.includes('gstatic.') ||
      url.hostname.includes('cdnjs.')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  
  // For our assets -> network first (to get fresh auth)
  e.respondWith(
    fetch(e.request).then(response => {
      // Cache successful responses
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(() => {
      // Fallback to cache if offline
      return caches.match(e.request);
    })
  );
});
