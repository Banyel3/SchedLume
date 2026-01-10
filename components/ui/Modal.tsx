'use client';

import { useEffect, useCallback, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:bg-black/50 md:items-center md:justify-center md:p-4">
      {/* Mobile: Full screen, Desktop: Centered modal */}
      <div className="flex flex-col h-full w-full md:max-w-lg md:max-h-[90vh] md:h-auto md:rounded-2xl md:bg-white md:shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-surface-100"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
