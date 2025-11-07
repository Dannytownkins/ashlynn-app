// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Listen for messages from the main app to receive Firebase config
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const config = event.data.config;

    try {
      // Initialize Firebase with the received config
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        });

        console.log('[Service Worker] Firebase initialized with config');

        // Set up messaging
        const messaging = firebase.messaging();

        // Handle background messages
        messaging.onBackgroundMessage((payload) => {
          console.log('[Service Worker] Received background message:', payload);

          const notificationTitle = payload.notification?.title || 'FocusFlow Notification';
          const notificationOptions = {
            body: payload.notification?.body || '',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: payload.data,
            tag: payload.data?.tag || 'focusflow-notification',
          };

          return self.registration.showNotification(notificationTitle, notificationOptions);
        });
      }
    } catch (error) {
      console.error('[Service Worker] Error initializing Firebase:', error);
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);

  event.notification.close();

  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's already a window open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('[Service Worker] Loaded and waiting for Firebase config...');
