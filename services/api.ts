/**
 * Unified API Service
 *
 * This service provides a single interface for all app data operations.
 * It uses Firebase Firestore for real-time data sync and Cloud Messaging for notifications.
 */

import { Task, Subject, Session, ActiveSession, SessionType, DailyGoal, DailyStats, TaskStatus, Mood, ChecklistItem } from '../types';
import {
  getTasks,
  addTask,
  updateTask,
  submitEvidence,
  markTaskDone,
  requestRework,
  updateTaskChecklist,
  getSessions,
  getActiveSession,
  startSession,
  stopSession,
  addCheckIn,
  getDailyStats,
  getDailyGoal,
  getSettings,
  updateSettings,
  requestNotificationPermission,
  subscribeToTasks,
  subscribeToSessions,
  subscribeToActiveSession,
  getFamilyCode,
  setFamilyCode as setFamilyCodeFirebase,
} from './firebaseService';
import { SUBJECTS } from '../constants';
import { GoogleGenAI, Type } from '@google/genai';

// ===== SUBJECTS =====
// Subjects are static data, not stored in Firebase
export const getSubjects = async (): Promise<Subject[]> => {
  return Promise.resolve(SUBJECTS);
};

// ===== TASKS =====

export const getTodaysTasks = async (): Promise<Task[]> => {
  const tasks = await getTasks();
  const today = new Date().toISOString().split('T')[0];
  const todays = tasks.filter(task => task.dueDate.startsWith(today) && task.status !== TaskStatus.Done);
  const overdue = tasks.filter(task => task.dueDate < today && task.status !== TaskStatus.Done);
  return [...overdue, ...todays];
};

export const getSubmittedTasks = async (): Promise<Task[]> => {
  const tasks = await getTasks();
  return tasks.filter(t => t.status === TaskStatus.Submitted || t.status === TaskStatus.Rework);
};

export { addTask, submitEvidence, markTaskDone, requestRework };

export const updateChecklistItem = async (taskId: string, checklistItemId: string, done: boolean): Promise<Task> => {
  const tasks = await getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const newChecklist = task.checklist.map(item =>
    item.id === checklistItemId ? { ...item, done } : item
  );

  await updateTaskChecklist(taskId, newChecklist);
  return { ...task, checklist: newChecklist };
};

// ===== SESSIONS =====

export const getHistoricalSessions = async (): Promise<Session[]> => {
  return getSessions();
};

export { getActiveSession, startSession, stopSession, addCheckIn };

// ===== STATS & GOALS =====

export { getDailyStats, getDailyGoal };

export const getPomodoroSettings = async () => {
  const settings = await getSettings();
  return {
    focus: settings.pomodoroFocus || 25,
    break: settings.pomodoroBreak || 5,
  };
};

// ===== LIVE STATUS =====

export const getLiveStatus = async () => {
  const session = await getActiveSession();
  if (session) {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === session.taskId);
    return {
      studentState: session.type === SessionType.Focus ? 'Focusing' : 'On a break',
      lastActivity: new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activeTask: task ? task.title : 'General Study',
    };
  }
  return {
    studentState: 'Idle',
    lastActivity: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    activeTask: null,
  };
};

// ===== NOTIFICATIONS =====

export const saveFCMToken = async (token: string): Promise<{success: boolean}> => {
  // This is handled internally by firebaseService
  return { success: true };
};

export const initializeFirebaseAndAskForPermission = async () => {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      console.log('Push notifications enabled!');
    } else {
      console.log('Push notifications not available or denied');
    }
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};

// ===== WEBHOOKS =====

export const callEnforceWebhook = async (): Promise<{success: boolean}> => {
  const settings = await getSettings();
  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, { method: 'POST' });
      return { success: true };
    } catch (error) {
      console.error('Webhook call failed:', error);
      return { success: false };
    }
  }
  console.log('No webhook URL configured');
  return { success: false };
};

// ===== AI TASK BREAKDOWN =====

export const breakdownTaskWithAI = async (taskId: string): Promise<Task> => {
  const tasks = await getTasks();
  const taskToUpdate = tasks.find(t => t.id === taskId);

  if (!taskToUpdate) {
    throw new Error("Task not found");
  }

  // Check if Gemini API key is configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env.local file to enable AI task breakdown.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a helpful study assistant. Break down the following homework task into a simple checklist of 3-5 actionable steps for a student.
    Task Title: "${taskToUpdate.title}"
    Task Description: "${taskToUpdate.description}"

    Provide your response as a valid JSON array of objects, where each object has a single "label" key with a string value. For example: [{"label": "First step"}, {"label": "Second step"}].`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: {
                type: Type.STRING,
                description: "A single checklist item step."
              },
            },
            required: ["label"],
          },
        },
      },
    });

    const newChecklistItems: { label: string }[] = JSON.parse(response.text);

    const formattedChecklist: ChecklistItem[] = newChecklistItems.map((item, index) => ({
      id: `ai-${taskId}-${index + 1}`,
      label: item.label,
      done: false,
    }));

    // Update task in Firebase
    await updateTaskChecklist(taskId, formattedChecklist);

    return { ...taskToUpdate, checklist: formattedChecklist };
  } catch (error: any) {
    if (error.message?.includes('API_KEY')) {
      throw new Error("Invalid Gemini API key. Please check your .env.local configuration.");
    }
    throw error;
  }
};

// ===== REAL-TIME SUBSCRIPTIONS =====

/**
 * Subscribe to real-time task updates
 * @param callback Function to call when tasks change
 * @returns Unsubscribe function
 */
export const subscribeToTaskUpdates = (callback: (tasks: Task[]) => void) => {
  return subscribeToTasks(callback);
};

/**
 * Subscribe to real-time session updates
 * @param callback Function to call when sessions change
 * @returns Unsubscribe function
 */
export const subscribeToSessionUpdates = (callback: (sessions: Session[]) => void) => {
  return subscribeToSessions(callback);
};

/**
 * Subscribe to active session updates
 * @param callback Function to call when active session changes
 * @returns Unsubscribe function
 */
export const subscribeToActiveSessionUpdates = (callback: (session: ActiveSession | null) => void) => {
  return subscribeToActiveSession(callback);
};

// ===== FAMILY CODE =====

/**
 * Get the current family code
 */
export const getCurrentFamilyCode = (): string => {
  return getFamilyCode();
};

/**
 * Set a new family code (for joining a family)
 */
export const setFamilyCode = (code: string): void => {
  setFamilyCodeFirebase(code);
  // Reload the page to fetch data with new family code
  window.location.reload();
};

// ===== SETTINGS =====

export { getSettings, updateSettings };
