import React from 'react';
import { School, User, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'classes' | 'my-holds';
  onTabChange: (tab: 'classes' | 'my-holds') => void;
  onOpenCreateClass: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateClass,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  School Admission System
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Sparkles className="w-3 h-3" /> FCFS Seat Booking
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                অনলাইন ভর্তি কার্যক্রম ২০২৬
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => onTabChange('classes')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'classes'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ক্লাস তালিকা (Classes)
              </button>
              <button
                onClick={() => onTabChange('my-holds')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'my-holds'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                আমার আবেদন (My Holds)
              </button>
            </nav>

            {/* Admin: Create Class Button */}
            <button
              onClick={onOpenCreateClass}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
            >
              + নতুন ক্লাস
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
