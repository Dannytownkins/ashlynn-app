# FocusFlow - Parent-Student Homework Coordinator

A fast, clean, shared parent–student homework app built with React, TypeScript, Vite, and Firebase.

## Features

- **Student View**: Today's plan, Pomodoro timer, check-ins, evidence upload
- **Parent View**: Live status monitoring, task review, rework requests, enforce downtime
- **Messaging**: Daily threaded messages with quick reactions
- **Reports**: Time tracking charts and CSV export
- **Real-time Sync**: Firestore-powered real-time updates across devices
- **Notifications**: FCM push notifications for key events

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with:
  - Firestore Database
  - Cloud Functions
  - Cloud Messaging (FCM)
  - Storage

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database, Cloud Functions, Cloud Messaging, and Storage
3. Get your Firebase config from Project Settings > General > Your apps
4. Generate a VAPID key from Project Settings > Cloud Messaging > Web configuration

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here

# Webhook Configuration (optional)
VITE_WEBHOOK_ENFORCE_URL=https://your-webhook-url.com/enforce

# Optional: Gemini API Key (currently unused)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy `firestore.rules` to Firebase Console > Firestore Database > Rules.

### 5. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 6. Seed Initial Data

```bash
npm run seed
```

This creates:
- 3 subjects (Math, ELA, Science)
- 6 sample tasks
- Today's plan
- Sample session history
- Global settings

### 7. Service Worker Setup

Copy `firebase-messaging-sw.js` to your `public/` directory (or configure Vite to serve it from root).

Update the Firebase config in `firebase-messaging-sw.js` to match your `.env.local` values.

### 8. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
ashlynn-app/
├── components/          # React components
│   ├── Timer.tsx
│   ├── TaskCard.tsx
│   ├── EvidenceUploadModal.tsx
│   └── ...
├── pages/              # Page components
│   ├── StudentView.tsx
│   ├── ParentView.tsx
│   ├── ReportsView.tsx
│   ├── MessagesView.tsx
│   └── SettingsView.tsx
├── services/           # API services
│   ├── firestoreApi.ts # Firestore integration
│   └── firebase.ts     # FCM initialization
├── config/             # Configuration
│   └── firebase.ts     # Firebase initialization
├── hooks/              # React hooks
│   └── useTimer.ts
├── functions/          # Cloud Functions
│   └── index.ts
├── scripts/            # Utility scripts
│   └── seed.ts        # Database seed script
├── firestore.rules    # Firestore security rules
└── AUDIT.md           # Repository audit document
```

## Firestore Collections

- `subjects` - Subject definitions
- `tasks` - Homework tasks
- `sessions` - Completed focus/break sessions
- `activeSession` - Currently active session (per user)
- `plans` - Daily plans (by date)
- `messages` - Daily message threads
- `users` - User profiles and FCM tokens
- `settings/global` - Global app settings

## Cloud Functions

- `sessionStart` - Triggered when session starts (notifies parent)
- `sessionStop` - Triggered when session ends
- `taskSubmit` - Triggered when task is submitted (notifies parent)
- `taskRework` - Triggered when rework is requested (notifies student)
- `notify` - Generic notification sender
- `enforce` - Calls webhook for phone downtime enforcement
- `checkStartWindow` - Scheduled function checking start window (every 5 min)
- `checkInactivity` - Scheduled function checking inactivity (every 5 min)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run seed` - Seed Firestore with initial data

### Code Style

- TypeScript strict mode
- React functional components with hooks
- Tailwind CSS for styling
- Mobile-first responsive design

## Deployment

### Build for Production

```bash
npm run build
```

The `dist/` directory contains the production build.

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Configuration

### Customizing Colors

The app uses Tailwind CSS. To change the accent color, update the `indigo-600` classes throughout the codebase. A single CSS variable could be added for easier theming.

### Adjusting Timer Settings

Default Pomodoro settings (25 min focus, 5 min break) can be changed in:
- `constants.ts` (fallback defaults)
- Firestore `settings/global` document
- Settings page UI

### Notification Settings

Configure notification triggers in Cloud Functions or update `settings/global`:
- `startWindow`: "15:30" (study window start time)
- `inactivityMinutes`: 15 (inactivity threshold)
- `pomodoro`: { focus: 25, break: 5 }
- `dailyGoal`: { minutes: 90, tasks: 3 }

## Troubleshooting

### Firebase Not Initialized

- Check that `.env.local` exists and contains all required variables
- Verify Firebase project is active and services are enabled
- Check browser console for initialization errors

### FCM Notifications Not Working

- Ensure VAPID key is correctly set in `.env.local`
- Check that `firebase-messaging-sw.js` is accessible at root
- Verify notification permissions are granted in browser
- Check Cloud Functions logs for notification errors

### Timer Not Persisting

- Verify Firestore rules allow read/write to `activeSession` collection
- Check browser console for Firestore errors
- Ensure `updateActiveSessionTick` is being called every 30 seconds

## License

Private project for Ashlynn & Dan.
