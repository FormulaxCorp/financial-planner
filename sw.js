const CACHE_NAME = 'fin-planner-v5';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/app.js',
  'js/data.js',
  'js/chart.js',
  'js/supabase-data.js',
  'js/supabase-init.js'
];

// Install: cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => {
          console.log('[SW] Deleting old cache:', n);
          return caches.delete(n);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML/CSS/JS, cache-first for others
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  
  // For CDN resources (fonts, CDNs) -> network first
  if (url.hostname.includes('fonts.') || 
      url.hostname.includes('gstatic.') ||
      url.hostname.includes('cdnjs.') ||
      url.hostname.includes('cdn.jsdelivr.')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  
  // For our assets (HTML, CSS, JS) -> ALWAYS network first
  e.respondWith(
    fetch(e.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
