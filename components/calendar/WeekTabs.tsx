"use client";

import { useMemo } from "react";
import { WEEKDAYS_SHORT } from "@/lib/constants";
import { NoteDot } from "@/components/ui";

interface WeekTabsProps {
  selectedDay: number; // 0-6
  onDaySelect: (day: number) => void;
  daysWithNotes?: Set<number>;
  weekStart?: "monday" | "sunday";
}

export function WeekTabs({
  selectedDay,
  onDaySelect,
  daysWithNotes = new Set(),
  weekStart = "monday",
}: WeekTabsProps) {
  const orderedDays = useMemo(() => {
    if (weekStart === "monday") {
      // Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6), Sun(0)
      return [1, 2, 3, 4, 5, 6, 0];
    }
    // Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
    return [0, 1, 2, 3, 4, 5, 6];
  }, [weekStart]);

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-surface-200/80 sticky top-14 z-20">
      <div className="flex items-center justify-around w-full px-6 sm:px-8">
        {orderedDays.map((day) => {
          const isSelected = day === selectedDay;
          const hasNote = daysWithNotes.has(day);

          return (
            <button
              key={day}
              onClick={() => onDaySelect(day)}
              className={`flex flex-col items-center justify-center py-3 min-w-12 transition-all ${
                isSelected
                  ? "text-primary-400 border-b-2 border-primary-400 -mb-px"
                  : "text-gray-500 hover:text-gray-700 hover:bg-surface-50"
              }`}
            >
              <span
                className={`text-sm ${
                  isSelected ? "font-semibold" : "font-medium"
                }`}
              >
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
