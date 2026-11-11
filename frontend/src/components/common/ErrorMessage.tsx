import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { parseApiError } from '../../utils/errorParser';

interface ErrorMessageProps {
  error: unknown;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  const parsed = parseApiError(error);

  return (
    <div
      role="alert"
      className={`rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-rose-950">{parsed.title}</h4>
            {parsed.status ? (
              <span className="rounded bg-rose-200/70 px-1.5 py-0.5 text-xs font-mono font-medium text-rose-800">
                HTTP {parsed.status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-rose-800 leading-relaxed">{parsed.message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-rose-400 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
