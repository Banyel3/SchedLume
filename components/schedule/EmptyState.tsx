"use client";

import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showImportHint?: boolean;
}

export function EmptyState({
  title = "No classes",
  description = "There are no classes scheduled for this day.",
  showImportHint = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Illustration */}
      <div className="w-24 h-24 mb-6 text-surface-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 w-full">{description}</p>

      {showImportHint && (
        <Link
          href="/settings"
          className="mt-6 text-sm text-primary-400 hover:text-primary-500 font-medium"
        >
          Import a schedule from CSV →
        </Link>
      )}
    </div>
  );
}
