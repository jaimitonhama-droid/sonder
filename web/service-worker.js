// Service Worker — Sonder PWA
const CACHE_NAME = 'sonder-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Instala e faz cache dos recursos estáticos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activa e limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network First — tenta a rede, usa cache como fallback
self.addEventListener('fetch', (event) => {
  // Ignora pedidos ao YouTube/Google (não devem ser cached)
  if (
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('ytimg.com') ||
    event.request.url.includes('randomuser.me')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Guarda uma cópia no cache
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
