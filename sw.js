const CACHE_NAME = "aquameme-v1";

// Only cache the minimum app shell
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/splash.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // Never cache API requests
  if (
    event.request.url.includes("/api") ||
    event.request.url.includes("supabase") ||
    event.request.url.includes("firebase")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML: Always try network first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // CSS/JS/Images: Network first, update cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});