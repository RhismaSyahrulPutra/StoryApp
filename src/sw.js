import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.origin === "https://story-api.dicoding.dev",
  new StaleWhileRevalidate({
    cacheName: "story-api-cache",
  })
);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    return;
  }

  const options = data.options || {};
  self.registration.showNotification(data.title || "Notifikasi", {
    body: options.body || "Anda mendapatkan notifikasi baru",
    icon: "/images/favicon.png",
    badge: "/images/favicon.png",
  });
});

self.addEventListener("fetch", (event) => {
  console.log("Fetching:", event.request.url);
});
