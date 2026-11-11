import React from 'react';
import { ArrowRight, AlertOctagon } from 'lucide-react';
import type { ClassItem } from '../../types/admission';

interface ClassCardProps {
  classItem: ClassItem;
  onApply: (classId: string) => void;
  isApplying: boolean;
  isValidStudentId: boolean;
  onPromptStudentId: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  onApply,
  isApplying,
  isValidStudentId,
  onPromptStudentId,
}) => {
  const isSoldOut = classItem.availableSeats <= 0;
  const confirmedPercent = Math.min(100, Math.round((classItem.confirmedSeats / classItem.totalSeats) * 100));
  const heldPercent = Math.min(
    100 - confirmedPercent,
    Math.round((classItem.heldSeats / classItem.totalSeats) * 100)
  );

  const handleApplyClick = () => {
    if (!isValidStudentId) {
      onPromptStudentId();
      return;
    }
    onApply(classItem.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              ID: {classItem.id}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 leading-snug">
              {classItem.name}
            </h3>
          </div>
          {isSoldOut ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertOctagon className="w-3.5 h-3.5" /> সিট শেষ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ভর্তি চলছে
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>সিট বরাদ্দ অগ্রগতি</span>
            <span>
              {classItem.confirmedSeats + classItem.heldSeats} / {classItem.totalSeats}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${confirmedPercent}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`নিশ্চিত: ${classItem.confirmedSeats}`}
            />
            <div
              style={{ width: `${heldPercent}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`হোল্ডে: ${classItem.heldSeats}`}
            />
          </div>
        </div>

        {/* Seat breakdown grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50/80 rounded-xl p-2">
            <p className="text-[11px] text-slate-500 font-medium">মোট সিট</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{classItem.totalSeats}</p>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-2">
            <p className="text-[11px] text-emerald-700 font-medium">নিশ্চিত</p>
            <p className="text-base font-bold text-emerald-800 mt-0.5">{classItem.confirmedSeats}</p>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-2">
            <p className="text-[11px] text-amber-700 font-medium">হোল্ডে</p>
            <p className="text-base font-bold text-amber-800 mt-0.5">{classItem.heldSeats}</p>
          </div>
          <div className={`rounded-xl p-2 ${isSoldOut ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50/70 text-indigo-700'}`}>
            <p className="text-[11px] font-medium">খালি সিট</p>
            <p className="text-base font-bold mt-0.5">{classItem.availableSeats}</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100">
        <button
          onClick={handleApplyClick}
          disabled={isSoldOut || isApplying}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
            isSoldOut
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isApplying
              ? 'bg-indigo-400 text-white cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-200 hover:shadow-indigo-300'
          }`}
        >
          {isApplying ? (
            'সিট হোল্ড হচ্ছে...'
          ) : isSoldOut ? (
            'কোনো সিট খালি নেই'
          ) : (
            <>
              আবেদন করুন <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
