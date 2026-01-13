"use client";

import { useMemo } from "react";
import {
  getSurroundingDates,
  getWeekdayShort,
  isToday,
  parseDate,
} from "@/lib/utils/date";
import { NoteDot } from "@/components/ui";

interface DateStripProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  datesWithNotes?: Set<string>;
  range?: number;
}

export function DateStrip({
  selectedDate,
  onDateSelect,
  datesWithNotes = new Set(),
  range = 3,
}: DateStripProps) {
  const dates = useMemo(
    () => getSurroundingDates(selectedDate, range),
    [selectedDate, range]
  );

  const handlePrevWeek = () => {
    const newDate = new Date(parseDate(selectedDate));
    newDate.setDate(newDate.getDate() - 7);
    onDateSelect(newDate.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const newDate = new Date(parseDate(selectedDate));
    newDate.setDate(newDate.getDate() + 7);
    onDateSelect(newDate.toISOString().split("T")[0]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-surface-200/80 sticky top-[72px] sm:top-[80px] z-20 rounded-b-2xl mx-4">
      <div className="flex items-center justify-between px-6 sm:px-8 py-3 w-full">
        {/* Previous week button */}
        <button
          onClick={handlePrevWeek}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-surface-100 transition-colors"
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

        {/* Date items */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-1">
          {dates.map((date) => {
            const dateObj = parseDate(date);
            const dayNum = dateObj.getDate();
            const dayName = getWeekdayShort(date);
            const isSelected = date === selectedDate;
            const isTodayDate = isToday(date);
            const hasNote = datesWithNotes.has(date);

            return (
              <button
                key={date}
                onClick={() => onDateSelect(date)}
                className={`flex flex-col items-center justify-center w-12 h-16 rounded-xl transition-all ${
                  isSelected
                    ? "bg-primary-400 text-white shadow-md scale-105"
                    : isTodayDate
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-surface-100"
                }`}
              >
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide ${
                    isSelected ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {dayName}
                </span>
                <span className="text-lg font-semibold mt-0.5">{dayNum}</span>
                {hasNote && (
                  <NoteDot
                    size="sm"
                    className={`mt-0.5 ${isSelected ? "bg-white" : ""}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Next week button */}
        <button
          onClick={handleNextWeek}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-surface-100 transition-colors"
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
    </div>
  );
}
