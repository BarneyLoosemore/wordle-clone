const toCache = [
  "/index.html",
  "/index.css",
  "/index.js",
  "/permitted-words.js",
  "/constants.js",
  "/utils.js",
];

addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(toCache);
    })
  );
});

addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
