"use client";

import type { GeneralNote } from "@/types";
import { formatDateDisplay } from "@/lib/utils/date";

interface GeneralNoteCardProps {
  note: GeneralNote;
  onClick: () => void;
}

export function GeneralNoteCard({ note, onClick }: GeneralNoteCardProps) {
  const daysUntilDue = note.dueDate
    ? Math.ceil(
        (new Date(note.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const getDueBadgeColor = () => {
    if (daysUntilDue === null) return "";
    if (daysUntilDue < 0) return "bg-red-100 text-red-700";
    if (daysUntilDue === 0) return "bg-orange-100 text-orange-700";
    if (daysUntilDue <= 3) return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const getDueBadgeText = () => {
    if (daysUntilDue === null) return "";
    if (daysUntilDue < 0) return "Overdue";
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-2xl shadow-card hover:shadow-md transition-shadow border border-surface-200/50"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>

          {note.noteText && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {note.noteText}
            </p>
          )}

          {/* Due date badge */}
          {note.hasDueDate && note.dueDate && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${getDueBadgeColor()}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {getDueBadgeText()}
              </span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
