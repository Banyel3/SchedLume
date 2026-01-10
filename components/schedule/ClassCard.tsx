'use client';

import { ResolvedClass } from '@/types';
import { formatTime } from '@/lib/utils/time';
import { Badge, NoteDot } from '@/components/ui';

interface ClassCardProps {
  classData: ResolvedClass;
  timeFormat?: '12h' | '24h';
  onClick?: () => void;
}

export function ClassCard({ classData, timeFormat = '12h', onClick }: ClassCardProps) {
  const {
    subjectName,
    startTime,
    endTime,
    location,
    professor,
    color,
    isCanceled,
    isOverridden,
    isAdded,
    hasNote,
  } = classData;

  const borderColor = color || '#F97B5C';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all border-l-4 ${
        isCanceled ? 'opacity-60' : ''
      }`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold text-gray-900 truncate ${isCanceled ? 'line-through' : ''}`}
            >
              {subjectName}
            </h3>
            {hasNote && <NoteDot size="md" />}
          </div>
          <p className={`text-sm text-gray-500 mt-0.5 ${isCanceled ? 'line-through' : ''}`}>
            {formatTime(startTime, timeFormat)} - {formatTime(endTime, timeFormat)}
          </p>
          {(location || professor) && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              {location && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {location}
                </span>
              )}
              {professor && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {professor}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status badges */}
        <div className="flex flex-col items-end gap-1">
          {isCanceled && <Badge variant="canceled">Canceled</Badge>}
          {isOverridden && !isCanceled && <Badge variant="override">Modified</Badge>}
          {isAdded && <Badge variant="added">Added</Badge>}
        </div>
      </div>
    </button>
  );
}
