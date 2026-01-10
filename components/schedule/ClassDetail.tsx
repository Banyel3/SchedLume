'use client';

import { ResolvedClass } from '@/types';
import { formatTime, formatTimeRange, getDurationMinutes, formatDuration } from '@/lib/utils/time';
import { formatDateDisplay } from '@/lib/utils/date';
import { Badge } from '@/components/ui';
import { NoteEditor } from '@/components/forms';

interface ClassDetailProps {
  classData: ResolvedClass;
  timeFormat?: '12h' | '24h';
}

export function ClassDetail({ classData, timeFormat = '12h' }: ClassDetailProps) {
  const {
    instanceKey,
    subjectName,
    date,
    startTime,
    endTime,
    location,
    professor,
    color,
    isCanceled,
    isOverridden,
    isAdded,
  } = classData;

  const duration = getDurationMinutes(startTime, endTime);
  const borderColor = color || '#F97B5C';

  return (
    <div className="flex flex-col h-full">
      {/* Class info section */}
      <div className="px-4 py-6 border-b border-surface-200">
        {/* Subject header with color accent */}
        <div
          className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
          style={{ backgroundColor: `${borderColor}15` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: borderColor }} />
          <h2 className={`text-xl font-bold text-gray-900 ${isCanceled ? 'line-through' : ''}`}>
            {subjectName}
          </h2>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 mb-4">
          {isCanceled && <Badge variant="canceled">Canceled for this day</Badge>}
          {isOverridden && !isCanceled && <Badge variant="override">Modified for this day</Badge>}
          {isAdded && <Badge variant="added">One-time class</Badge>}
        </div>

        {/* Date and time */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDateDisplay(date)}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {formatTimeRange(startTime, endTime, timeFormat)}
              <span className="text-gray-400 ml-2">({formatDuration(duration)})</span>
            </span>
          </div>

          {location && (
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <span>{location}</span>
            </div>
          )}

          {professor && (
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{professor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes section */}
      <div className="flex-1 p-4">
        <NoteEditor
          date={date}
          classInstanceKey={instanceKey}
          subjectName={subjectName}
          startTime={startTime}
        />
      </div>
    </div>
  );
}
