import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SUBJECTS = [
  { id: 'math', name: 'Math', color: 'bg-red-500' },
  { id: 'ela', name: 'ELA', color: 'bg-blue-500' },
  { id: 'science', name: 'Science', color: 'bg-green-500' },
];

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const TASKS = [
  {
    subjectId: 'math',
    title: 'Algebra II - Chapter 5 Problems',
    description: 'Complete all odd-numbered problems from page 255.',
    dueDate: Timestamp.fromDate(today),
    estimateMins: 45,
    checklist: [
      { id: 'c1-1', label: 'Review chapter notes', done: true },
      { id: 'c1-2', label: 'Complete problems 1-15', done: false },
      { id: 'c1-3', label: 'Check answers in back of book', done: false },
    ],
    status: 'todo',
    createdAt: Timestamp.now(),
  },
  {
    subjectId: 'ela',
    title: 'Read "The Great Gatsby" - Chapter 3',
    description: 'Read chapter 3 and write a one-paragraph summary.',
    dueDate: Timestamp.fromDate(today),
    estimateMins: 30,
    checklist: [],
    status: 'todo',
    createdAt: Timestamp.now(),
  },
  {
    subjectId: 'science',
    title: 'Biology Lab Report Draft',
    description: 'Write the introduction and materials section for the photosynthesis lab.',
    dueDate: Timestamp.fromDate(tomorrow),
    estimateMins: 50,
    checklist: [
      { id: 'c3-1', label: 'Gather lab notes', done: false },
      { id: 'c3-2', label: 'Write introduction', done: false },
      { id: 'c3-3', label: 'List materials', done: false },
    ],
    status: 'todo',
    createdAt: Timestamp.now(),
  },
  {
    subjectId: 'math',
    title: 'Geometry Worksheet',
    description: 'Finish the worksheet on circles and tangents from class.',
    dueDate: Timestamp.fromDate(yesterday),
    estimateMins: 25,
    checklist: [],
    status: 'rework',
    evidenceUrl: 'https://picsum.photos/seed/rework/200/150',
    createdAt: Timestamp.now(),
  },
  {
    subjectId: 'ela',
    title: 'Essay Brainstorm',
    description: 'Brainstorm three potential topics for the upcoming research paper.',
    dueDate: Timestamp.fromDate(today),
    estimateMins: 20,
    checklist: [],
    status: 'submitted',
    evidenceUrl: 'https://picsum.photos/seed/submitted/200/150',
    submittedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
  },
  {
    subjectId: 'science',
    title: 'Chemistry Homework Set 4',
    description: 'Complete problems 1-10 from the textbook.',
    dueDate: Timestamp.fromDate(today),
    estimateMins: 35,
    checklist: [],
    status: 'todo',
    createdAt: Timestamp.now(),
  },
];

const SESSIONS = [
  {
    subjectId: 'math',
    taskId: 'task-4',
    startedAt: Timestamp.fromDate(
      new Date(yesterday.getTime() - 2 * 60 * 60 * 1000)
    ),
    endedAt: Timestamp.fromDate(
      new Date(yesterday.getTime() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000)
    ),
    durationMs: 25 * 60 * 1000,
    type: 'focus',
    checkins: [
      {
        at: Timestamp.fromDate(
          new Date(yesterday.getTime() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000)
        ),
        mood: 'focused',
      },
    ],
    createdAt: Timestamp.now(),
  },
  {
    subjectId: 'ela',
    taskId: 'task-5',
    startedAt: Timestamp.fromDate(
      new Date(yesterday.getTime() - 1 * 60 * 60 * 1000)
    ),
    endedAt: Timestamp.fromDate(
      new Date(yesterday.getTime() - 1 * 60 * 60 * 1000 + 20 * 60 * 1000)
    ),
    durationMs: 20 * 60 * 1000,
    type: 'focus',
    checkins: [],
    createdAt: Timestamp.now(),
  },
];

const seed = async () => {
  console.log('Starting seed...');

  try {
    // Seed subjects
    console.log('Seeding subjects...');
    for (const subject of SUBJECTS) {
      await setDoc(doc(db, 'subjects', subject.id), subject);
      console.log(`  ✓ ${subject.name}`);
    }

    // Seed tasks
    console.log('Seeding tasks...');
    for (const task of TASKS) {
      await addDoc(collection(db, 'tasks'), task);
      console.log(`  ✓ ${task.title}`);
    }

    // Seed sessions
    console.log('Seeding sessions...');
    for (const session of SESSIONS) {
      await addDoc(collection(db, 'sessions'), session);
      console.log(`  ✓ ${session.type} session`);
    }

    // Seed today's plan
    console.log('Seeding today\'s plan...');
    const planId = today.toISOString().split('T')[0];
    await setDoc(doc(db, 'plans', planId), {
      date: Timestamp.fromDate(today),
      taskIds: TASKS.filter((t) => {
        const dueDate = t.dueDate instanceof Timestamp ? t.dueDate.toDate() : new Date(t.dueDate);
        return dueDate.toISOString().split('T')[0] === planId;
      }).map((_, i) => `task-${i}`),
      createdAt: Timestamp.now(),
    });
    console.log(`  ✓ Plan for ${planId}`);

    // Seed global settings
    console.log('Seeding global settings...');
    await setDoc(doc(db, 'settings', 'global'), {
      startWindow: '15:30',
      inactivityMinutes: 15,
      pomodoro: { focus: 25, break: 5 },
      dailyGoal: { minutes: 90, tasks: 3 },
      webhookEnforceUrl: process.env.VITE_WEBHOOK_ENFORCE_URL || '',
      createdAt: Timestamp.now(),
    });
    console.log('  ✓ Global settings');

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();

