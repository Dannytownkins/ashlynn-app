import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, View } from './types';
import RoleSwitcher from './components/RoleSwitcher';
import StudentView from './pages/StudentView';
import ParentView from './pages/ParentView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import { BookOpen, BarChart2, Settings, Users } from 'lucide-react';
import { initializeFirebaseAndAskForPermission } from './services/firebase';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [view, setView] = useState<View>(View.Home);

  useEffect(() => {
    // This effect runs once on mount to initialize notifications
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      initializeFirebaseAndAskForPermission();
    } else {
      console.warn('Push messaging is not supported by this browser.');
    }
  }, []);

  const handleRoleChange = useCallback((newRole: UserRole) => {
    setRole(newRole);
    setView(View.Home);
  }, []);
  
  const renderView = () => {
    switch (view) {
      case View.Home:
        return role === UserRole.Student ? <StudentView /> : <ParentView />;
      case View.Reports:
        return <ReportsView />;
      case View.Settings:
        return <SettingsView />;
      default:
        return role === UserRole.Student ? <StudentView /> : <ParentView />;
    }
  };

  const NavItem = ({ icon, label, currentView, targetView }: { icon: React.ElementType, label: string, currentView: View, targetView: View }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex flex-col items-center justify-center space-y-1 w-full text-xs transition-colors duration-200 ${currentView === targetView ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
    >
      {React.createElement(icon, { size: 22, strokeWidth: currentView === targetView ? 2.5 : 2 })}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-10 p-3 flex justify-between items-center border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600">FocusFlow</h1>
        <RoleSwitcher role={role} onRoleChange={handleRoleChange} />
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {renderView()}
      </main>

      <nav className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-2 md:hidden flex justify-around">
          <NavItem icon={role === UserRole.Student ? BookOpen : Users} label={role === UserRole.Student ? "Tasks" : "Dashboard"} currentView={view} targetView={View.Home} />
          <NavItem icon={BarChart2} label="Reports" currentView={view} targetView={View.Reports} />
          <NavItem icon={Settings} label="Settings" currentView={view} targetView={View.Settings} />
      </nav>
      
      {/* Desktop sidebar - shown for md screens and up */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-20 bg-white border-r border-slate-200 flex-col items-center pt-24 space-y-8">
        <NavItem icon={role === UserRole.Student ? BookOpen : Users} label={role === UserRole.Student ? "Tasks" : "Dashboard"} currentView={view} targetView={View.Home} />
        <NavItem icon={BarChart2} label="Reports" currentView={view} targetView={View.Reports} />
        <NavItem icon={Settings} label="Settings" currentView={view} targetView={View.Settings} />
      </div>
      
      <div className="md:pl-20"> {/* This pushes the main content to the right of the desktop sidebar */}
        <div className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
            {renderView()}
        </div>
      </div>
    </div>
  );
};

export default App;