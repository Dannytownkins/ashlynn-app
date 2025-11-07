import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { saveFCMToken } from './mockApi';

const FIREBASE_CONFIG_KEY = 'focusflow_firebase_config';
const FCM_TOKEN_KEY = 'focusflow_fcm_token';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const saveFirebaseConfig = (config: FirebaseConfig): void => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

export const getFirebaseConfig = (): FirebaseConfig | null => {
  const configStr = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (!configStr) return null;
  try {
    return JSON.parse(configStr);
  } catch (err) {
    console.error('Error parsing Firebase config:', err);
    return null;
  }
};

export const isFirebaseConfigured = (): boolean => {
  return getFirebaseConfig() !== null;
};

export const clearFirebaseConfig = (): void => {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  localStorage.removeItem(FCM_TOKEN_KEY);
};

export const initializeFirebase = (): FirebaseApp | null => {
  const config = getFirebaseConfig();
  if (!config) {
    console.log('Firebase config not found. Please complete setup.');
    return null;
  }

  try {
    // Check if already initialized
    if (getApps().length === 0) {
      app = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
      console.log('Firebase initialized successfully');
    } else {
      app = getApps()[0];
    }
    return app;
  } catch (err) {
    console.error('Error initializing Firebase:', err);
    return null;
  }
};

export const initializeFirebaseAndAskForPermission = async (): Promise<string | null> => {
  // First, initialize Firebase
  const firebaseApp = initializeFirebase();
  if (!firebaseApp) {
    console.log('Cannot request permission - Firebase not configured');
    return null;
  }

  const config = getFirebaseConfig();
  if (!config) return null;

  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported');
    return null;
  }

  try {
    // Initialize messaging
    messaging = getMessaging(firebaseApp);

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    console.log('Notification permission granted');

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Send Firebase config to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'FIREBASE_CONFIG',
        config: config,
      });
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token:', token);
      localStorage.setItem(FCM_TOKEN_KEY, token);
      // Save to your backend
      await saveFCMToken(token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (err) {
    console.error('Error in Firebase messaging setup:', err);
    return null;
  }
};

export const setupForegroundMessageListener = (callback: (payload: any) => void): void => {
  if (!messaging) {
    console.error('Messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

export const getFCMToken = (): string | null => {
  return localStorage.getItem(FCM_TOKEN_KEY);
};
