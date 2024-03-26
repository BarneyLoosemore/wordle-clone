const ASSETS = [
  "/",
  "/js/game.js",
  "/js/permitted-words.js",
  "/js/word-list.js",
  "/js/tile-row.js",
  "/js/key-board.js",
  "/manifest.json",
  "/images/dog.png",
];

addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
});

addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      const preload = await event.preloadResponse;
      if (preload) return preload;

      return fetch(event.request);
    })()
  );
});
