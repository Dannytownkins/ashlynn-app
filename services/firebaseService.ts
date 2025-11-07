import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  Timestamp,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  isSupported as isMessagingSupported
} from 'firebase/messaging';
import { Task, Session, ActiveSession, SessionType, DailyGoal, DailyStats, TaskStatus, Mood } from '../types';

// Firebase configuration - Replace with your Firebase project config
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// VAPID key for push notifications - Get from Firebase Console > Project Settings > Cloud Messaging
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

let app: FirebaseApp;
let db: Firestore;
let messaging: Messaging | null = null;

// Initialize Firebase
export const initializeFirebase = () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    // Initialize messaging if supported (may not work in all browsers)
    isMessagingSupported().then(supported => {
      if (supported) {
        messaging = getMessaging(app);
        console.log('Firebase Messaging initialized');
      } else {
        console.log('Firebase Messaging not supported in this browser');
      }
    }).catch(err => {
      console.log('Error checking messaging support:', err);
    });

    console.log('Firebase initialized');
  }
  return { app, db, messaging };
};

// Get or create family code
export const getFamilyCode = (): string => {
  let code = localStorage.getItem('familyCode');
  if (!code) {
    // Generate a simple 6-character family code
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('familyCode', code);
  }
  return code;
};

export const setFamilyCode = (code: string) => {
  localStorage.setItem('familyCode', code.toUpperCase());
};

// Helper to get family document path
const getFamilyPath = () => `families/${getFamilyCode()}`;

// ===== TASKS =====

export const getTasks = async (): Promise<Task[]> => {
  const { db } = initializeFirebase();
  const tasksRef = collection(db, `${getFamilyPath()}/tasks`);
  const snapshot = await getDocs(query(tasksRef, orderBy('dueDate', 'asc')));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const { db } = initializeFirebase();
  const tasksRef = collection(db, `${getFamilyPath()}/tasks`);
  return onSnapshot(query(tasksRef, orderBy('dueDate', 'asc')), (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
    callback(tasks);
  });
};

export const addTask = async (taskData: Omit<Task, 'id' | 'status' | 'checklist' | 'evidenceUrl'>): Promise<Task> => {
  const { db } = initializeFirebase();
  const tasksRef = collection(db, `${getFamilyPath()}/tasks`);
  const newTask: Omit<Task, 'id'> = {
    ...taskData,
    status: TaskStatus.Todo,
    checklist: [],
  };
  const docRef = await addDoc(tasksRef, newTask);

  // Send notification to student
  await sendNotification({
    title: 'New Task Assigned',
    body: `${taskData.title} - Due ${new Date(taskData.dueDate).toLocaleDateString()}`,
    data: { type: 'task_assigned', taskId: docRef.id }
  });

  return { ...newTask, id: docRef.id };
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const { db } = initializeFirebase();
  const taskRef = doc(db, `${getFamilyPath()}/tasks`, taskId);
  await updateDoc(taskRef, updates);
};

export const submitEvidence = async (taskId: string, evidenceUrl: string): Promise<void> => {
  await updateTask(taskId, {
    status: TaskStatus.Submitted,
    evidenceUrl
  });

  // Send notification to parent
  const { db } = initializeFirebase();
  const taskRef = doc(db, `${getFamilyPath()}/tasks`, taskId);
  const taskSnap = await getDoc(taskRef);
  const task = taskSnap.data() as Task;

  await sendNotification({
    title: 'Work Submitted',
    body: `${task.title} is ready for review`,
    data: { type: 'work_submitted', taskId }
  });
};

export const markTaskDone = async (taskId: string): Promise<void> => {
  await updateTask(taskId, { status: TaskStatus.Done });

  // Send notification to student
  const { db } = initializeFirebase();
  const taskRef = doc(db, `${getFamilyPath()}/tasks`, taskId);
  const taskSnap = await getDoc(taskRef);
  const task = taskSnap.data() as Task;

  await sendNotification({
    title: 'Task Approved! ✓',
    body: `Great work on ${task.title}!`,
    data: { type: 'task_approved', taskId }
  });
};

