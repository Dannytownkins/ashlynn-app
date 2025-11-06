# Ashlynn App - Repository Audit

**Date:** 2024  
**Branch:** `staging/parent-student-v1`  
**Purpose:** Full repo audit and upgrade to production-ready parent-student homework coordination app

---

## Current Structure

### Components (`/components`)
- ✅ **AddTaskModal.tsx** - Modal for adding new tasks (used in ParentView)
- ✅ **CheckInModal.tsx** - Mood check-in modal (Focused/Distracted/Need help)
- ✅ **ConfirmationModal.tsx** - Generic confirmation dialog
- ✅ **ProgressRing.tsx** - Circular progress indicator for daily goals
- ✅ **RoleSwitcher.tsx** - Student/Parent mode switcher (header)
- ✅ **SubjectPill.tsx** - Subject badge component
- ✅ **TaskCard.tsx** - Task display card with expand/collapse
- ✅ **Timer.tsx** - Pomodoro timer component

**Status:** All components are functional but use mock data. No dead code.

### Pages (`/pages`)
- ✅ **StudentView.tsx** - Main student interface (Today's Plan, Timer, Progress)
- ✅ **ParentView.tsx** - Parent dashboard (Live Status, Needs Review, Recent Activity)
- ✅ **ReportsView.tsx** - Charts for time per subject (CSV export marked TODO)
- ✅ **SettingsView.tsx** - Settings UI (not persisted, no backend integration)

**Status:** All pages functional but rely on mockApi. Reports CSV export incomplete.

### Hooks (`/hooks`)
- ✅ **useTimer.ts** - Timer logic with start/stop/pause/resume
  - **Issue:** Timer state is local only, doesn't persist across reloads
  - **Issue:** No synchronization with Firestore activeSession

**Status:** Functional but needs Firestore persistence.

### Services (`/services`)
- ⚠️ **firebase.ts** - Placeholder Firebase config
  - Uses hardcoded placeholder config
  - FCM token retrieval logic exists but incomplete
  - No Firestore initialization
  - No Firebase Storage setup
- ⚠️ **mockApi.ts** - In-memory simulated API
  - All data stored in memory (tasks, sessions, subjects)
  - Simulates API latency (500ms)
  - **Action Required:** Replace with Firestore calls

**Status:** mockApi needs complete replacement with Firebase services.

### Types (`types.ts`)
- ✅ Well-defined TypeScript interfaces
- ✅ Enums for UserRole, View, TaskStatus, SessionType, Mood
- ✅ Interfaces: Subject, Task, Session, ActiveSession, DailyGoal, DailyStats

**Status:** Complete and well-structured. No changes needed.

### Constants (`constants.ts`)
- ⚠️ **SUBJECTS** - Hardcoded subject list (4 subjects)
- ⚠️ **TASKS** - Hardcoded mock tasks (6 tasks)
- ⚠️ **SESSIONS** - Hardcoded mock sessions (2 sessions)
- ⚠️ **POMODORO_SETTINGS** - Default 25/5
- ⚠️ **DAILY_GOAL** - Default 90 min / 3 tasks
- ⚠️ **LIVE_STATUS** - Mock status object
- ⚠️ **PARENT_MESSAGES** - Mock messages array
- ⚠️ **STUDENT_STREAK** - Hardcoded streak value

**Status:** All should be replaced with Firestore data. Keep as defaults/fallbacks.

### Entry Files
- ✅ **App.tsx** - Main app component with routing and role switching
- ✅ **index.tsx** - React DOM root
- ✅ **index.html** - HTML template with Tailwind CDN and Firebase SDKs
- ✅ **vite.config.ts** - Vite config with env variable handling

**Status:** Functional. index.html uses CDN for Firebase (should migrate to npm packages).

### Configuration
- ✅ **package.json** - Dependencies: React 19, lucide-react, recharts
- ⚠️ **tsconfig.json** - Not reviewed (assumed standard)
- ⚠️ **vite.config.ts** - Loads GEMINI_API_KEY from env (not used in current code)
- ❌ **.env.local** - Missing (should exist per README)
- ❌ **.env.example** - Missing

**Status:** Missing environment configuration files.

---

## Dead Code & Cleanup Targets

### Dead Code
1. **GEMINI_API_KEY** - Referenced in vite.config.ts and README but not used anywhere in codebase
   - **Decision:** Keep for now (may be used in future AI features), but document as unused

2. **metadata.json** - File exists but purpose unclear
   - **Action:** Review and remove if unused

3. **firebase-messaging-sw.js** - Service worker file exists but not referenced
   - **Action:** Integrate properly or remove

### Obvious Cleanup Targets

1. **Replace mockApi.ts** - Complete replacement with Firestore service layer
2. **Firebase initialization** - Replace placeholder config with env-driven setup
3. **Timer persistence** - Store activeSession in Firestore with lastTickAt
4. **Settings persistence** - Connect SettingsView to Firestore settings/global collection
5. **Evidence upload** - Replace dummy picsum.photos URLs with Firebase Storage
6. **Messaging system** - Currently only mock data, needs full implementation
7. **Reports CSV export** - Currently marked TODO, needs implementation
8. **Authentication** - Currently none, needs simple auth or PIN gate for Parent mode

---

## Architecture Issues

### Data Layer
- ❌ No real database (all in-memory)
- ❌ No data persistence
- ❌ No offline support
- ❌ No real-time updates

### Backend
- ❌ No Cloud Functions
- ❌ No scheduled tasks (start window, inactivity checks)
- ❌ No webhook integration (enforce downtime)

### Notifications
- ⚠️ FCM setup incomplete (token retrieval exists but not used)
- ❌ No notification sending logic
- ❌ No notification scheduling

### Performance
- ⚠️ Uses Tailwind CDN (should use build-time compilation)
- ⚠️ No code splitting or lazy loading
- ⚠️ No image optimization
- ⚠️ No Lighthouse optimization

---

## Implementation Plan

### Phase 1: Foundation
1. Set up Firebase project structure
2. Create Firestore collections schema
3. Write security rules
4. Create seed script
5. Replace mockApi with Firestore service

### Phase 2: Core Features
1. Timer persistence (Firestore activeSession)
2. Mode switching with Firestore persistence
3. Evidence upload (Firebase Storage)
4. Check-ins with Firestore
5. Messaging system

### Phase 3: Backend & Notifications
1. Cloud Functions (sessionStart, sessionStop, taskSubmit, taskRework, notify, enforce)
2. FCM notification setup
3. Cloud Scheduler for start window and inactivity

### Phase 4: Polish
1. Reports CSV export
2. UI/UX polish (mobile-first, typography, spacing)
3. Performance optimization (Lighthouse targets)
4. Unit tests

---

## Files to Create

- `/config/firebase.ts` - Firebase initialization with env config
- `/scripts/seed.ts` - Firestore seed script
- `/functions/` - Cloud Functions directory
- `/firestore.rules` - Security rules
- `/.env.example` - Environment variable template
- `/tests/` - Unit tests directory

## Files to Modify

- `services/firebase.ts` → Replace with `/config/firebase.ts`
- `services/mockApi.ts` → Replace with Firestore service calls
- `hooks/useTimer.ts` → Add Firestore sync
- `pages/SettingsView.tsx` → Add Firestore persistence
- `pages/ReportsView.tsx` → Add CSV export
- `components/Timer.tsx` → Sync with Firestore activeSession
- `README.md` → Update with Firebase setup instructions

## Files to Remove (if unused)

- `metadata.json` (if not needed)
- `firebase-messaging-sw.js` (if not properly integrated)

---

## Summary

**Current State:** Functional prototype with mock data, no persistence, no backend.

**Target State:** Production-ready app with Firebase backend, real-time sync, notifications, and polished UI.

**Risk Level:** Medium - Significant refactoring required but architecture is sound.

**Estimated Effort:** High - Full backend integration, Cloud Functions, notifications, and UI polish.

