
export enum UserRole {
  Student = 'student',
  Parent = 'parent',
}

export enum View {
  Home = 'home',
  Reports = 'reports',
  Settings = 'settings',
  Messages = 'messages',
}

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Submitted = 'submitted',
  Rework = 'rework',
  Done = 'done',
}

export enum SessionType {
  Focus = 'focus',
  Break = 'break',
}

export enum Mood {
  Focused = 'focused',
  Distracted = 'distracted',
  NeedHelp = 'need_help',
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  estimateMins: number;
  checklist: ChecklistItem[];
  evidenceUrl?: string;
  status: TaskStatus;
}

export interface Session {
  id: string;
  taskId?: string;
  subjectId: string;
  startedAt: string; // ISO string
  endedAt?: string; // ISO string
  durationMs?: number;
  type: SessionType;
  checkins: { at: string; mood: Mood }[];
}

export interface ActiveSession extends Session {
  remainingSeconds: number;
}

export interface DailyGoal {
  minutes: number;
  tasks: number;
}

export interface DailyStats {
  focusedMinutes: number;
  tasksCompleted: number;
  streak: number;
}
