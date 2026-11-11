import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import type { HoldStatus } from '../../types/admission';

interface StatusBadgeProps {
  status: HoldStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'CONFIRMED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <CheckCircle2 className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          ভর্তি নিশ্চিত (CONFIRMED)
        </span>
      );

    case 'HELD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <Clock className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          হোল্ডে আছে (HELD)
        </span>
      );

    case 'EXPIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <AlertCircle className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          মেয়াদ শেষ (EXPIRED)
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <XCircle className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          বাতিল (CANCELLED)
        </span>
      );

    default:
      return null;
  }
};
