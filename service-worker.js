const CACHE_NAME = 'cek-data-santri-v1';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Jangan menangani permintaan menuju API Google Apps Script.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Halaman utama selalu mencoba mengambil versi terbaru.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          const responseCopy = response.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put('./index.html', responseCopy);
          });

          return response;
        })
        .catch(function () {
          return caches.match('./index.html');
        })
    );

    return;
  }

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
