/**
 * Service Worker for Jmee DeepBreath
 * Enables offline functionality
 */

const CACHE_NAME = 'jmee-deepbreath-v45';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/sync.js',
    '/exercises.js',
    '/breath-sounds.js',
    '/ocean-sound.js',
    '/voice-guide.js',
    '/coach.js',
    '/journal.js',
    '/multi-timer.js',
    '/manifest.json',
    'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/docx@9.5.1/dist/index.iife.js',
    'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch event — network-first for app files, cache-first for CDN
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isSameOrigin = url.origin === self.location.origin;
    const isKnownCDN = url.hostname === 'cdn.sheetjs.com'
        || url.hostname === 'cdn.jsdelivr.net'
        || url.hostname === 'fonts.googleapis.com'
        || url.hostname === 'fonts.gstatic.com';

    if (isSameOrigin) {
        // Network-first for our own files — always get fresh code
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then(cached => {
                        if (cached) return cached;
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        return new Response('Hors ligne', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        });
                    });
                })
        );
    } else if (isKnownCDN) {
        // Cache-first for CDN (they don't change)
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
    }
});
