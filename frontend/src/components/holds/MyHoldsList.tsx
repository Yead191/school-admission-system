import React, { useState } from 'react';
import { useGetMyHoldsQuery } from '../../api/holdsApi';
import { HoldCard } from './HoldCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useAppSelector } from '../../store';
import { ClipboardList, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';

interface MyHoldsListProps {
  onGoToClasses: () => void;
  onPromptStudentId: () => void;
}

export const MyHoldsList: React.FC<MyHoldsListProps> = ({
  onGoToClasses,
  onPromptStudentId,
}) => {
  const { studentId, isValidStudentId } = useAppSelector((state) => state.auth);

  const {
    data: holds,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetMyHoldsQuery(undefined, {
    skip: !isValidStudentId,
    pollingInterval: 4000,
  });

  const [filter, setFilter] = useState<'ALL' | 'HELD' | 'CONFIRMED'>('ALL');

  if (!isValidStudentId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <KeyRound className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">শিক্ষার্থীর তথ্য আবশ্যক</h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          আপনার পূর্ববর্তী আবেদন ও বর্তমান সিট হোল্ডের অবস্থা দেখতে পৃষ্ঠার উপরের ঘরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর লিখুন।
        </p>
        <button
          onClick={onPromptStudentId}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100"
        >
          নম্বর প্রদান করুন
        </button>
      </div>
    );
  }

  const filteredHolds = (holds || []).filter((h) => {
    if (filter === 'ALL') return true;
    return h.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">আমার সকল আবেদন</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            শিক্ষার্থী: {studentId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'HELD', 'CONFIRMED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === tab
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL'
                  ? `সব (${holds?.length || 0})`
                  : tab === 'HELD'
                  ? 'হোল্ডে'
                  : 'নিশ্চিত'}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <LoadingSpinner message="আপনার আবেদনসমূহ লোড হচ্ছে..." />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : filteredHolds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">কোনো আবেদন পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 mt-1">
            এই শিক্ষার্থীর নামে এখনো কোনো সিট হোল্ড বা ভর্তি নিশ্চিত করা হয়নি।
          </p>
          <button
            onClick={onGoToClasses}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
          >
            ক্লাস তালিকায় যান <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHolds.map((hold) => (
            <HoldCard
              key={hold.holdId}
              holdId={hold.holdId}
              classId={hold.classId}
              className={hold.className}
              initialStatus={hold.status}
              expiresAt={hold.expiresAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};
