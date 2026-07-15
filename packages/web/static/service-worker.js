// Minimal service worker whose sole purpose is to own the Notification
// instance so it can survive the page being backgrounded or closed.
self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", event => {
    if (event.data?.type !== "show-notification") return;

    const { title, options } = event.data.payload;

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientsList => {
            const existing = clientsList.find(client => "focus" in client);

            if (existing) return existing.focus();

            return self.clients.openWindow("/order");
        }),
    );
});
