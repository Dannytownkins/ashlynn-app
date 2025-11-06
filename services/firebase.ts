import { initializeFCM, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Save FCM token to Firestore
const saveFCMToken = async (token: string): Promise<void> => {
  try {
    const userId = 'default-user'; // TODO: Replace with actual auth.currentUser?.uid
    await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
    console.log('FCM Token saved to Firestore');
  } catch (error) {
    console.error('Failed to save FCM token:', error);
  }
};

export const initializeFirebaseAndAskForPermission = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const token = await initializeFCM();
      if (token) {
        await saveFCMToken(token);
      }
    } catch (err) {
      console.error('An error occurred while initializing FCM:', err);
    }
  } else {
    console.warn('Push messaging is not supported by this browser.');
  }
};
