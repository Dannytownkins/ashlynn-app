
import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  seconds: number;
  isRunning: boolean;
}

interface TimerControls {
  startTimer: (durationSeconds: number) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  formattedTime: string;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const useTimer = (onTimerEnd?: () => void): TimerControls & TimerState => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // FIX: Replaced NodeJS.Timeout with a browser-compatible type.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setSeconds(0);
  }, []);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (isRunning && seconds <= 0) {
      stopTimer();
      onTimerEnd?.();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, seconds, stopTimer]);


  const startTimer = useCallback((durationSeconds: number) => {
    stopTimer(); // ensure any existing timer is cleared
    setSeconds(durationSeconds);
    setIsRunning(true);
  }, [stopTimer]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true);
    }
  }, [seconds]);

  return {
    seconds,
    isRunning,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    formattedTime: formatTime(seconds),
  };
};
