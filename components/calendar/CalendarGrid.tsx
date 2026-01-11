"use client";

import { useMemo } from "react";
import { WEEKDAYS_SHORT } from "@/lib/constants";
import {
  getMonthDates,
  getWeekday,
  isToday,
  formatMonthYear,
  parseDate,
} from "@/lib/utils/date";
import { NoteDot } from "@/components/ui";

interface CalendarGridProps {
  year: number;
  month: number; // 0-11
  selectedDate: string;
  onDateSelect: (date: string) => void;
  datesWithNotes?: Set<string>;
  datesWithOverrides?: Set<string>;
  weekStart?: "monday" | "sunday";
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export function CalendarGrid({
  year,
  month,
  selectedDate,
  onDateSelect,
  datesWithNotes = new Set(),
  datesWithOverrides = new Set(),
  weekStart = "monday",
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);

  const orderedDays = useMemo(() => {
    if (weekStart === "monday") {
      return [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
    }
    return [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat
  }, [weekStart]);

  // Calculate empty cells before first day
  const firstDayOfMonth = getWeekday(monthDates[0]);
  const emptyDaysBefore = useMemo(() => {
    if (weekStart === "monday") {
      return firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    }
    return firstDayOfMonth;
  }, [firstDayOfMonth, weekStart]);

  // Calculate days from previous month
  const prevMonthDates = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthAllDates = getMonthDates(prevYear, prevMonth);
    return prevMonthAllDates.slice(-emptyDaysBefore);
  }, [year, month, emptyDaysBefore]);

  // Calculate days from next month
  const totalCells = Math.ceil((emptyDaysBefore + monthDates.length) / 7) * 7;
  const emptyDaysAfter = totalCells - emptyDaysBefore - monthDates.length;

  const nextMonthDates = useMemo(() => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthAllDates = getMonthDates(nextYear, nextMonth);
    return nextMonthAllDates.slice(0, emptyDaysAfter);
  }, [year, month, emptyDaysAfter]);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={onPrevMonth}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-surface-100 transition-colors"
          aria-label="Previous month"
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
        <h2 className="text-lg font-semibold text-gray-900">
          {formatMonthYear(year, month)}
        </h2>
        <button
          onClick={onNextMonth}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-surface-100 transition-colors"
          aria-label="Next month"
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

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-surface-200 px-4">
        {orderedDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wide"
          >
            {WEEKDAYS_SHORT[day]}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 p-3 gap-1">
        {/* Previous month days (faded) */}
        {prevMonthDates.map((date) => (
          <DateCell
            key={date}
            date={date}
            isCurrentMonth={false}
            isSelected={date === selectedDate}
            isToday={isToday(date)}
            hasNote={datesWithNotes.has(date)}
            hasOverride={datesWithOverrides.has(date)}
            onClick={() => onDateSelect(date)}
          />
        ))}

        {/* Current month days */}
        {monthDates.map((date) => (
          <DateCell
            key={date}
            date={date}
            isCurrentMonth={true}
            isSelected={date === selectedDate}
            isToday={isToday(date)}
            hasNote={datesWithNotes.has(date)}
            hasOverride={datesWithOverrides.has(date)}
            onClick={() => onDateSelect(date)}
          />
        ))}

        {/* Next month days (faded) */}
        {nextMonthDates.map((date) => (
          <DateCell
            key={date}
            date={date}
            isCurrentMonth={false}
            isSelected={date === selectedDate}
            isToday={isToday(date)}
            hasNote={datesWithNotes.has(date)}
            hasOverride={datesWithOverrides.has(date)}
            onClick={() => onDateSelect(date)}
          />
        ))}
      </div>
    </div>
  );
}

interface DateCellProps {
  date: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasNote: boolean;
  hasOverride: boolean;
  onClick: () => void;
}

function DateCell({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  hasNote,
  hasOverride,
  onClick,
}: DateCellProps) {
  const dayNum = parseDate(date).getDate();

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center h-11 rounded-lg transition-all ${
        isSelected
          ? "bg-primary-400 text-white shadow-sm"
          : isToday
          ? "bg-primary-50 text-primary-600"
          : isCurrentMonth
          ? "text-gray-700 hover:bg-surface-100"
          : "text-gray-300 hover:bg-surface-50"
      }`}
    >
      <span
        className={`text-sm ${isSelected || isToday ? "font-semibold" : ""}`}
      >
        {dayNum}
      </span>

      {/* Indicators */}
      <div className="flex items-center gap-0.5 mt-0.5 h-2">
        {hasNote && (
          <NoteDot size="sm" className={isSelected ? "bg-white" : ""} />
        )}
        {hasOverride && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSelected ? "bg-white/80" : "bg-blue-400"
            }`}
          />
        )}
      </div>
    </button>
  );
}
