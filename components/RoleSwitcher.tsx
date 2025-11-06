
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
    <div className="flex items-center bg-slate-100 rounded-full p-1 cursor-pointer">
      <div
        className={`absolute h-8 w-24 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isStudent ? 'translate-x-0' : 'translate-x-full'
        }`}
      />
      <button
        onClick={() => onRoleChange(UserRole.Student)}
        className={`z-10 flex items-center justify-center w-24 h-8 rounded-full text-sm font-semibold transition-colors ${
          isStudent ? 'text-indigo-600' : 'text-slate-500'
        }`}
      >
        <User size={16} className="mr-2" />
        Student
      </button>
      <button
        onClick={() => onRoleChange(UserRole.Parent)}
        className={`z-10 flex items-center justify-center w-24 h-8 rounded-full text-sm font-semibold transition-colors ${
          !isStudent ? 'text-indigo-600' : 'text-slate-500'
        }`}
      >
        <Shield size={16} className="mr-2" />
        Parent
      </button>
    </div>
  );
};

export default RoleSwitcher;
