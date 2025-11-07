
import React from 'react';
import { UserRole } from '../types';
import { User, Shield } from 'lucide-react';

interface RoleSwitcherProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ role, onRoleChange }) => {
  const isStudent = role === UserRole.Student;

  return (
    <div className="flex items-center bg-slate-800/50 backdrop-blur-lg rounded-full p-1 cursor-pointer border border-purple-500/20">
      <div
        className={`absolute h-8 w-24 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/50 transition-transform duration-300 ease-in-out ${
          isStudent ? 'translate-x-0' : 'translate-x-full'
        }`}
      />
      <button
        onClick={() => onRoleChange(UserRole.Student)}
        className={`z-10 flex items-center justify-center w-24 h-8 rounded-full text-sm font-semibold transition-colors ${
          isStudent ? 'text-white' : 'text-slate-400'
        }`}
      >
        <User size={16} className="mr-2" />
        Student
      </button>
      <button
        onClick={() => onRoleChange(UserRole.Parent)}
        className={`z-10 flex items-center justify-center w-24 h-8 rounded-full text-sm font-semibold transition-colors ${
          !isStudent ? 'text-white' : 'text-slate-400'
        }`}
      >
        <Shield size={16} className="mr-2" />
        Parent
      </button>
    </div>
  );
};

export default RoleSwitcher;
