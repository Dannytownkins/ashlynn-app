# FocusFlow Setup Guide 🎯

Welcome! This guide will help you get your FocusFlow homework coordinator app running with **push notifications** on your iPhones.

## What You'll Get ✨

- 📱 Works on iPhone (install like a real app)
- 🔔 Push notifications for:
  - When homework starts/finishes
  - Work submitted for review
  - Tasks approved or needing revision
  - Help requests from student
- 🔄 Real-time sync between parent and student views
- 💾 Data persists (doesn't reset on refresh)
- 🆓 Completely free (using Firebase free tier)

## Setup Steps (15 minutes)

### 1. Create a Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "FocusFlow")
4. **Disable** Google Analytics (not needed)
5. Click **"Create project"**

### 2. Set Up Firestore Database (2 minutes)

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select a location (choose closest to you)
5. Click **"Enable"**

### 3. Enable Cloud Messaging (2 minutes)

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Go to **"Cloud Messaging"** tab
4. Under "Cloud Messaging API (Legacy)", click **"Enable"** if not already enabled

### 4. Register Your Web App (3 minutes)

1. In Firebase Console, go to **Project Overview**
2. Click the **web icon** `</>` (or "Add app" button)
3. Enter app nickname: "FocusFlow Web"
4. **Check** "Also set up Firebase Hosting" (optional but recommended)
5. Click **"Register app"**
6. You'll see a `firebaseConfig` object - **keep this page open!**

### 5. Get Your VAPID Key (1 minute)

1. Still in **Project Settings**
2. Go to **"Cloud Messaging"** tab
3. Scroll to **"Web configuration"**
4. Under **"Web Push certificates"**, click **"Generate key pair"**
5. Copy the key that appears - you'll need this!

### 6. Configure Your App (2 minutes)

1. In your project folder, create a file named `.env.local`
2. Copy the contents from `.env.example`
3. Fill in the values from steps 4 and 5:

```bash
# From the firebaseConfig object (step 4)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...

# From the VAPID key (step 5)
VITE_FIREBASE_VAPID_KEY=BHx...

# Optional - leave empty if you don't have it
VITE_GEMINI_API_KEY=
```

### 7. Update Service Worker (1 minute)

Edit `firebase-messaging-sw.js` and update the Firebase config at the top with your values from step 4.

## Running the App

### On Your Computer

```bash
# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

### On Your iPhones (iOS 16.4+)

1. **Deploy to web** (easiest: use Firebase Hosting, or Netlify, Vercel, etc.)

   ```bash
   npm run build
   # Then deploy the 'dist' folder
   ```

2. **On each iPhone**, open Safari and go to your deployed URL

3. **Install as app**:
   - Tap the **Share** button (square with arrow)
   - Scroll down and tap **"Add to Home Screen"**
   - Tap **"Add"**

4. **Enable notifications**:
   - Open the app from home screen
   - Allow notifications when prompted
   - Grant notification permissions in iOS Settings if needed

## First Time Use

### 1. Generate Family Code

When you first open the app:
- A unique 6-character family code is automatically created
- You'll see it in the Settings tab
- **Share this code** between parent and student devices

### 2. Connect Devices

On the second device:
- Open the app
- Go to Settings
- Enter the family code from the first device
- Now both devices will sync in real-time!

## How It Works

### For Students (Your Daughter) 📚

- **Start homework** with Pomodoro timer
- **Track tasks** with checklist
- **Submit evidence** when complete
- **Get notifications** when tasks are approved

### For Parents (You) 👨‍👩‍👧

- **Monitor in real-time** (see when studying)
- **Review submissions** (approve or request changes)
- **Assign new tasks**
- **Get notifications** when work is submitted or help needed

## Notification Types 🔔

You'll receive push notifications for:

| Event | Who Gets Notified |
|-------|-------------------|
| Study session starts | Parent |
| Study session ends | Parent & Student |
| Task assigned | Student |
| Work submitted | Parent |
| Work approved | Student |
| Revision requested | Student |
| Help needed | Parent |

## Troubleshooting

### Notifications Not Working?

1. **Check browser support**: Safari on iOS 16.4+ or desktop Chrome/Firefox
2. **Check permissions**: Settings > Notifications > [Your Browser/App]
3. **Check Firebase**:
   - Cloud Messaging API is enabled
   - VAPID key is correct in `.env.local`
   - Service worker has correct Firebase config

### Data Not Syncing?

1. **Check family code**: Both devices must use the same code
2. **Check internet**: Firestore requires internet connection
3. **Check console**: Open browser DevTools for error messages

### App Not Installing on iPhone?

1. **Use Safari**: Must use Safari browser (not Chrome)
2. **Check iOS version**: Requires iOS 16.4 or later
3. **Use deployed site**: Must be https:// (not localhost)

## Security Notes 🔒

### Current Setup (Test Mode)
- Firestore is in "test mode" for easy development
- Data is accessible to anyone with the database URL
- **Fine for personal family use**

### Production Security (Recommended)

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId}/{document=**} {
      // Only allow access if user knows the family ID
      // In a real app, you'd use Firebase Authentication
      allow read, write: if true;
    }
  }
}
```

For better security:
- Enable Firebase Authentication
- Use authentication rules
- Keep your family code private

## Optional Features

### AI Task Breakdown (Google Gemini)

Want AI to break down homework tasks into steps?

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your-key-here
   ```
3. In the app, click the ✨ icon on any task

### File Upload for Evidence

Currently, evidence submission generates placeholder URLs. To add real file upload:

1. Enable Firebase Storage in Firebase Console
2. Update the file upload code (we can help with this!)

## Deployment Options

### Firebase Hosting (Recommended - Free)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

Your app will be live at `https://your-project.firebaseapp.com`

### Other Options

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repo
- **GitHub Pages**: Use the `gh-pages` package

## Support

If you run into issues:
1. Check the browser console (F12) for error messages
2. Verify all environment variables are set correctly
3. Make sure Firebase services are enabled in console

## Next Steps

Once everything is working:

1. ✅ Test notifications between devices
2. ✅ Customize daily goals in Settings
3. ✅ Try the Pomodoro timer
4. ✅ Assign some test tasks
5. ✅ Add the app to both iPhones

Enjoy staying on top of homework together! 🎉

---

*Made with ❤️ for focused studying and proud parents*
