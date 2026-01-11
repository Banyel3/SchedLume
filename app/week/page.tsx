"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useSelectedDate,
  useSchedule,
  useSettings,
  useDatesWithNotes,
} from "@/hooks";
import { AppHeader } from "@/components/layout";
import { WeekTabs } from "@/components/calendar";
import { ClassList, ClassDetail } from "@/components/schedule";
import { Modal } from "@/components/ui";
import { ResolvedClass } from "@/types";
import {
  getWeekDates,
  getWeekday,
  formatDateDisplay,
  addDays,
} from "@/lib/utils/date";

export default function WeekPage() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const { settings } = useSettings();

  // Get the current week dates
  const weekDates = useMemo(
    () => getWeekDates(selectedDate, settings.weekStart),
    [selectedDate, settings.weekStart]
  );

  // Get dates with notes
  const { datesWithNotes } = useDatesWithNotes(weekDates[0], weekDates[6]);

  // Calculate which days have notes (as day numbers 0-6)
  const daysWithNotes = useMemo(() => {
    const days = new Set<number>();
    weekDates.forEach((date) => {
      if (datesWithNotes.has(date)) {
        days.add(getWeekday(date));
      }
    });
    return days;
  }, [weekDates, datesWithNotes]);

  // Get the selected weekday (0-6)
  const selectedWeekday = getWeekday(selectedDate);

  // Load schedule for the selected date
  const { schedule, loading, refresh } = useSchedule(selectedDate);

  // Modal state
  const [selectedClass, setSelectedClass] = useState<ResolvedClass | null>(
    null
  );

  const handleDaySelect = useCallback(
    (day: number) => {
      // Find the date in the current week that matches this weekday
      const targetDate = weekDates.find((d) => getWeekday(d) === day);
      if (targetDate) {
        setSelectedDate(targetDate);
      }
    },
    [weekDates, setSelectedDate]
  );

  const handlePrevWeek = useCallback(() => {
    setSelectedDate(addDays(selectedDate, -7));
  }, [selectedDate, setSelectedDate]);

  const handleNextWeek = useCallback(() => {
    setSelectedDate(addDays(selectedDate, 7));
  }, [selectedDate, setSelectedDate]);

  const handleClassClick = useCallback((classData: ResolvedClass) => {
    setSelectedClass(classData);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedClass(null);
    refresh();
  }, [refresh]);

  // Format week range for subtitle
  const weekRange = `${
    formatDateDisplay(weekDates[0]).split(",")[1]?.trim() || ""
  } - ${formatDateDisplay(weekDates[6]).split(",")[1]?.trim() || ""}`;

  return (
    <>
      <AppHeader
        title="Weekly Schedule"
        subtitle={weekRange}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevWeek}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-surface-100"
              aria-label="Previous week"
            >
              <svg
                className="w-5 h-5"
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
            <button
              onClick={handleNextWeek}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-surface-100"
              aria-label="Next week"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </div>
        }
      />

      <WeekTabs
        selectedDay={selectedWeekday}
        onDaySelect={handleDaySelect}
        daysWithNotes={daysWithNotes}
        weekStart={settings.weekStart}
      />

      <main className="w-full">
        <div className="py-4 px-6 sm:px-8 border-b border-surface-200/80 bg-white/95 backdrop-blur-sm">
          <h2 className="font-medium text-gray-900">
            {formatDateDisplay(selectedDate)}
          </h2>
        </div>

        <div className="py-5 px-6 sm:px-8">
          <ClassList
            classes={schedule}
            loading={loading}
            timeFormat={settings.timeFormat}
            onClassClick={handleClassClick}
          />
        </div>
      </main>

      {/* Class Detail Modal */}
      <Modal isOpen={!!selectedClass} onClose={handleCloseDetail} title="Class">
        {selectedClass && (
          <ClassDetail
            classData={selectedClass}
            timeFormat={settings.timeFormat}
          />
        )}
      </Modal>
    </>
  );
}
