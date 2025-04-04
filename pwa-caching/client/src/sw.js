import { registerRoute } from "workbox-routing";
import { ExpirationPlugin } from "workbox-expiration";
import { BackgroundSyncPlugin } from "workbox-background-sync";

import { CacheFirst, NetworkFirst } from "workbox-strategies";

registerRoute(
  ({ url }) => url.origin === "https://api.openweathermap.org",
  new NetworkFirst({
    cacheName: "weather-api-cache",
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 60 * 30 }), // 30 minutes
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }), // Store up to 50 images
    ],
  })
);

const bgSyncPlugin = new BackgroundSyncPlugin("weather-sync-queue", {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
});

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/weather"),
  new NetworkFirst({
    cacheName: "weather-data",
    plugins: [bgSyncPlugin],
  })
);
