const CACHE = "nuestra-historia-v1";

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  if (url.pathname.includes("sw.js")) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const red = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copia = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copia));
          }
          return response;
        })
        .catch(() => {
          if (cached) return cached;
          if (event.request.mode === "navigate") return caches.match("./index.html");
          return new Response("", { status: 408, statusText: "Offline" });
        });
      return cached || red;
    })
  );
});
