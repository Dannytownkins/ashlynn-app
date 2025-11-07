import React, { useState, useEffect } from 'react';
import { Bell, Clock, Target, Link, Users, Check } from 'lucide-react';
import * as api from '../services/api';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [familyCode, setFamilyCodeState] = useState('');
  const [newFamilyCode, setNewFamilyCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  useEffect(() => {
    loadSettings();
    setFamilyCodeState(api.getCurrentFamilyCode());
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsData = await api.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    setSaveMessage('');
    try {
      await api.updateSettings(settings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleJoinFamily = () => {
    if (newFamilyCode.trim()) {
      api.setFamilyCode(newFamilyCode.trim());
      // Page will reload automatically
    }
  };

  const handleEnableNotifications = async () => {
    setNotificationStatus('Requesting permission...');
    try {
      await api.initializeFirebaseAndAskForPermission();
      setNotificationStatus('Notifications enabled!');
      setTimeout(() => setNotificationStatus(''), 3000);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setNotificationStatus('Failed to enable notifications');
    }
  };

  const SettingRow = ({
    icon,
    title,
    description,
    children
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-slate-200 last:border-0">
      <div className="flex items-center mb-2 sm:mb-0">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-4 flex-shrink-0">
          {React.createElement(icon, { size: 20 })}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="ml-12 sm:ml-0">
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
        {saveMessage && (
          <div className="flex items-center text-sm text-green-600">
            <Check size={16} className="mr-1" />
            {saveMessage}
          </div>
        )}
      </div>

      {/* Family Code Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <Users size={24} className="mr-3" />
          <h3 className="text-xl font-bold">Family Code</h3>
        </div>
        <p className="text-indigo-100 mb-4">
          Share this code with family members to sync data across devices. Both parent and student should use the same code.
        </p>
        <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
          <div className="text-sm text-indigo-100 mb-1">Your Family Code:</div>
          <div className="text-3xl font-bold tracking-wider font-mono">{familyCode}</div>
        </div>
        <div className="border-t border-white border-opacity-20 pt-4">
          <div className="text-sm text-indigo-100 mb-2">Join a different family:</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter family code"
              value={newFamilyCode}
              onChange={(e) => setNewFamilyCode(e.target.value.toUpperCase())}
              className="flex-1 p-2 rounded-md text-slate-800 uppercase font-mono"
              maxLength={6}
            />
            <button
              onClick={handleJoinFamily}
              disabled={!newFamilyCode.trim()}
              className="px-4 py-2 bg-white text-indigo-600 rounded-md font-semibold disabled:opacity-50 hover:bg-indigo-50 transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">General</h3>

        <SettingRow icon={Target} title="Daily Goals" description="Set targets for focus minutes and tasks.">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={settings?.dailyGoalMinutes || 120}
              onChange={(e) => handleUpdateSetting('dailyGoalMinutes', parseInt(e.target.value))}
              className="w-20 p-2 border border-slate-300 rounded-md"
            />
            <span className="text-sm text-slate-600">minutes</span>
            <input
              type="number"
              value={settings?.dailyGoalTasks || 3}
              onChange={(e) => handleUpdateSetting('dailyGoalTasks', parseInt(e.target.value))}
              className="w-20 p-2 border border-slate-300 rounded-md"
            />
            <span className="text-sm text-slate-600">tasks</span>
          </div>
        </SettingRow>

        <SettingRow icon={Clock} title="Pomodoro Timers" description="Configure focus and break durations (minutes).">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={settings?.pomodoroFocus || 25}
              onChange={(e) => handleUpdateSetting('pomodoroFocus', parseInt(e.target.value))}
              className="w-20 p-2 border border-slate-300 rounded-md"
            />
            <span className="text-sm text-slate-600">focus</span>
            <input
              type="number"
              value={settings?.pomodoroBreak || 5}
              onChange={(e) => handleUpdateSetting('pomodoroBreak', parseInt(e.target.value))}
              className="w-20 p-2 border border-slate-300 rounded-md"
            />
            <span className="text-sm text-slate-600">break</span>
          </div>
        </SettingRow>

        <SettingRow icon={Link} title="Webhook URL" description="For 'Enforce Downtime' action (optional).">
          <input
            type="text"
            value={settings?.webhookUrl || ''}
            onChange={(e) => handleUpdateSetting('webhookUrl', e.target.value)}
            placeholder="https://..."
            className="w-full sm:w-64 p-2 border border-slate-300 rounded-md"
          />
        </SettingRow>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="mr-3 text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Push Notifications</h3>
          </div>
        </div>
        <p className="text-slate-600 mb-4">
          Enable push notifications to receive alerts when:
        </p>
        <ul className="text-sm text-slate-600 mb-4 space-y-1 ml-4">
          <li>• Study sessions start or end</li>
          <li>• Tasks are assigned or completed</li>
          <li>• Work is submitted for review</li>
          <li>• Help is needed</li>
        </ul>
        <button
          onClick={handleEnableNotifications}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Enable Notifications
        </button>
        {notificationStatus && (
          <div className="mt-2 text-sm text-slate-600">
            {notificationStatus}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-4">
          Note: Push notifications require a Firebase project to be configured. See SETUP_GUIDE.md for instructions.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
