"use client";

import { useEffect, useCallback, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:bg-black/40 md:backdrop-blur-sm md:items-center md:justify-center md:p-6">
      {/* Mobile: Full screen, Desktop: Centered modal */}
      <div className="flex flex-col h-full w-full md:max-w-lg md:max-h-[85vh] md:h-auto md:rounded-2xl md:bg-white md:shadow-xl md:animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between min-h-15 px-5 sm:px-6 border-b border-surface-200/80">
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center -ml-1.5 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-surface-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
