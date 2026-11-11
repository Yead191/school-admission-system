import React, { useState } from 'react';
import { RefreshCw, Search, GraduationCap } from 'lucide-react';
import { useGetClassesQuery } from '../../api/classesApi';
import { useCreateHoldMutation } from '../../api/holdsApi';
import { ClassCard } from './ClassCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useAppSelector } from '../../store';

interface ClassListProps {
  onHoldSuccess: (holdId: string) => void;
  onPromptStudentId: () => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  onHoldSuccess,
  onPromptStudentId,
}) => {
  // Polling every 3000ms (3 seconds) fulfills Rule 10:
  // "Class-এর seat সংখ্যা page reload ছাড়াই কয়েক সেকেন্ড পরপর হালনাগাদ হবে।"
  const { data: classes, isLoading, error, refetch, isFetching } = useGetClassesQuery(
    undefined,
    { pollingInterval: 3000 }
  );

  const [createHold, { isLoading: isHolding }] = useCreateHoldMutation();
  const { isValidStudentId } = useAppSelector((state) => state.auth);

  const [applyingClassId, setApplyingClassId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<unknown | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleApply = async (classId: string) => {
    try {
      setApplyingClassId(classId);
      setApplyError(null);
      const result = await createHold(classId).unwrap();
      onHoldSuccess(result.holdId);
    } catch (err) {
      setApplyError(err);
    } finally {
      setApplyingClassId(null);
    }
  };

  const filteredClasses = (classes || []).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্লাস বা শিফট খুঁজুন (e.g. Class 6)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>লাইভ হালনাগাদ (প্রতি ৩ সে.)</span>
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

      {/* Action / Apply Error Banner */}
      {applyError ? (
        <ErrorMessage
          error={applyError}
          onDismiss={() => setApplyError(null)}
          className="animate-in fade-in slide-in-from-top-2 duration-200"
        />
      ) : null}

      {/* Main Content */}
      {isLoading ? (
        <LoadingSpinner message="ক্লাসের তালিকা লোড হচ্ছে..." />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">কোনো ক্লাস পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery
              ? 'আপনার সার্চ কুয়েরির সাথে কোনো ক্লাস মেলেনি।'
              : 'এখনো কোনো ক্লাস তৈরি করা হয়নি। অ্যাডমিন হিসেবে নতুন ক্লাস যোগ করুন।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              classItem={item}
              onApply={handleApply}
              isApplying={isHolding && applyingClassId === item.id}
              isValidStudentId={isValidStudentId}
              onPromptStudentId={onPromptStudentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
