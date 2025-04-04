import { Workbox } from "workbox-window";

export default function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const wb = new Workbox("/sw.js");

    wb.register()
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }
}
