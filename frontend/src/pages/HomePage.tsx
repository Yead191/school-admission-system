import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { StudentIdBar } from '../components/common/StudentIdBar';
import { ClassList } from '../components/classes/ClassList';
import { MyHoldsList } from '../components/holds/MyHoldsList';
import { CreateClassModal } from '../components/classes/CreateClassModal';
import { HoldDetailModal } from '../components/holds/HoldDetailModal';
import { Info, Sparkles, ShieldCheck } from 'lucide-react';

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

  const handleHoldSuccess = (holdId: string) => {
    setActiveHoldId(holdId);
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
        {/* Informative Rule Notice Banner */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-indigo-100/70 text-indigo-700 flex-shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-indigo-950 space-y-1 leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-900 text-sm">
                ভর্তি নীতি ও নিয়মাবলী ("আগে আবেদন করলে আগে পাবেন")
              </span>
              <span className="text-[11px] font-semibold bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">
                No Lottery
              </span>
            </div>
            <p className="text-slate-600">
              ১. আবেদন সম্পন্ন করলে নির্ধারিত সময়ের জন্য সিটটি আপনার নামে <strong>Hold</strong> থাকবে।<br />
              ২. উক্ত সময়ের মধ্যে <strong>ভর্তি ফি</strong> পরিশোধ করলে আপনার ভর্তি <strong>Confirm</strong> হবে।<br />
              ৩. নির্ধারিত সময় অতিক্রম করলে সিটটি স্বয়ংক্রিয়ভাবে অন্যদের আবেদনের জন্য পুনরায় উন্মুক্ত হয়ে যাবে।
            </p>
          </div>
        </div>

        {/* Tab View */}
        {activeTab === 'classes' ? (
          <ClassList
            onHoldSuccess={handleHoldSuccess}
            onPromptStudentId={focusStudentIdInput}
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

