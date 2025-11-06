import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import {
  Task,
  Subject,
  Session,
  ActiveSession,
  SessionType,
  DailyGoal,
  DailyStats,
  TaskStatus,
  Mood,
  ChecklistItem,
} from '../types';

// Collection names
const COLLECTIONS = {
  subjects: 'subjects',
  tasks: 'tasks',
  sessions: 'sessions',
  activeSession: 'activeSession',
  plans: 'plans',
  messages: 'messages',
  users: 'users',
  settings: 'settings',
};

// Helper: Get current user ID (for now, using a default; in production, use auth.currentUser.uid)
const getCurrentUserId = (): string => {
  // TODO: Replace with actual auth.currentUser?.uid || 'default-user'
  return 'default-user';
};

// Helper: Convert Firestore timestamp to ISO string
const toISOString = (timestamp: Timestamp | string | undefined): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
};

// Helper: Convert ISO string to Firestore timestamp
const toTimestamp = (isoString: string): Timestamp => {
  return Timestamp.fromDate(new Date(isoString));
};

// ==================== SUBJECTS ====================
export const getSubjects = async (): Promise<Subject[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.subjects));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Subject));
};

// ==================== TASKS ====================
export const getTodaysTasks = async (): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);
  todayEnd.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, COLLECTIONS.tasks),
    where('dueDate', '>=', Timestamp.fromDate(todayStart)),
    where('dueDate', '<', Timestamp.fromDate(todayEnd)),
    where('status', '!=', TaskStatus.Done),
    orderBy('dueDate', 'asc')
  );

  const snapshot = await getDocs(q);
  const todaysTasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: toISOString(doc.data().dueDate),
  })) as Task[];

  // Also get overdue tasks
  const overdueQ = query(
    collection(db, COLLECTIONS.tasks),
    where('dueDate', '<', Timestamp.fromDate(todayStart)),
    where('status', '!=', TaskStatus.Done),
    orderBy('dueDate', 'asc')
  );

  const overdueSnapshot = await getDocs(overdueQ);
  const overdueTasks = overdueSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: toISOString(doc.data().dueDate),
  })) as Task[];

  return [...overdueTasks, ...todaysTasks];
};

export const getSubmittedTasks = async (): Promise<Task[]> => {
  const q = query(
    collection(db, COLLECTIONS.tasks),
    where('status', 'in', [TaskStatus.Submitted, TaskStatus.Rework]),
    orderBy('dueDate', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: toISOString(doc.data().dueDate),
  })) as Task[];
};

export const addTask = async (
  newTaskData: Omit<Task, 'id' | 'status' | 'checklist' | 'evidenceUrl'>
): Promise<Task> => {
  const taskData = {
    ...newTaskData,
    dueDate: typeof newTaskData.dueDate === 'string' 
      ? Timestamp.fromDate(new Date(newTaskData.dueDate))
      : newTaskData.dueDate,
    status: TaskStatus.Todo,
    checklist: [],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.tasks), taskData);
  const docSnap = await getDoc(docRef);
  return {
    id: docRef.id,
    ...docSnap.data(),
    dueDate: toISOString(docSnap.data()?.dueDate),
  } as Task;
};

export const updateChecklistItem = async (
  taskId: string,
  checklistItemId: string,
  done: boolean
): Promise<Task> => {
  const taskRef = doc(db, COLLECTIONS.tasks, taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) {
    throw new Error('Task not found');
  }

  const task = taskSnap.data() as Task;
  const updatedChecklist = task.checklist.map((item) =>
    item.id === checklistItemId ? { ...item, done } : item
  );

  await updateDoc(taskRef, { checklist: updatedChecklist });

  const updatedSnap = await getDoc(taskRef);
  return {
    id: updatedSnap.id,
    ...updatedSnap.data(),
    dueDate: toISOString(updatedSnap.data()?.dueDate),
  } as Task;
};

