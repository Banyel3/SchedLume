'use client';

import { useMemo } from 'react';
import { WEEKDAYS_SHORT } from '@/lib/constants';
import { NoteDot } from '@/components/ui';

interface WeekTabsProps {
  selectedDay: number; // 0-6
  onDaySelect: (day: number) => void;
  daysWithNotes?: Set<number>;
  weekStart?: 'monday' | 'sunday';
}

export function WeekTabs({ selectedDay, onDaySelect, daysWithNotes = new Set(), weekStart = 'monday' }: WeekTabsProps) {
  const orderedDays = useMemo(() => {
    if (weekStart === 'monday') {
      // Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6), Sun(0)
      return [1, 2, 3, 4, 5, 6, 0];
    }
    // Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
    return [0, 1, 2, 3, 4, 5, 6];
  }, [weekStart]);

  return (
    <div className="bg-white border-b border-surface-200">
      <div className="flex items-center justify-between px-2 max-w-lg mx-auto">
        {orderedDays.map((day) => {
          const isSelected = day === selectedDay;
          const hasNote = daysWithNotes.has(day);

          return (
            <button
              key={day}
              onClick={() => onDaySelect(day)}
              className={`flex flex-col items-center justify-center py-3 px-2 min-w-[44px] transition-colors ${
                isSelected
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={`text-sm font-medium ${isSelected ? 'font-semibold' : ''}`}>
                {WEEKDAYS_SHORT[day]}
              </span>
              {hasNote && <NoteDot size="sm" className="mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
