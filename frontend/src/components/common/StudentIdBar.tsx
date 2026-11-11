import React, { useState } from 'react';
import { Sparkles, Check, Hash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setStudentId, clearStudentId } from '../../store/slices/authSlice';

const DEMO_STUDENTS = [
  { label: 'শিক্ষার্থী ১ (Demo)', id: '20152691234567890' },
  { label: 'শিক্ষার্থী ২ (Demo)', id: '20152691234567891' },
  { label: 'শিক্ষার্থী ৩ (Demo)', id: '20152691234567892' },
];

export const StudentIdBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { studentId, isValidStudentId } = useAppSelector((state) => state.auth);
  const [inputValue, setInputValue] = useState(studentId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 17); // allow only digits, max 17
    setInputValue(val);
    dispatch(setStudentId(val));
  };

  const handleApplyDemo = (demoId: string) => {
    setInputValue(demoId);
    dispatch(setStudentId(demoId));
  };

  const handleClear = () => {
    setInputValue('');
    dispatch(clearStudentId());
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-4 px-4 sm:px-6 shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Help description */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-indigo-200">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white tracking-wide">
                শিক্ষার্থীর জন্ম নিবন্ধন নম্বর (X-Student-Id)
              </h2>
              {isValidStudentId && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> যাচাইকৃত
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-200/80">
              ভর্তি আবেদন, হোল্ড ও ফি পরিশোধের জন্য ১৭ অঙ্কের নম্বরটি প্রয়োজন
            </p>
          </div>
        </div>

        {/* Input box & Quick Actions */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={17}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="১৭ অঙ্কের নম্বর লিখুন..."
              className={`w-full bg-white/10 backdrop-blur-md border rounded-xl py-2 pl-3.5 pr-20 text-sm font-mono text-white placeholder-indigo-300/60 focus:outline-none focus:ring-2 transition-all ${
                isValidStudentId
                  ? 'border-emerald-400 focus:ring-emerald-400'
                  : inputValue.length > 0
                  ? 'border-amber-400 focus:ring-amber-400'
                  : 'border-white/20 focus:ring-indigo-400'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs">
              <span
                className={`font-mono text-[11px] font-semibold ${
                  isValidStudentId
                    ? 'text-emerald-300'
                    : inputValue.length > 0
                    ? 'text-amber-300'
                    : 'text-indigo-300/70'
                }`}
              >
                {inputValue.length}/17
              </span>
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="text-white/50 hover:text-white p-0.5 ml-1"
                  title="মুছে ফেলুন"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Demo Selector */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] text-indigo-300/80 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3" /> ডেমো:
            </span>
            {DEMO_STUDENTS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleApplyDemo(demo.id)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                  studentId === demo.id
                    ? 'bg-indigo-500 text-white font-bold ring-2 ring-white/30'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                {demo.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