export const submitEvidence = async (
  taskId: string,
  evidenceUrl: string
): Promise<Task> => {
  const taskRef = doc(db, COLLECTIONS.tasks, taskId);
  await updateDoc(taskRef, {
    status: TaskStatus.Submitted,
    evidenceUrl,
    submittedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(taskRef);
  return {
    id: updatedSnap.id,
    ...updatedSnap.data(),
    dueDate: toISOString(updatedSnap.data()?.dueDate),
  } as Task;
};

export const markTaskDone = async (taskId: string): Promise<Task> => {
  const taskRef = doc(db, COLLECTIONS.tasks, taskId);
  await updateDoc(taskRef, {
    status: TaskStatus.Done,
    completedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(taskRef);
  return {
    id: updatedSnap.id,
    ...updatedSnap.data(),
    dueDate: toISOString(updatedSnap.data()?.dueDate),
  } as Task;
};

export const requestRework = async (
  taskId: string,
  note: string
): Promise<Task> => {
  const taskRef = doc(db, COLLECTIONS.tasks, taskId);
  await updateDoc(taskRef, {
    status: TaskStatus.Rework,
    reworkNote: note,
    reworkRequestedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(taskRef);
  return {
    id: updatedSnap.id,
    ...updatedSnap.data(),
    dueDate: toISOString(updatedSnap.data()?.dueDate),
  } as Task;
};

// ==================== SESSIONS ====================
export const getActiveSession = async (): Promise<ActiveSession | null> => {
  const userId = getCurrentUserId();
  const sessionRef = doc(db, COLLECTIONS.activeSession, userId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    return null;
  }

  const data = sessionSnap.data();
  const startedAt = toISOString(data.startedAt);
  const lastTickAt = toISOString(data.lastTickAt || data.startedAt);

  // Calculate remaining seconds based on lastTickAt
  const elapsedMs =
    new Date().getTime() - new Date(lastTickAt).getTime();
  const totalSeconds = data.durationSeconds || 0;
  const remainingSeconds = Math.max(0, totalSeconds - Math.floor(elapsedMs / 1000));

  return {
    id: sessionSnap.id,
    ...data,
    startedAt,
    remainingSeconds,
    checkins: (data.checkins || []).map((c: any) => ({
      ...c,
      at: toISOString(c.at),
    })),
  } as ActiveSession;
};

export const startSession = async (
  type: SessionType,
  durationMinutes: number,
  taskId?: string,
  subjectId?: string
): Promise<ActiveSession> => {
  const userId = getCurrentUserId();

  // Stop any existing session first
  await stopSession();

  // Get subjectId from task if not provided
  let finalSubjectId = subjectId;
  if (taskId && !subjectId) {
    const taskRef = doc(db, COLLECTIONS.tasks, taskId);
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
      finalSubjectId = taskSnap.data().subjectId;
    }
  }

  const sessionData = {
    taskId: taskId || null,
    subjectId: finalSubjectId || 'general',
    startedAt: serverTimestamp(),
    lastTickAt: serverTimestamp(),
    type,
    durationSeconds: durationMinutes * 60,
    checkins: [],
  };

  const sessionRef = doc(db, COLLECTIONS.activeSession, userId);
  await setDoc(sessionRef, sessionData);

  // Update task status if taskId provided
  if (taskId) {
    const taskRef = doc(db, COLLECTIONS.tasks, taskId);
    await updateDoc(taskRef, { status: TaskStatus.InProgress });
  }

  return await getActiveSession() as ActiveSession;
};

export const stopSession = async (): Promise<Session | null> => {
  const userId = getCurrentUserId();
  const sessionRef = doc(db, COLLECTIONS.activeSession, userId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    return null;
  }

  const data = sessionSnap.data();
  const startedAt = toISOString(data.startedAt);
  const endedAt = new Date().toISOString();
  const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();

  const session: Session = {
    id: `session-${Date.now()}`,
    taskId: data.taskId || undefined,
    subjectId: data.subjectId,
    startedAt,
    endedAt,
    durationMs,
    type: data.type,
    checkins: (data.checkins || []).map((c: any) => ({
      ...c,
      at: toISOString(c.at),
    })),
  };

  // Save to sessions collection
  await addDoc(collection(db, COLLECTIONS.sessions), {
    ...session,
    createdAt: serverTimestamp(),
  });

  // Delete active session document
  await deleteDoc(sessionRef);

  return session;
};

export const updateActiveSessionTick = async (): Promise<void> => {
  const userId = getCurrentUserId();
  const sessionRef = doc(db, COLLECTIONS.activeSession, userId);
  await updateDoc(sessionRef, { lastTickAt: serverTimestamp() });
};

export const addCheckIn = async (mood: Mood): Promise<ActiveSession | null> => {
  const userId = getCurrentUserId();
  const sessionRef = doc(db, COLLECTIONS.activeSession, userId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    return null;
  }

  const data = sessionSnap.data();
  const checkins = data.checkins || [];
  checkins.push({
    at: serverTimestamp(),
    mood,
  });

  await updateDoc(sessionRef, { checkins });

  return await getActiveSession();
};

// ==================== STATS & GOALS ====================
export const getDailyStats = async (): Promise<DailyStats> => {
  const today = new Date().toISOString().split('T')[0];
  const todayStart = new Date(today);
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const q = query(
    collection(db, COLLECTIONS.sessions),
    where('startedAt', '>=', Timestamp.fromDate(todayStart)),
    where('startedAt', '<', Timestamp.fromDate(todayEnd)),
    where('type', '==', SessionType.Focus)
  );

  const snapshot = await getDocs(q);
  const focusedMinutes = snapshot.docs.reduce((total, doc) => {
    const data = doc.data();
    return total + (data.durationMs || 0) / (1000 * 60);
  }, 0);

  const tasksQ = query(
    collection(db, COLLECTIONS.tasks),
    where('status', '==', TaskStatus.Done),
    where('completedAt', '>=', Timestamp.fromDate(todayStart)),
    where('completedAt', '<', Timestamp.fromDate(todayEnd))
  );

  const tasksSnapshot = await getDocs(tasksQ);
  const tasksCompleted = tasksSnapshot.size;

  // Calculate streak (simplified - check last N days for completed tasks)
  const streak = await calculateStreak();

  return {
    focusedMinutes: Math.round(focusedMinutes),
    tasksCompleted,
    streak,
  };
};

const calculateStreak = async (): Promise<number> => {
  // Simplified streak calculation
  // In production, check consecutive days with completed tasks
  const q = query(
    collection(db, COLLECTIONS.sessions),
    orderBy('startedAt', 'desc'),
    limit(30)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return 0;

  // Count consecutive days with sessions
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    const dayStart = Timestamp.fromDate(checkDate);
    const dayEnd = Timestamp.fromDate(new Date(checkDate.getTime() + 24 * 60 * 60 * 1000));

    const dayQ = query(
      collection(db, COLLECTIONS.sessions),
      where('startedAt', '>=', dayStart),
      where('startedAt', '<', dayEnd)
    );

    const daySnapshot = await getDocs(dayQ);
    if (daySnapshot.empty && i > 0) break;
    if (!daySnapshot.empty) streak++;
  }

  return streak;
};

export const getDailyGoal = async (): Promise<DailyGoal> => {
  const settingsRef = doc(db, COLLECTIONS.settings, 'global');
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    const data = settingsSnap.data();
    return {
      minutes: data.dailyGoal?.minutes || 90,
      tasks: data.dailyGoal?.tasks || 3,
    };
  }

  return { minutes: 90, tasks: 3 };
};

export const getPomodoroSettings = async () => {
  const settingsRef = doc(db, COLLECTIONS.settings, 'global');
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    const data = settingsSnap.data();
    return {
      focus: data.pomodoro?.focus || 25,
      break: data.pomodoro?.break || 5,
    };
  }

  return { focus: 25, break: 5 };
};

// ==================== LIVE STATUS ====================
export const getLiveStatus = async () => {
  const activeSession = await getActiveSession();
  if (activeSession) {
    const task = activeSession.taskId
      ? await getDoc(doc(db, COLLECTIONS.tasks, activeSession.taskId))
      : null;

    return {
      studentState:
        activeSession.type === SessionType.Focus ? 'Focusing' : 'On a break',
      lastActivity: new Date(activeSession.startedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      activeTask: task?.exists() ? task.data().title : 'General Study',
    };
  }

  return {
    studentState: 'Idle',
    lastActivity: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    activeTask: null,
  };
};

// ==================== HISTORICAL SESSIONS ====================
export const getHistoricalSessions = async (): Promise<Session[]> => {
  const q = query(
    collection(db, COLLECTIONS.sessions),
    orderBy('startedAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startedAt: toISOString(data.startedAt),
      endedAt: data.endedAt ? toISOString(data.endedAt) : undefined,
    } as Session;
  });
};

// ==================== WEBHOOK ====================
export const callEnforceWebhook = async (): Promise<{ success: boolean }> => {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_ENFORCE_URL;
  if (!webhookUrl) {
    console.warn('Webhook URL not configured');
    return { success: false };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enforce_downtime', timestamp: new Date().toISOString() }),
    });

    return { success: response.ok };
  } catch (error) {
    console.error('Webhook call failed:', error);
    return { success: false };
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================
export const subscribeToActiveSession = (
  callback: (session: ActiveSession | null) => void
): Unsubscribe => {
  const userId = getCurrentUserId();
  const sessionRef = doc(db, COLLECTIONS.activeSession, userId);

  return onSnapshot(sessionRef, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    const data = snap.data();
    const startedAt = toISOString(data.startedAt);
    const lastTickAt = toISOString(data.lastTickAt || data.startedAt);

    const elapsedMs = new Date().getTime() - new Date(lastTickAt).getTime();
    const totalSeconds = data.durationSeconds || 0;
    const remainingSeconds = Math.max(0, totalSeconds - Math.floor(elapsedMs / 1000));

    callback({
      id: snap.id,
      ...data,
      startedAt,
      remainingSeconds,
      checkins: (data.checkins || []).map((c: any) => ({
        ...c,
        at: toISOString(c.at),
      })),
    } as ActiveSession);
  });
};

// ==================== FILE UPLOAD ====================
export const uploadEvidence = async (
  file: File,
  taskId: string
): Promise<string> => {
  const fileRef = ref(storage, `evidence/${taskId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

