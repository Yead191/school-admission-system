import React, { useState } from 'react';
import { useCreateClassMutation } from '../../api/classesApi';
import { Modal } from '../common/Modal';
import { ErrorMessage } from '../common/ErrorMessage';
import { PlusCircle, Loader2 } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classId: string) => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createClass, { isLoading }] = useCreateClassMutation();
  const [name, setName] = useState('');
  const [totalSeats, setTotalSeats] = useState<number | ''>(120);
  const [error, setError] = useState<unknown | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !totalSeats || totalSeats <= 0) {
      setError({ message: 'ক্লাসের নাম এবং বৈধ সিট সংখ্যা (১ বা ততোধিক) দেওয়া আবশ্যক।' });
      return;
    }

    try {
      setError(null);
      const res = await createClass({
        name: name.trim(),
        totalSeats: Number(totalSeats),
      }).unwrap();

      setName('');
      setTotalSeats(120);
      onSuccess(res.id);
      onClose();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="নতুন ক্লাস তৈরি করুন (Admin)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <ErrorMessage error={error} onDismiss={() => setError(null)} /> : null}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            ক্লাসের নাম ও শিফট
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: Class 6 - Morning Shift"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            প্রতিটি শিফট আলাদা একটি ক্লাস হিসেবে তৈরি হবে।
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            মোট সিট সংখ্যা (Total Seats)
          </label>
          <input
            type="number"
            required
            min={1}
            max={5000}
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value ? Number(e.target.value) : '')}
            placeholder="120"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white flex items-center gap-2 transition-all shadow-sm shadow-indigo-100 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> তৈরি হচ্ছে...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> তৈরি করুন
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
