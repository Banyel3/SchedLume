'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedDate, useSettings, useDatesWithNotes } from '@/hooks';
import { AppHeader } from '@/components/layout';
import { CalendarGrid } from '@/components/calendar';
import { Button } from '@/components/ui';
import {
  getYearMonth,
  formatDateDisplay,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getToday,
  isToday,
} from '@/lib/utils/date';
import { getDatesWithOverrides } from '@/lib/db/overrideStore';

export default function CalendarPage() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const { settings } = useSettings();

  // Calendar month/year state
  const [viewDate, setViewDate] = useState(() => {
    const { year, month } = getYearMonth(selectedDate);
    return { year, month };
  });

  // Get date range for this month view
  const monthRange = useMemo(() => {
    return {
      start: getFirstDayOfMonth(viewDate.year, viewDate.month),
      end: getLastDayOfMonth(viewDate.year, viewDate.month),
    };
  }, [viewDate.year, viewDate.month]);

  // Get dates with notes and overrides
  const { datesWithNotes } = useDatesWithNotes(monthRange.start, monthRange.end);
  const [datesWithOverrides, setDatesWithOverrides] = useState<Set<string>>(new Set());

  // Load overrides for the month
  useMemo(() => {
    getDatesWithOverrides(monthRange.start, monthRange.end).then(setDatesWithOverrides);
  }, [monthRange.start, monthRange.end]);

  const handleDateSelect = useCallback(
    (date: string) => {
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  }, []);

  const handleGoToToday = useCallback(() => {
    const today = getToday();
    const { year, month } = getYearMonth(today);
    setViewDate({ year, month });
    setSelectedDate(today);
  }, [setSelectedDate]);

  const handleViewDay = useCallback(() => {
    router.push('/today');
  }, [router]);

  return (
    <>
      <AppHeader
        title="Calendar"
        rightAction={
          !isToday(selectedDate) && (
            <Button variant="ghost" size="sm" onClick={handleGoToToday}>
              Today
            </Button>
          )
        }
      />

      <main className="max-w-lg mx-auto">
        <CalendarGrid
          year={viewDate.year}
          month={viewDate.month}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          datesWithNotes={datesWithNotes}
          datesWithOverrides={datesWithOverrides}
          weekStart={settings.weekStart}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Selected date info */}
        <div className="p-4 bg-white border-t border-surface-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{formatDateDisplay(selectedDate)}</h3>
              <div className="flex items-center gap-2 mt-1">
                {datesWithNotes.has(selectedDate) && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Has notes
                  </span>
                )}
                {datesWithOverrides.has(selectedDate) && (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Has changes
                  </span>
                )}
              </div>
            </div>
            <Button onClick={handleViewDay} size="sm">
              View Day
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Notes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Schedule changes</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
