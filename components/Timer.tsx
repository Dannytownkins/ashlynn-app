
import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { SessionType } from '../types';

interface TimerProps {
  activeSessionType: SessionType | null;
  onStart: (type: SessionType, durationMins: number) => void;
  onStop: () => void;
  onTimerEnd: () => void;
}

const Timer: React.FC<TimerProps> = ({ activeSessionType, onStart, onStop, onTimerEnd }) => {
  const { seconds, isRunning, startTimer, stopTimer, formattedTime } = useTimer(onTimerEnd);
  
  const handleStart = (type: SessionType, mins: number) => {
    startTimer(mins * 60);
    onStart(type, mins);
  };
  
  const handleStop = () => {
    stopTimer();
    onStop();
  };
  
  const isFocusing = activeSessionType === SessionType.Focus;

  if (activeSessionType) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
                {isFocusing ? 'Focus Session' : 'Break Time'}
            </h2>
            <div className="text-7xl font-bold text-indigo-600 my-4 tabular-nums">
                {formattedTime}
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleStop}
                    className="flex items-center justify-center w-24 h-12 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                >
                    <Square size={20} className="mr-2" /> Stop
                </button>
                 <button
                    onClick={onTimerEnd}
                    className="flex items-center justify-center w-24 h-12 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all shadow-md hover:shadow-lg"
                >
                    <SkipForward size={20} className="mr-2" /> Skip
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ready to focus?</h2>
        <p className="text-slate-500 mb-6">Pick a preset or start a custom timer.</p>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
                onClick={() => handleStart(SessionType.Focus, 25)}
                className="w-48 h-12 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center text-lg"
            >
                <Play size={20} className="mr-2" /> Focus (25 min)
            </button>
            <button
                onClick={() => handleStart(SessionType.Break, 5)}
                className="w-48 h-12 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center text-lg"
            >
                <Play size={20} className="mr-2" /> Break (5 min)
            </button>
        </div>
    </div>
  );
};

export default Timer;
