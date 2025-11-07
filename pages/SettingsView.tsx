
import React, { useState, useEffect } from 'react';
import { Bell, Clock, Target, Link, CheckCircle2, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import FirebaseSetupWizard from '../components/FirebaseSetupWizard';
import {
  isFirebaseConfigured,
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  initializeFirebaseAndAskForPermission,
  getFCMToken,
  type FirebaseConfig,
} from '../services/firebase';

const SettingsView: React.FC = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationSettings, setNotificationSettings] = useState({
    taskReminders: true,
    taskDue: true,
    parentMessages: true,
    checkIns: true,
    dailyReport: false,
  });

  useEffect(() => {
    // Check if Firebase is configured
    setIsConfigured(isFirebaseConfigured());
    setFcmToken(getFCMToken());

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleSetupComplete = async (config: FirebaseConfig) => {
    saveFirebaseConfig(config);
    setIsConfigured(true);
    setShowSetupWizard(false);

    // Try to get permission and token
    const token = await initializeFirebaseAndAskForPermission();
    if (token) {
      setFcmToken(token);
      setNotificationPermission('granted');
    }
  };

  const handleResetConfig = () => {
    if (confirm('Are you sure you want to reset Firebase configuration? You will need to set it up again.')) {
      clearFirebaseConfig();
      setIsConfigured(false);
      setFcmToken(null);
    }
  };

  const handleRequestPermission = async () => {
    const token = await initializeFirebaseAndAskForPermission();
    if (token) {
      setFcmToken(token);
      setNotificationPermission('granted');
    } else {
      setNotificationPermission(Notification.permission);
    }
  };

  const toggleNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key] });
    // In a real app, you would save these preferences to your backend
  };

  const SettingRow = ({ icon, title, description, children }: { icon: React.ElementType, title: string, description: string, children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-purple-500/20 last:border-0">
      <div className="flex items-center mb-2 sm:mb-0">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2 rounded-lg mr-4 shadow-lg shadow-purple-500/50">
          {React.createElement(icon, { size: 20 })}
        </div>
        <div>
          <h4 className="font-semibold text-slate-100">{title}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );

  const NotificationToggle = ({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-purple-500/10 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/50' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Settings</h2>

      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-6">
        <h3 className="text-xl font-bold text-slate-100 mb-4">General</h3>

        <SettingRow icon={Target} title="Daily Goals" description="Set targets for focus minutes and tasks.">
           <div className="flex items-center space-x-2 text-slate-300">
                <input type="number" defaultValue="90" className="w-20 p-2 bg-slate-700/50 border border-purple-500/30 rounded-md text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"/>
                <span>minutes</span>
                <input type="number" defaultValue="3" className="w-20 p-2 bg-slate-700/50 border border-purple-500/30 rounded-md text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"/>
                <span>tasks</span>
           </div>
        </SettingRow>

        <SettingRow icon={Clock} title="Pomodoro Timers" description="Configure focus and break durations.">
           <div className="flex items-center space-x-2 text-slate-300">
                <input type="number" defaultValue="25" className="w-20 p-2 bg-slate-700/50 border border-purple-500/30 rounded-md text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"/>
                <span>focus</span>
                <input type="number" defaultValue="5" className="w-20 p-2 bg-slate-700/50 border border-purple-500/30 rounded-md text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"/>
                <span>break</span>
           </div>
        </SettingRow>

        <SettingRow icon={Link} title="Webhook URL" description="For 'Enforce Downtime' action.">
            <input type="text" placeholder="https://..." className="w-64 p-2 bg-slate-700/50 border border-purple-500/30 rounded-md text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"/>
        </SettingRow>

      </div>

      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-100">Push Notifications</h3>
          {isConfigured ? (
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={20} className="text-green-400" />
              <span className="text-sm text-green-400 font-medium">Configured</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} className="text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Not Configured</span>
            </div>
          )}
        </div>

        {!isConfigured ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-lg border-2 border-indigo-500/30">
              <p className="text-slate-300 mb-3">
                Push notifications keep you and your daughter updated on tasks, reminders, and progress.
                Set up Firebase Cloud Messaging to enable this feature.
              </p>
              <button
                onClick={() => setShowSetupWizard(true)}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all shadow-lg shadow-purple-500/50"
              >
                Start Setup Guide
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-slate-700/30 p-4 rounded-lg space-y-2 border border-purple-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Permission Status:</span>
                {notificationPermission === 'granted' ? (
                  <span className="flex items-center text-sm text-green-400">
                    <CheckCircle2 size={16} className="mr-1" /> Granted
                  </span>
                ) : notificationPermission === 'denied' ? (
                  <span className="flex items-center text-sm text-red-400">
                    <XCircle size={16} className="mr-1" /> Denied
                  </span>
                ) : (
                  <span className="flex items-center text-sm text-amber-400">
                    <AlertTriangle size={16} className="mr-1" /> Not Requested
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">FCM Token:</span>
                <span className="text-xs text-slate-400 font-mono">
                  {fcmToken ? `${fcmToken.substring(0, 20)}...` : 'Not available'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Project ID:</span>
                <span className="text-xs text-slate-400">
                  {getFirebaseConfig()?.projectId || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Actions */}
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all shadow-lg shadow-purple-500/50"
              >
                Enable Notifications
              </button>
            )}

            {/* Notification Preferences */}
            {notificationPermission === 'granted' && (
              <div className="mt-6">
                <h4 className="font-semibold text-slate-100 mb-3">Notification Preferences</h4>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-purple-500/10">
                  <NotificationToggle
                    label="Task Reminders (15 min before due)"
                    enabled={notificationSettings.taskReminders}
                    onChange={() => toggleNotificationSetting('taskReminders')}
                  />
                  <NotificationToggle
                    label="Task Due Notifications"
                    enabled={notificationSettings.taskDue}
                    onChange={() => toggleNotificationSetting('taskDue')}
                  />
                  <NotificationToggle
                    label="Parent Messages"
                    enabled={notificationSettings.parentMessages}
                    onChange={() => toggleNotificationSetting('parentMessages')}
                  />
                  <NotificationToggle
                    label="Check-in Reminders"
                    enabled={notificationSettings.checkIns}
                    onChange={() => toggleNotificationSetting('checkIns')}
                  />
                  <NotificationToggle
                    label="Daily Progress Report (End of day)"
                    enabled={notificationSettings.dailyReport}
                    onChange={() => toggleNotificationSetting('dailyReport')}
                  />
                </div>
              </div>
            )}

            {/* Reset Configuration */}
            <div className="pt-4 border-t border-purple-500/20">
              <button
                onClick={handleResetConfig}
                className="flex items-center text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                <Trash2 size={16} className="mr-1" />
                Reset Firebase Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {showSetupWizard && (
        <FirebaseSetupWizard
          onComplete={handleSetupComplete}
          onSkip={() => setShowSetupWizard(false)}
        />
      )}
    </div>
  );
};

export default SettingsView;
