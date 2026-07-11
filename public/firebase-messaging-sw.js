/* Firebase Cloud Messaging service worker — background push on web/PWA */
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAm9al04s12CCvuGw-a74dKlzcHbL_DWkE",
  authDomain: "soyol-c0a5c.firebaseapp.com",
  projectId: "soyol-c0a5c",
  storageBucket: "soyol-c0a5c.firebasestorage.app",
  messagingSenderId: "56065511032",
  appId: "1:56065511032:web:e0a96996d933390f0c0a5c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "VCM";
  const options = {
    body: payload.notification?.body || "",
    icon: "/branding/icon-192.png",
    badge: "/branding/icon-192.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
