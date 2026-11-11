import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Trash2,
  School,
  ArrowRight,
  Check,
  Printer,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CountdownTimer } from './CountdownTimer';
import { ErrorMessage } from '../common/ErrorMessage';
import { useCreateHoldMutation, useConfirmHoldMutation, useCancelHoldMutation } from '../../api/holdsApi';
import { useAppDispatch, useAppSelector } from '../../store';
import { setStudentId } from '../../store/slices/authSlice';
import type { ClassItem, HoldResponse } from '../../types/admission';

interface AdmissionFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: ClassItem | null;
  onViewMyHolds: () => void;
}

export const AdmissionFlowModal: React.FC<AdmissionFlowModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  onViewMyHolds,
}) => {
  const dispatch = useAppDispatch();
  const { studentId } = useAppSelector((state) => state.auth);

  // Flow steps: 'CONFIRM_INFO' -> 'HOLD_ACTIVE' -> 'PAYMENT_SUCCESS'
  const [step, setStep] = useState<'CONFIRM_INFO' | 'HOLD_ACTIVE' | 'PAYMENT_SUCCESS'>('CONFIRM_INFO');

  const [inputStudentId, setInputStudentId] = useState(studentId);
  const [activeHold, setActiveHold] = useState<HoldResponse | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const [createHold, { isLoading: isHolding }] = useCreateHoldMutation();
  const [confirmHold, { isLoading: isConfirming }] = useConfirmHoldMutation();
  const [cancelHold, { isLoading: isCancelling }] = useCancelHoldMutation();

  // Reset when class changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('CONFIRM_INFO');
      setActiveHold(null);
      setIsExpired(false);
      setError(null);
      setInputStudentId(studentId);
    }
  }, [isOpen, selectedClass, studentId]);

  if (!isOpen || !selectedClass) return null;

  const isInputValid = /^\d{17}$/.test(inputStudentId);

  // Step 1: Trigger Seat Hold
  const handleHoldSeat = async () => {
    if (!isInputValid) {
      setError({ message: 'অনুগ্রহ করে ১৭ অঙ্কের সঠিক জন্ম নিবন্ধন নম্বর প্রদান করুন।' });
      return;
    }

    try {
      setError(null);
      // Update global studentId in Redux & localStorage
      if (inputStudentId !== studentId) {
        dispatch(setStudentId(inputStudentId));
      }

      const res = await createHold(selectedClass.id).unwrap();
      setActiveHold(res);
      setStep('HOLD_ACTIVE');
    } catch (err) {
      setError(err);
    }
  };

  // Step 2: Confirm Payment
  const handleConfirmPayment = async () => {
    if (!activeHold) return;

    try {
      setError(null);
      await confirmHold(activeHold.holdId).unwrap();
      setStep('PAYMENT_SUCCESS');
    } catch (err) {
      setError(err);
    }
  };

  // Cancel Hold
  const handleCancelHold = async () => {
    if (!activeHold) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে আবেদনটি বাতিল করতে চান? সিটটি অন্যদের জন্য উন্মুক্ত হয়ে যাবে।')) {
      return;
    }

    try {
      setError(null);
      await cancelHold(activeHold.holdId).unwrap();
      onClose();
    } catch (err) {
      setError(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ভর্তি আবেদন প্রক্রিয়া (Admission Flow)"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Visual Stepper */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'CONFIRM_INFO'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              ১
            </span>
            <span className={`text-xs font-semibold ${step === 'CONFIRM_INFO' ? 'text-indigo-900 font-bold' : 'text-slate-500'}`}>
              তথ্য ও হোল্ড
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'HOLD_ACTIVE'
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : step === 'PAYMENT_SUCCESS'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              ২
            </span>
            <span className={`text-xs font-semibold ${step === 'HOLD_ACTIVE' ? 'text-indigo-900 font-bold' : 'text-slate-500'}`}>
              ফি পরিশোধ
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'PAYMENT_SUCCESS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              ৩
            </span>
            <span className={`text-xs font-semibold ${step === 'PAYMENT_SUCCESS' ? 'text-emerald-900 font-bold' : 'text-slate-500'}`}>
              ভর্তি নিশ্চিত
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error ? <ErrorMessage error={error} onDismiss={() => setError(null)} /> : null}

        {/* ================= STEP 1: CONFIRM INFO ================= */}
        {step === 'CONFIRM_INFO' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Selected Class Summary Card */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-mono font-semibold text-indigo-700 uppercase">
                    নির্বাচিত ক্লাস
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{selectedClass.name}</h4>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    <span>মোট সিট: <strong>{selectedClass.totalSeats}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      খালি সিট: {selectedClass.availableSeats}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student ID Input Form */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                শিক্ষার্থীর ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={17}
                  value={inputStudentId}
                  onChange={(e) => setInputStudentId(e.target.value.replace(/\D/g, '').slice(0, 17))}
                  placeholder="20152691234567890"
                  className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-3.5 pr-20 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    isInputValid
                      ? 'border-emerald-500 focus:ring-emerald-500/20'
                      : inputStudentId.length > 0
                      ? 'border-amber-400 focus:ring-amber-400/20'
                      : 'border-slate-200 focus:ring-indigo-500/20'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                  {inputStudentId.length}/17
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                এই নম্বরের বিপরীতে সিটটি সাময়িকভাবে ১০ মিনিটের জন্য সংরক্ষিত থাকবে।
              </p>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleHoldSeat}
                disabled={!isInputValid || isHolding || selectedClass.availableSeats <= 0}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white flex items-center gap-2 transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isHolding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> সিট বুক হচ্ছে...
                  </>
                ) : (
                  <>
                    সিট হোল্ড করুন <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: HOLD ACTIVE & PAYMENT ================= */}
        {step === 'HOLD_ACTIVE' && activeHold && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Live Countdown Card */}
            <div className={`rounded-2xl p-5 border text-center transition-all ${
              isExpired ? 'bg-rose-50 border-rose-200' : 'bg-amber-50/80 border-amber-200'
            }`}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  {isExpired ? 'আবেদনের সময়সীমা শেষ' : 'সিট সংরক্ষিত আছে (মেয়াদ শেষ হতে বাকি)'}
                </span>

                <CountdownTimer
                  expiresAt={activeHold.expiresAt}
                  size="lg"
                  onExpire={() => setIsExpired(true)}
                />

                <p className="text-xs text-slate-600 max-w-sm mt-1">
                  {isExpired
                    ? 'দুঃখিত, নির্ধারিত সময়ের মধ্যে ফি জমা না হওয়ায় সিটটি ফেরত চলে গেছে।'
                    : 'এই কাউন্টডাউন শেষ হওয়ার পূর্বে "ভর্তি ফি দিন" বাটনে চাপ দিয়ে ভর্তি চূড়ান্ত করুন।'}
                </p>
              </div>
            </div>

            {/* Hold Details Summary */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>হোল্ড আইডি:</span>
                <span className="font-bold text-slate-900">{activeHold.holdId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ক্লাস ও শিফট:</span>
                <span className="font-bold text-slate-900 font-sans">{selectedClass.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>শিক্ষার্থী জন্ম নিবন্ধন:</span>
                <span className="font-bold text-slate-900">{activeHold.studentId}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelHold}
                disabled={isCancelling}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isCancelling ? 'বাতিল হচ্ছে...' : 'আবেদন বাতিল'}
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isConfirming || isExpired}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isExpired
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-100'
                }`}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> ফি জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> ভর্তি ফি দিন (Confirm)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PAYMENT SUCCESS ================= */}
        {step === 'PAYMENT_SUCCESS' && activeHold && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" /> ভর্তি চূড়ান্ত সফল
              </span>
              <h3 className="text-xl font-bold text-slate-900">অভিনন্দন! ভর্তি সম্পন্ন হয়েছে</h3>
              <p className="text-xs text-slate-600 mt-1">
                ভর্তি ফি সফলভাবে জমা নেওয়া হয়েছে এবং আপনার সিট নিশ্চিত হয়েছে।
              </p>
            </div>

            {/* Official Confirmation Slip */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  ভর্তি নিশ্চিতকরণ রসিদ
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date().toLocaleDateString('bn-BD')}
                </span>
              </div>

              <div className="space-y-2 font-mono text-slate-700">
                <div className="flex justify-between">
                  <span>ক্লাস:</span>
                  <span className="font-bold text-slate-900 font-sans">{selectedClass.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>শিক্ষার্থীর নিবন্ধন:</span>
                  <span className="font-bold text-slate-900">{inputStudentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>ট্রানজ্যাকশন আইডি:</span>
                  <span className="font-bold text-slate-900">{activeHold.holdId}</span>
                </div>
                <div className="flex justify-between">
                  <span>স্ট্যাটাস:</span>
                  <span className="font-bold text-emerald-700 font-sans flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> CONFIRMED
                  </span>
                </div>
              </div>
            </div>

            {/* Final Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" /> রসিদ প্রিন্ট করুন
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewMyHolds();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                আমার আবেদন তালিকায় যান <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
