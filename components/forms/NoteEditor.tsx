'use client';

import { useNote } from '@/hooks';
import { formatDateShort } from '@/lib/utils/date';
import { formatTime } from '@/lib/utils/time';
import { NOTE_MAX_LENGTH } from '@/lib/constants';

interface NoteEditorProps {
  date: string;
  classInstanceKey: string;
  subjectName: string;
  startTime: string;
}

export function NoteEditor({ date, classInstanceKey, subjectName, startTime }: NoteEditorProps) {
  const { noteText, setNoteText, lastSaved, saving } = useNote(date, classInstanceKey, subjectName, startTime);

  const characterCount = noteText.length;
  const isNearLimit = characterCount > NOTE_MAX_LENGTH * 0.8;
  const isOverLimit = characterCount > NOTE_MAX_LENGTH;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Notes for {formatDateShort(date)}
        </h3>
        {saving && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add notes about what happened in this class..."
          className={`w-full h-40 p-4 text-sm text-gray-700 bg-surface-100 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all ${
            isOverLimit ? 'border-red-400 focus:ring-red-400' : 'border-transparent'
          }`}
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={`text-xs ${
              isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-400'
            }`}
          >
            {characterCount}/{NOTE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Last saved timestamp */}
      {lastSaved && !saving && (
        <p className="text-xs text-gray-400">
          Last saved: {formatTime(new Date(lastSaved).toTimeString().slice(0, 5))}
        </p>
      )}
    </div>
  );
}
