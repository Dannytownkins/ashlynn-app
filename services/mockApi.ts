import { Task, Subject, Session, ActiveSession, SessionType, DailyGoal, DailyStats, TaskStatus, Mood, ChecklistItem } from '../types';
import { TASKS, SUBJECTS, SESSIONS, POMODORO_SETTINGS, DAILY_GOAL, LIVE_STATUS, STUDENT_STREAK } from '../constants';

// --- SIMULATED DATABASE ---
let tasks: Task[] = [...TASKS];
let sessions: Session[] = [...SESSIONS];
let activeSession: ActiveSession | null = null;
let userFCMTokens: string[] = [];
// --- END SIMULATED DATABASE ---

const apiLatency = 500; // ms

const simulateApi = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), apiLatency);
    });
};

export const getSubjects = async (): Promise<Subject[]> => {
    return simulateApi(SUBJECTS);
};

export const getTodaysTasks = async (): Promise<Task[]> => {
    const today = new Date().toISOString().split('T')[0];
    const todays = tasks.filter(task => task.dueDate.startsWith(today) && task.status !== TaskStatus.Done);
    const overdue = tasks.filter(task => task.dueDate < today && task.status !== TaskStatus.Done);
    return simulateApi([...overdue, ...todays]);
};

export const getSubmittedTasks = async (): Promise<Task[]> => {
    return simulateApi(tasks.filter(t => t.status === TaskStatus.Submitted || t.status === TaskStatus.Rework));
}

export const getDailyStats = async (): Promise<DailyStats> => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSessions = sessions.filter(s => s.startedAt.startsWith(today) && s.type === SessionType.Focus);
    const focusedMinutes = todaysSessions.reduce((total, s) => total + (s.durationMs || 0), 0) / (1000 * 60);
    const tasksCompleted = tasks.filter(t => t.status === TaskStatus.Done /* and completed today */).length;
    
    return simulateApi({
        focusedMinutes: Math.round(focusedMinutes),
        tasksCompleted,
        streak: STUDENT_STREAK,
    });
};

export const getDailyGoal = async (): Promise<DailyGoal> => {
    return simulateApi(DAILY_GOAL);
}

export const getPomodoroSettings = async () => {
    return simulateApi(POMODORO_SETTINGS);
};

export const startSession = async (type: SessionType, durationMinutes: number, taskId?: string, subjectId?: string): Promise<ActiveSession> => {
    if (activeSession) {
        await stopSession();
    }
    
    const now = new Date();
    const newSession: ActiveSession = {
        id: `session-${Date.now()}`,
        taskId,
        subjectId: taskId ? tasks.find(t => t.id === taskId)!.subjectId : subjectId || 'general',
        startedAt: now.toISOString(),
        type,
        checkins: [],
        remainingSeconds: durationMinutes * 60,
    };

    if (taskId) {
        tasks = tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.InProgress } : t);
    }
    
    activeSession = newSession;
    return simulateApi(activeSession);
};

export const stopSession = async (): Promise<Session | null> => {
    if (!activeSession) return simulateApi(null);

    const now = new Date();
    const endedSession: Session = {
        ...activeSession,
        endedAt: now.toISOString(),
        durationMs: new Date(now).getTime() - new Date(activeSession.startedAt).getTime(),
    };
    
    sessions.push(endedSession);
    activeSession = null;
    return simulateApi(endedSession);
};


export const submitEvidence = async (taskId: string, evidenceUrl: string): Promise<Task> => {
    let updatedTask: Task | undefined;
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            updatedTask = { ...t, status: TaskStatus.Submitted, evidenceUrl };
            return updatedTask;
        }
        return t;
    });
    return simulateApi(updatedTask!);
};

export const markTaskDone = async(taskId: string): Promise<Task> => {
    let updatedTask: Task | undefined;
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            updatedTask = { ...t, status: TaskStatus.Done };
            return updatedTask;
        }
        return t;
    });
    return simulateApi(updatedTask!);
}

export const requestRework = async(taskId: string, note: string): Promise<Task> => {
    // In a real app, the note would be stored. Here we just log it.
    console.log(`Rework requested for task ${taskId}: ${note}`);
    let updatedTask: Task | undefined;
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            updatedTask = { ...t, status: TaskStatus.Rework };
            return updatedTask;
        }
        return t;
    });
    return simulateApi(updatedTask!);
}


export const getActiveSession = async (): Promise<ActiveSession | null> => {
    if (activeSession) {
        const elapsedSeconds = (new Date().getTime() - new Date(activeSession.startedAt).getTime()) / 1000;
        const totalSeconds = (POMODORO_SETTINGS.focus) * 60; // This is a simplification
        activeSession.remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    }
    return simulateApi(activeSession);
}

export const getLiveStatus = async () => {
    const session = await getActiveSession();
    if (session) {
        const task = tasks.find(t => t.id === session.taskId);
        return simulateApi({
            studentState: session.type === SessionType.Focus ? 'Focusing' : 'On a break',
            lastActivity: new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            activeTask: task ? task.title : 'General Study',
        });
    }
    return simulateApi(LIVE_STATUS);
}


export const getHistoricalSessions = async (): Promise<Session[]> => {
    return simulateApi(sessions);
}


export const callEnforceWebhook = async (): Promise<{success: boolean}> => {
    console.log("TODO: Calling 'Enforce Phone Downtime' webhook.");
    // In a real app: await fetch(settings.global.webhookEnforceUrl, { method: 'POST' });
    return simulateApi({success: true});
}

export const addCheckIn = async (mood: Mood): Promise<ActiveSession | null> => {
    if (!activeSession) return simulateApi(null);
    activeSession.checkins.push({ at: new Date().toISOString(), mood });
    return simulateApi(activeSession);
}

export const addTask = async (newTaskData: Omit<Task, 'id' | 'status' | 'checklist' | 'evidenceUrl'>): Promise<Task> => {
    const newTask: Task = {
        ...newTaskData,
        id: `task-${Date.now()}`,
        status: TaskStatus.Todo,
        checklist: [],
    };
    tasks.unshift(newTask); // Add to the beginning of the list for visibility
    return simulateApi(newTask);
};

export const updateChecklistItem = async (taskId: string, checklistItemId: string, done: boolean): Promise<Task> => {
    let updatedTask: Task | undefined;
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            const newChecklist = t.checklist.map(item =>
                item.id === checklistItemId ? { ...item, done } : item
            );
            updatedTask = { ...t, checklist: newChecklist };
            return updatedTask;
        }
        return t;
    });
    if (!updatedTask) {
        throw new Error("Task not found");
    }
    return simulateApi(updatedTask);
};


export const saveFCMToken = async (token: string): Promise<{success: boolean}> => {
    if (!userFCMTokens.includes(token)) {
        userFCMTokens.push(token);
        console.log("FCM Token saved to mock DB:", token);
        console.log("All tokens:", userFCMTokens);
    } else {
        console.log("FCM Token already exists.");
    }
    return simulateApi({success: true});
};