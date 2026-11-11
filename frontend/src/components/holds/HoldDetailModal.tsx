import React from 'react';
import { useGetHoldByIdQuery } from '../../api/holdsApi';
import { Modal } from '../common/Modal';
import { HoldCard } from './HoldCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface HoldDetailModalProps {
  holdId: string | null;
  onClose: () => void;
  onGoToMyHolds: () => void;
}

export const HoldDetailModal: React.FC<HoldDetailModalProps> = ({
  holdId,
  onClose,
  onGoToMyHolds,
}) => {
  const { data: hold, isLoading, error } = useGetHoldByIdQuery(holdId || '', {
    skip: !holdId,
    pollingInterval: 3000,
  });

  if (!holdId) return null;

  return (
    <Modal
      isOpen={Boolean(holdId)}
      onClose={onClose}
      title="আবেদন ও সিট হোল্ডের অবস্থা"
      maxWidth="max-w-xl"
    >
      {isLoading ? (
        <LoadingSpinner message="আবেদনের তথ্য যাচাই করা হচ্ছে..." />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : hold ? (
        <div className="space-y-4">
          <HoldCard
            holdId={hold.holdId}
            classId={hold.classId}
            initialStatus={hold.status}
            expiresAt={hold.expiresAt}
          />
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                onClose();
                onGoToMyHolds();
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              সকল আবেদন দেখতে ক্লিক করুন →
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

