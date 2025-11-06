import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Session Start - triggers notification to parent
export const sessionStart = functions.firestore
  .document('activeSession/{userId}')
  .onCreate(async (snap, context) => {
    const session = snap.data();
    const userId = context.params.userId;

    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken && session.type === 'focus') {
      await messaging.send({
        token: fcmToken,
        notification: {
          title: 'Focus Session Started',
          body: `Student started a ${session.type} session`,
        },
      });
    }

    return null;
  });

// Session Stop - triggers notification
export const sessionStop = functions.firestore
  .document('activeSession/{userId}')
  .onDelete(async (snap, context) => {
    const session = snap.data();
    const userId = context.params.userId;

    const userDoc = await db.collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      await messaging.send({
        token: fcmToken,
        notification: {
          title: 'Session Complete',
          body: 'Great work! Session finished.',
        },
      });
    }

    return null;
  });

// Task Submit - notify parent
export const taskSubmit = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'submitted' && after.status === 'submitted') {
      // Get parent FCM token (simplified - in production, get from user settings)
      const settingsDoc = await db.collection('settings').doc('global').get();
      const parentToken = settingsDoc.data()?.parentFCMToken;

      if (parentToken) {
        await messaging.send({
          token: parentToken,
          notification: {
            title: 'Task Submitted',
            body: `${after.title} has been submitted for review`,
          },
        });
      }
    }

    return null;
  });

// Task Rework - notify student
export const taskRework = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'rework' && after.status === 'rework') {
      // Get student FCM token
      const studentDoc = await db.collection('users').doc('default-user').get();
      const fcmToken = studentDoc.data()?.fcmToken;

      if (fcmToken) {
        await messaging.send({
          token: fcmToken,
          notification: {
            title: 'Rework Requested',
            body: `${after.title} needs some changes`,
          },
        });
      }
    }

    return null;
  });

// Notify function - generic notification sender
export const notify = functions.https.onCall(async (data, context) => {
  const { token, title, body } = data;

  if (!token || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  await messaging.send({
    token,
    notification: { title, body },
  });

  return { success: true };
});

// Enforce webhook - calls external webhook URL
export const enforce = functions.https.onCall(async (data, context) => {
  const settingsDoc = await db.collection('settings').doc('global').get();
  const webhookUrl = settingsDoc.data()?.webhookEnforceUrl;

  if (!webhookUrl) {
    throw new functions.https.HttpsError('failed-precondition', 'Webhook URL not configured');
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enforce_downtime', timestamp: new Date().toISOString() }),
    });

    return { success: response.ok };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Webhook call failed');
  }
});

// Scheduled function for start window check
export const checkStartWindow = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const settingsDoc = await db.collection('settings').doc('global').get();
    const startWindow = settingsDoc.data()?.startWindow || '15:30';
    const [hour, minute] = startWindow.split(':').map(Number);

    const now = new Date();
    const windowStart = new Date();
    windowStart.setHours(hour, minute, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(windowStart.getHours() + 1);

    if (now >= windowStart && now < windowEnd) {
      // Check if student has started
      const activeSessionDoc = await db.collection('activeSession').doc('default-user').get();
      if (!activeSessionDoc.exists) {
        // Send reminder notification
        const studentDoc = await db.collection('users').doc('default-user').get();
        const fcmToken = studentDoc.data()?.fcmToken;

        if (fcmToken) {
          await messaging.send({
            token: fcmToken,
            notification: {
              title: 'Time to Start!',
              body: 'Your study window is open. Ready to focus?',
            },
          });
        }
      }
    }

    return null;
  });

// Scheduled function for inactivity check
export const checkInactivity = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const settingsDoc = await db.collection('settings').doc('global').get();
    const inactivityMinutes = settingsDoc.data()?.inactivityMinutes || 15;

    const activeSessionDoc = await db.collection('activeSession').doc('default-user').get();
    if (activeSessionDoc.exists) {
      const session = activeSessionDoc.data();
      const lastTickAt = session.lastTickAt?.toDate();
      const now = new Date();

      if (lastTickAt && (now.getTime() - lastTickAt.getTime()) > inactivityMinutes * 60 * 1000) {
        // Student is inactive
        const parentDoc = await db.collection('users').doc('parent').get();
        const fcmToken = parentDoc.data()?.fcmToken;

        if (fcmToken) {
          await messaging.send({
            token: fcmToken,
            notification: {
              title: 'Inactivity Detected',
              body: 'Student has been inactive for more than 15 minutes',
            },
          });
        }
      }
    }

    return null;
  });