export const requestRework = async (taskId: string, note: string): Promise<void> => {
  await updateTask(taskId, { status: TaskStatus.Rework });

  // Send notification to student
  const { db } = initializeFirebase();
  const taskRef = doc(db, `${getFamilyPath()}/tasks`, taskId);
  const taskSnap = await getDoc(taskRef);
  const task = taskSnap.data() as Task;

  await sendNotification({
    title: 'Revision Requested',
    body: `${task.title}: ${note}`,
    data: { type: 'rework_requested', taskId, note }
  });
};

export const updateTaskChecklist = async (taskId: string, checklist: Task['checklist']): Promise<void> => {
  await updateTask(taskId, { checklist });
};

// ===== SESSIONS =====

export const getSessions = async (): Promise<Session[]> => {
  const { db } = initializeFirebase();
  const sessionsRef = collection(db, `${getFamilyPath()}/sessions`);
  const snapshot = await getDocs(query(sessionsRef, orderBy('startedAt', 'desc')));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session));
};

export const subscribeToSessions = (callback: (sessions: Session[]) => void) => {
  const { db } = initializeFirebase();
  const sessionsRef = collection(db, `${getFamilyPath()}/sessions`);
  return onSnapshot(query(sessionsRef, orderBy('startedAt', 'desc')), (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session));
    callback(sessions);
  });
};

export const getActiveSession = async (): Promise<ActiveSession | null> => {
  const { db } = initializeFirebase();
  const activeRef = doc(db, getFamilyPath(), 'activeSession');
  const snapshot = await getDoc(activeRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as ActiveSession;
};

export const subscribeToActiveSession = (callback: (session: ActiveSession | null) => void) => {
  const { db } = initializeFirebase();
  const activeRef = doc(db, getFamilyPath(), 'activeSession');
  return onSnapshot(activeRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ActiveSession);
    } else {
      callback(null);
    }
  });
};

export const startSession = async (
  type: SessionType,
  durationMinutes: number,
  taskId?: string,
  subjectId?: string
): Promise<ActiveSession> => {
  const { db } = initializeFirebase();

  // Stop any existing session
  await stopSession();

  const now = new Date();
  const newSession: ActiveSession = {
    id: `session-${Date.now()}`,
    taskId,
    subjectId: taskId ? (await getDoc(doc(db, `${getFamilyPath()}/tasks`, taskId))).data()?.subjectId : subjectId || 'general',
    startedAt: now.toISOString(),
    type,
    checkins: [],
    remainingSeconds: durationMinutes * 60,
  };

  // Update task status if starting with a task
  if (taskId) {
    await updateTask(taskId, { status: TaskStatus.InProgress });
  }

  // Save active session
  const activeRef = doc(db, getFamilyPath(), 'activeSession');
  await setDoc(activeRef, newSession);

  // Send notification to parent
  const sessionType = type === SessionType.Focus ? 'started studying' : 'taking a break';
  await sendNotification({
    title: `Study Session ${type === SessionType.Focus ? 'Started' : 'Break'}`,
    body: `Your daughter ${sessionType}`,
    data: { type: 'session_started', sessionType: type }
  });

  return newSession;
};

export const stopSession = async (): Promise<Session | null> => {
  const { db } = initializeFirebase();
  const activeRef = doc(db, getFamilyPath(), 'activeSession');
  const activeSnap = await getDoc(activeRef);

  if (!activeSnap.exists()) return null;

  const activeSession = activeSnap.data() as ActiveSession;
  const now = new Date();
  const endedSession: Session = {
    ...activeSession,
    endedAt: now.toISOString(),
    durationMs: new Date(now).getTime() - new Date(activeSession.startedAt).getTime(),
  };

  // Save to sessions history
  const sessionsRef = collection(db, `${getFamilyPath()}/sessions`);
  await addDoc(sessionsRef, endedSession);

  // Clear active session
  await deleteDoc(activeRef);

  // Send notification if it was a focus session
  if (activeSession.type === SessionType.Focus) {
    const minutes = Math.round(endedSession.durationMs / 60000);
    await sendNotification({
      title: 'Study Session Complete',
      body: `Completed ${minutes} minutes of focused work!`,
      data: { type: 'session_completed', duration: minutes.toString() }
    });
  }

  return endedSession;
};

