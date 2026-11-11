import React, { useState } from 'react';
import { CreditCard, Trash2, CheckCircle2, School } from 'lucide-react';
import type { HoldStatus } from '../../types/admission';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from './CountdownTimer';
import { useConfirmHoldMutation, useCancelHoldMutation } from '../../api/holdsApi';
import { ErrorMessage } from '../common/ErrorMessage';

interface HoldCardProps {
  holdId: string;
  classId: string;
  className?: string;
  initialStatus: HoldStatus;
  expiresAt: string;
  onRefresh?: () => void;
}

export const HoldCard: React.FC<HoldCardProps> = ({
  holdId,
  classId,
  className,
  initialStatus,
  expiresAt,
}) => {
  // Local state to instantly handle client-side expiration without page reload (Rule 9)
  const [isLocallyExpired, setIsLocallyExpired] = useState(() => {
    return initialStatus === 'HELD' && new Date(expiresAt).getTime() <= Date.now();
  });

  const [confirmHold, { isLoading: isConfirming }] = useConfirmHoldMutation();
  const [cancelHold, { isLoading: isCancelling }] = useCancelHoldMutation();
  const [error, setError] = useState<unknown | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Effective status considers live countdown
  const effectiveStatus: HoldStatus =
    initialStatus === 'HELD' && isLocallyExpired ? 'EXPIRED' : initialStatus;

  const handleConfirm = async () => {
    try {
      setError(null);
      await confirmHold(holdId).unwrap();
      setSuccessMessage('ভর্তি ফি সফলভাবে জমা নেওয়া হয়েছে! ভর্তি নিশ্চিত সম্পন্ন।');
    } catch (err) {
      setError(err);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আবেদনটি বাতিল করতে চান? সংরক্ষিত সিটটি উন্মুক্ত হয়ে যাবে।')) {
      return;
    }
    try {
      setError(null);
      await cancelHold(holdId).unwrap();
      setSuccessMessage('আবেদনটি সফলভাবে বাতিল করা হয়েছে।');
    } catch (err) {
      setError(err);
    }
  };

  const isHeld = effectiveStatus === 'HELD';
  const isConfirmed = effectiveStatus === 'CONFIRMED';
  const isCancelled = effectiveStatus === 'CANCELLED';
  const isExpired = effectiveStatus === 'EXPIRED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base leading-snug">
              {className || `Class ID: ${classId}`}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
              <span>হোল্ড আইডি: {holdId}</span>
              <span>•</span>
              <span>ক্লাস আইডি: {classId}</span>
            </div>
          </div>
        </div>

        <div>
          <StatusBadge status={effectiveStatus} />
        </div>
      </div>

      {/* Countdown section for HELD status */}
      {isHeld && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
          <div className="text-xs text-amber-900 font-medium">
            <p className="font-bold">সিট সাময়িকভাবে আপনার নামে সংরক্ষিত আছে।</p>
            <p className="opacity-90">নির্ধারিত সময়ের মধ্যে ভর্তি ফি জমা দিন, অন্যথায় সিটটি বাতিল হয়ে যাবে।</p>
          </div>
          <CountdownTimer
            expiresAt={expiresAt}
            onExpire={() => setIsLocallyExpired(true)}
          />
        </div>
      )}

      {/* Error & Success Messages */}
      {error ? <ErrorMessage error={error} onDismiss={() => setError(null)} /> : null}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {/* Cancel Button */}
        {!isConfirmed && !isCancelled && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isCancelling ? 'বাতিল হচ্ছে...' : 'আবেদন বাতিল'}
          </button>
        )}

        {/* Confirm Payment Button */}
        <button
          onClick={handleConfirm}
          disabled={!isHeld || isConfirming || isLocallyExpired}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
            isConfirmed
              ? 'bg-emerald-600 text-white cursor-default'
              : !isHeld || isLocallyExpired
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-200 hover:shadow-emerald-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {isConfirming
            ? 'ফি জমা হচ্ছে...'
            : isConfirmed
            ? 'ভর্তি ফি পরিশোধিত'
            : isLocallyExpired || isExpired
            ? 'মেয়াদ উত্তীর্ণ (ফি দেওয়া যাবে না)'
            : 'ভর্তি ফি দিন (Confirm)'}
        </button>
      </div>
    </div>
  );
};
