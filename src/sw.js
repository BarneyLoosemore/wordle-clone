const toCache = [
  "/",
  "/index.html",
  "/index.css",
  "/js/game.js",
  "/js/permitted-words.js",
  "/js/tile-row.js",
  "/js/key-board.js",
  "/manifest.json",
  "/images/dog.png",
];

addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(toCache);
    })
  );
});

console.log("sw");

addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
