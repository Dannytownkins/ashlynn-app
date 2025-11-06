
import { Subject, Task, TaskStatus, Session, SessionType, Mood } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Math', color: 'bg-red-500' },
  { id: 'ela', name: 'ELA', color: 'bg-blue-500' },
  { id: 'science', name: 'Science', color: 'bg-green-500' },
  { id: 'history', name: 'Social Studies', color: 'bg-yellow-500' },
];

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

export const TASKS: Task[] = [
  {
    id: 'task-1',
    subjectId: 'math',
    title: 'Algebra II - Chapter 5 Problems',
    description: 'Complete all odd-numbered problems from page 255.',
    dueDate: today.toISOString(),
    estimateMins: 45,
    checklist: [
      { id: 'c1-1', label: 'Review chapter notes', done: true },
      { id: 'c1-2', label: 'Complete problems 1-15', done: false },
      { id: 'c1-3', label: 'Check answers in back of book', done: false },
    ],
    status: TaskStatus.Todo,
  },
  {
    id: 'task-2',
    subjectId: 'ela',
    title: 'Read "The Great Gatsby" - Chapter 3',
    description: 'Read chapter 3 and write a one-paragraph summary.',
    dueDate: today.toISOString(),
    estimateMins: 30,
    checklist: [],
    status: TaskStatus.Todo,
  },
  {
    id: 'task-3',
    subjectId: 'science',
    title: 'Biology Lab Report Draft',
    description: 'Write the introduction and materials section for the photosynthesis lab.',
    dueDate: tomorrow.toISOString(),
    estimateMins: 50,
    checklist: [
      { id: 'c3-1', label: 'Gather lab notes', done: false },
      { id: 'c3-2', label: 'Write introduction', done: false },
      { id: 'c3-3', label: 'List materials', done: false },
    ],
    status: TaskStatus.Todo,
  },
  {
    id: 'task-4',
    subjectId: 'history',
    title: 'Study for WWI Quiz',
    description: 'Review notes on the main causes and key battles of World War I.',
    dueDate: tomorrow.toISOString(),
    estimateMins: 25,
    checklist: [],
    status: TaskStatus.Todo,
  },
  {
    id: 'task-5',
    subjectId: 'math',
    title: 'Geometry Worksheet',
    description: 'Finish the worksheet on circles and tangents from class.',
    dueDate: yesterday.toISOString(),
    estimateMins: 25,
    // FIX: Added missing checklist property
    checklist: [],
    status: TaskStatus.Rework,
    evidenceUrl: 'https://picsum.photos/seed/rework/200/150',
  },
   {
    id: 'task-6',
    subjectId: 'ela',
    title: 'Essay Brainstorm',
    description: 'Brainstorm three potential topics for the upcoming research paper.',
    dueDate: today.toISOString(),
    estimateMins: 20,
    // FIX: Added missing checklist property
    checklist: [],
    status: TaskStatus.Submitted,
    evidenceUrl: 'https://picsum.photos/seed/submitted/200/150',
  },
];

export const SESSIONS: Session[] = [
    {
        id: 'session-1',
        subjectId: 'math',
        taskId: 'task-5',
        startedAt: new Date(yesterday.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endedAt: new Date(yesterday.getTime() - (2 * 60 * 60 * 1000) + (25 * 60 * 1000)).toISOString(),
        durationMs: 25 * 60 * 1000,
        type: SessionType.Focus,
        checkins: [{ at: new Date(yesterday.getTime() - (2 * 60 * 60 * 1000) + (10 * 60 * 1000)).toISOString(), mood: Mood.Focused }]
    },
    {
        id: 'session-2',
        subjectId: 'ela',
        taskId: 'task-6',
        startedAt: new Date(yesterday.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        endedAt: new Date(yesterday.getTime() - (1 * 60 * 60 * 1000) + (20 * 60 * 1000)).toISOString(),
        durationMs: 20 * 60 * 1000,
        type: SessionType.Focus,
        checkins: []
    }
];

export const POMODORO_SETTINGS = {
    focus: 25,
    break: 5,
};

export const DAILY_GOAL = {
    minutes: 90,
    tasks: 3,
};

export const LIVE_STATUS = {
    studentState: 'Idle',
    lastActivity: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    activeTask: null,
};

export const PARENT_MESSAGES = [
    { from: 'parent', text: "Don't forget to double check your math answers!", pinned: true },
    { from: 'student', text: "Okay, I will." },
];

export const STUDENT_STREAK = 2;