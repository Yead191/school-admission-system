import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
  size = 'md',
}) => {
  const calculateRemaining = () => {
    const expireTime = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expireTime - now) / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining);

  useEffect(() => {
    // Initial check
    const current = calculateRemaining();
    setRemainingSeconds(current);
    if (current <= 0 && onExpire) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (remainingSeconds <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>মেয়াদ শেষ হয়ে গেছে (Expired)</span>
      </div>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = remainingSeconds < 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-xl border transition-all ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
          : 'bg-amber-50 border-amber-300 text-amber-900'
      } ${
        size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : size === 'lg'
          ? 'px-4 py-2 text-base'
          : 'px-3 py-1.5 text-sm'
      }`}
    >
      <Timer className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-[11px] font-sans font-normal opacity-80">বাকি</span>
    </div>
  );
};
