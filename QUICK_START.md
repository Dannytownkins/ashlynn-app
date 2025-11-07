# FocusFlow Quick Start Guide 🚀

This is a **5-minute quick start** to get your homework coordinator app running. For detailed setup including push notifications, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## What This App Does

**FocusFlow** helps students stay focused on homework with Pomodoro timers and task tracking, while parents can monitor progress and provide guidance in real-time.

## Quick Start (Local Testing)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at http://localhost:3000

### 3. Try It Out

1. **Switch Roles** - Use the toggle in the top-right to switch between Student and Parent views
2. **Start a Task** - As a student, click "Start Task" on any homework item
3. **Use the Timer** - Focus timer will track your study time
4. **Submit Work** - Click "Submit" to upload photos or links
5. **Parent Review** - Switch to Parent view to approve or request revisions

## What Works Without Setup

✅ All UI features
✅ Task management
✅ Pomodoro timers
✅ Progress tracking
✅ Role switching
✅ File upload for evidence

## What Needs Firebase Setup

🔔 Push notifications between devices
☁️ Data sync across devices
💾 Persistent data storage

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md)** for Firebase setup (15 minutes)

## Using on Your iPhone

### Option 1: No Setup Required (Local Network)
1. Run `npm run dev` on your computer
2. Find your computer's IP address:
   - Mac: System Preferences > Network
   - Windows: `ipconfig` in Command Prompt
3. On your iPhone, open Safari and go to `http://YOUR-IP:3000`
4. Both devices must be on the same WiFi network

### Option 2: Deploy Online (Recommended)
Deploy to get:
- ✅ Access from anywhere
- ✅ Install on home screen like a real app
- ✅ Push notifications (with Firebase setup)

**Quick Deploy Options:**

#### Netlify (Easiest - Drag & Drop)
```bash
npm run build
```
Then drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

#### Vercel
```bash
npm install -g vercel
npm run build
vercel --prod
```

#### Firebase Hosting (If using Firebase)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Install on iPhone
Once deployed:
1. Open your deployed URL in Safari on iPhone
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. The app now appears on your home screen like a native app!

## Family Code System

- When you first open the app, a **6-character family code** is automatically created
- Find it in **Settings** tab
- Share this code with family members
- Everyone using the same code sees the same tasks and activity
- All data is kept separate per family code

## Next Steps

1. **Try it locally** - Get familiar with the features
2. **Deploy online** - Make it accessible from anywhere
3. **Set up Firebase** - Enable push notifications (see SETUP_GUIDE.md)
4. **Customize icons** - Open `create-icons.html` in browser to generate custom app icons
5. **Configure settings** - Set daily goals and Pomodoro durations in Settings tab

## Troubleshooting

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Can't Connect on iPhone
- Ensure both devices on same WiFi
- Check firewall isn't blocking port 3000
- Try accessing with computer's IP address

### Data Not Persisting
- **Without Firebase**: Data resets when you close the browser (this is normal)
- **With Firebase**: Follow SETUP_GUIDE.md to enable cloud storage

## Getting Help

- 📖 Detailed Firebase setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 🎨 Generate custom icons: Open `create-icons.html` in a browser
- 🔧 Check browser console (F12) for error messages

## Key Features

### For Students 📚
- Pomodoro timer (25 min focus / 5 min break)
- Task list with due dates
- Progress tracking
- Submit work with photos or links
- AI task breakdown (optional - requires Gemini API key)

### For Parents 👨‍👩‍👧
- Live activity status
- Review submitted work
- Assign new tasks
- Approve or request revisions
- Activity history

### For Both
- Reports & analytics
- Customizable settings
- Real-time sync (with Firebase)
- Mobile-friendly design

---

**Made with ❤️ for productive studying and supportive parenting**

Need help? Open an issue or check the detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md)
