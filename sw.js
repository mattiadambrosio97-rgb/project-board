// Service Worker v2 — network-first, zero cache per GitHub Pages
var SW_VERSION = 'v2-' + Date.now();
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(names.map(function(n) { return caches.delete(n); }));
        }).then(function() { return self.clients.claim(); })
    );
});
self.addEventListener('fetch', function(e) {
    var url = new URL(e.request.url);
    // Sempre network-first, append cache-bust per index.html e data.json
    if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html') || url.pathname.endsWith('data.json')) {
        var bustUrl = e.request.url + (e.request.url.indexOf('?') === -1 ? '?' : '&') + '_cb=' + Date.now();
        e.respondWith(
            fetch(bustUrl, { cache: 'no-store' }).catch(function() {
                return fetch(e.request, { cache: 'no-store' });
            })
        );
    } else {
        e.respondWith(
            fetch(e.request, { cache: 'no-store' }).catch(function() {
                return caches.match(e.request);
            })
        );
    }
});
