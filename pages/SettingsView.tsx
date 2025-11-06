
import React from 'react';
import { Bell, Clock, Target, Link } from 'lucide-react';

const SettingsView: React.FC = () => {

  const SettingRow = ({ icon, title, description, children }: { icon: React.ElementType, title: string, description: string, children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-slate-200">
      <div className="flex items-center mb-2 sm:mb-0">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-4">
          {React.createElement(icon, { size: 20 })}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-800">Settings</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">General</h3>
        
        <SettingRow icon={Target} title="Daily Goals" description="Set targets for focus minutes and tasks.">
           <div className="flex items-center space-x-2">
                <input type="number" defaultValue="90" className="w-20 p-2 border border-slate-300 rounded-md"/>
                <span>minutes</span>
                <input type="number" defaultValue="3" className="w-20 p-2 border border-slate-300 rounded-md"/>
                <span>tasks</span>
           </div>
        </SettingRow>

        <SettingRow icon={Clock} title="Pomodoro Timers" description="Configure focus and break durations.">
           <div className="flex items-center space-x-2">
                <input type="number" defaultValue="25" className="w-20 p-2 border border-slate-300 rounded-md"/>
                <span>focus</span>
                <input type="number" defaultValue="5" className="w-20 p-2 border border-slate-300 rounded-md"/>
                <span>break</span>
           </div>
        </SettingRow>

        <SettingRow icon={Link} title="Webhook URL" description="For 'Enforce Downtime' action.">
            <input type="text" placeholder="https://..." className="w-64 p-2 border border-slate-300 rounded-md"/>
        </SettingRow>

      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Notifications (TODO)</h3>
        <p className="text-slate-500 text-sm">
            This section would allow toggling notifications for different events for both Student and Parent roles.
            Implementation requires a real backend with push notification capabilities (e.g., Firebase Cloud Messaging).
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