export const addCheckIn = async (mood: Mood): Promise<void> => {
  const { db } = initializeFirebase();
  const activeRef = doc(db, getFamilyPath(), 'activeSession');
  const activeSnap = await getDoc(activeRef);

  if (!activeSnap.exists()) return;

  const activeSession = activeSnap.data() as ActiveSession;
  const checkins = [...activeSession.checkins, { at: new Date().toISOString(), mood }];
  await updateDoc(activeRef, { checkins });

  // Send notification to parent if student needs help
  if (mood === 'Need Help') {
    await sendNotification({
      title: 'Help Needed',
      body: 'Your daughter needs assistance with homework',
      data: { type: 'help_needed' }
    });
  }
};

// ===== STATS & GOALS =====

export const getDailyStats = async (): Promise<DailyStats> => {
  const sessions = await getSessions();
  const tasks = await getTasks();

  const today = new Date().toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => s.startedAt.startsWith(today) && s.type === SessionType.Focus);
  const focusedMinutes = todaysSessions.reduce((total, s) => total + (s.durationMs || 0), 0) / (1000 * 60);
  const tasksCompleted = tasks.filter(t => t.status === TaskStatus.Done).length;

  // Get streak from settings
  const settings = await getSettings();

  return {
    focusedMinutes: Math.round(focusedMinutes),
    tasksCompleted,
    streak: settings.streak || 0,
  };
};

export const getDailyGoal = async (): Promise<DailyGoal> => {
  const settings = await getSettings();
  return {
    focusMinutes: settings.dailyGoalMinutes || 120,
    tasksCount: settings.dailyGoalTasks || 3,
  };
};

export const getSettings = async () => {
  const { db } = initializeFirebase();
  const settingsRef = doc(db, getFamilyPath(), 'settings');
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    // Initialize default settings
    const defaultSettings = {
      dailyGoalMinutes: 120,
      dailyGoalTasks: 3,
      pomodoroFocus: 25,
      pomodoroBreak: 5,
      streak: 0,
      webhookUrl: '',
    };
    await setDoc(settingsRef, defaultSettings);
    return defaultSettings;
  }

  return snapshot.data();
};

export const updateSettings = async (settings: any) => {
  const { db } = initializeFirebase();
  const settingsRef = doc(db, getFamilyPath(), 'settings');
  await setDoc(settingsRef, settings, { merge: true });
};

// ===== PUSH NOTIFICATIONS =====

export const requestNotificationPermission = async (): Promise<string | null> => {
  const { messaging } = initializeFirebase();

  if (!messaging) {
    console.log('Messaging not available');
    return null;
  }

  if (!vapidKey) {
    console.warn('VAPID key not configured. Push notifications will not work.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');
      const token = await getToken(messaging, { vapidKey });

      if (token) {
        console.log('FCM Token:', token);
        // Save token to Firestore
        await saveFCMToken(token);
        return token;
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }

  return null;
};

export const saveFCMToken = async (token: string): Promise<void> => {
  const { db } = initializeFirebase();
  const tokensRef = doc(db, `${getFamilyPath()}/fcmTokens`, token);
  await setDoc(tokensRef, {
    token,
    updatedAt: new Date().toISOString(),
  });
};

export const getFCMTokens = async (): Promise<string[]> => {
  const { db } = initializeFirebase();
  const tokensRef = collection(db, `${getFamilyPath()}/fcmTokens`);
  const snapshot = await getDocs(tokensRef);
  return snapshot.docs.map(doc => doc.data().token);
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const { messaging } = initializeFirebase();
  if (messaging) {
    return onMessage(messaging, callback);
  }
};

// Helper to send notification to all family devices
// Note: This requires a backend function to actually send via FCM
// For now, this is a placeholder
const sendNotification = async (notification: { title: string; body: string; data?: any }) => {
  // In a real app, you would call a backend Cloud Function that uses the Admin SDK
  // to send notifications to all FCM tokens in the family
  console.log('Notification would be sent:', notification);

  // For local testing, we can at least show a browser notification if permission is granted
  if (Notification.permission === 'granted') {
    try {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    } catch (e) {
      console.log('Could not show notification:', e);
    }
  }
};

// ===== INITIALIZATION =====

// Initialize Firebase on module load
initializeFirebase();
