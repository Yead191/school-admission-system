import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { StudentIdBar } from '../components/common/StudentIdBar';
import { ClassList } from '../components/classes/ClassList';
import { MyHoldsList } from '../components/holds/MyHoldsList';
import { CreateClassModal } from '../components/classes/CreateClassModal';
import { HoldDetailModal } from '../components/holds/HoldDetailModal';
import { Sparkles, ShieldCheck, Clock, CreditCard } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classes' | 'my-holds'>('classes');
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [activeHoldId, setActiveHoldId] = useState<string | null>(null);

  const focusStudentIdInput = () => {
    const el = document.querySelector('input[inputmode="numeric"]') as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateClass={() => setIsCreateClassOpen(true)}
      />

      {/* Student Identification Bar (Persisted in localStorage) */}
      <StudentIdBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Step-by-Step Guided Workflow Banner for Parents / Users */}
        <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>সহজ ৩টি ধাপে ভর্তি সম্পন্ন করুন</span>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  FCFS নীতি
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আগে আবেদন করলে আগে সিট পাবেন (কোনো লটারি নেই)
              </p>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              সময়সীমা: ১০ মিনিট / আবেদন
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="flex items-start gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-sm">
                ১
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">নিবন্ধন নম্বর নিশ্চিত করুন</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  উপরের ঘরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিন বা <strong>ডেমো ১, ২, ৩</strong> বাটন চাপুন।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-sm">
                ২
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  ক্লাসে আবেদন করুন <Clock className="w-3.5 h-3.5 text-amber-600" />
                </p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  পছন্দের ক্লাসের কার্ডে <strong>"আবেদন করুন"</strong> চাপুন। সিট ১০ মিনিটের জন্য আপনার নামে হোল্ড হবে।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-sm">
                ৩
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  ভর্তি ফি পরিশোধ করুন <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                </p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  কাউন্টডাউন শেষ হওয়ার পূর্বে <strong>"ভর্তি ফি দিন"</strong> চাপুন। সিট স্থায়ীভাবে নিশ্চিত হবে।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab View */}
        {activeTab === 'classes' ? (
          <ClassList
            onViewMyHolds={() => setActiveTab('my-holds')}
          />
        ) : (
          <MyHoldsList
            onGoToClasses={() => setActiveTab('classes')}
            onPromptStudentId={focusStudentIdInput}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© ২০২৬ Onnorokom Projukti Limited • School Admission System</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> High-Concurrency Architecture
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> React 18 + .NET 8
            </span>
          </div>
        </div>
      </footer>

      {/* Admin: Create Class Modal */}
      <CreateClassModal
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onSuccess={() => setActiveTab('classes')}
      />

      {/* Hold Detail & Live Payment Modal */}
      <HoldDetailModal
        holdId={activeHoldId}
        onClose={() => setActiveHoldId(null)}
        onGoToMyHolds={() => {
          setActiveHoldId(null);
          setActiveTab('my-holds');
        }}
      />
    </div>
  );
};
