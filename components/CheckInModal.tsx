
import React from 'react';
import { Mood } from '../types';
import { Smile, Frown, HelpCircle } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (mood: Mood) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onCheckIn }) => {
  if (!isOpen) return null;

  const handleMoodSelect = (mood: Mood) => {
    onCheckIn(mood);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center transform transition-all animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quick Check-in!</h2>
        <p className="text-slate-600 mb-6">How are you feeling about your focus right now?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleMoodSelect(Mood.Focused)}
            className="flex flex-col items-center p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-200"
          >
            <Smile className="w-12 h-12 text-green-500 mb-2" />
            <span className="font-semibold text-green-700">Focused</span>
          </button>
          <button
            onClick={() => handleMoodSelect(Mood.Distracted)}
            className="flex flex-col items-center p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-200"
          >
            <Frown className="w-12 h-12 text-amber-500 mb-2" />
            <span className="font-semibold text-amber-700">Distracted</span>
          </button>
          <button
            onClick={() => handleMoodSelect(Mood.NeedHelp)}
            className="flex flex-col items-center p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-200"
          >
            <HelpCircle className="w-12 h-12 text-red-500 mb-2" />
            <span className="font-semibold text-red-700">Need Help</span>
          </button>
        </div>
         <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:text-slate-700">
          Skip
        </button>
      </div>
    </div>
  );
};

export default CheckInModal;
