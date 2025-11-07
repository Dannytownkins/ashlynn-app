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
      className={`flex flex-col items-center justify-center space-y-1 w-full text-xs transition-all duration-200 ${
        currentView === targetView
          ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]'
          : 'text-slate-400 hover:text-purple-300'
      }`}
    >
      {React.createElement(icon, { size: 22, strokeWidth: currentView === targetView ? 2.5 : 2 })}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans flex flex-col relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>

      {/* Mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 bg-slate-900/80 backdrop-blur-lg shadow-lg shadow-purple-500/10 z-20 p-3 flex justify-between items-center border-b border-purple-500/20">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">FocusFlow</h1>
          <RoleSwitcher role={role} onRoleChange={handleRoleChange} />
        </header>

        {/* Desktop sidebar - shown for md screens and up */}
        <div className="hidden md:flex fixed top-0 left-0 h-full w-20 bg-slate-900/90 backdrop-blur-lg border-r border-purple-500/20 flex-col items-center pt-24 space-y-8 shadow-lg shadow-purple-500/10 z-20">
          <NavItem icon={role === UserRole.Student ? BookOpen : Users} label={role === UserRole.Student ? "Tasks" : "Dashboard"} currentView={view} targetView={View.Home} />
          <NavItem icon={BarChart2} label="Reports" currentView={view} targetView={View.Reports} />
          <NavItem icon={Settings} label="Settings" currentView={view} targetView={View.Settings} />
        </div>

        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 md:ml-20">
          {renderView()}
        </main>

        <nav className="sticky bottom-0 bg-slate-900/90 backdrop-blur-lg border-t border-purple-500/20 p-2 md:hidden flex justify-around shadow-lg shadow-purple-500/10">
            <NavItem icon={role === UserRole.Student ? BookOpen : Users} label={role === UserRole.Student ? "Tasks" : "Dashboard"} currentView={view} targetView={View.Home} />
            <NavItem icon={BarChart2} label="Reports" currentView={view} targetView={View.Reports} />
            <NavItem icon={Settings} label="Settings" currentView={view} targetView={View.Settings} />
        </nav>
      </div>
    </div>
  );
};

export default App;