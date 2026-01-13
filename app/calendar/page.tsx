"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useSelectedDate,
  useSettings,
  useDatesWithNotes,
  useGeneralNotes,
  useDatesWithGeneralNotes,
} from "@/hooks";
import { AppHeader } from "@/components/layout";
import { CalendarGrid } from "@/components/calendar";
import { GeneralNoteModal, GeneralNoteCard } from "@/components/notes";
import { Button } from "@/components/ui";
import {
  getYearMonth,
  formatDateDisplay,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getToday,
  isToday,
} from "@/lib/utils/date";
import { getDatesWithOverrides } from "@/lib/db/overrideStore";
import type { GeneralNote } from "@/types";

export default function CalendarPage() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const { settings } = useSettings();

  // Calendar month/year state
  const [viewDate, setViewDate] = useState(() => {
    const { year, month } = getYearMonth(selectedDate);
    return { year, month };
  });

  // Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GeneralNote | null>(null);

  // Get date range for this month view
  const monthRange = useMemo(() => {
    return {
      start: getFirstDayOfMonth(viewDate.year, viewDate.month),
      end: getLastDayOfMonth(viewDate.year, viewDate.month),
    };
  }, [viewDate.year, viewDate.month]);

  // Get dates with notes and overrides
  const { datesWithNotes } = useDatesWithNotes(
    monthRange.start,
    monthRange.end
  );
  const datesWithGeneralNotes = useDatesWithGeneralNotes(
    monthRange.start,
    monthRange.end
  );
  const [datesWithOverrides, setDatesWithOverrides] = useState<Set<string>>(
    new Set()
  );

  // General notes for selected date
  const {
    notes: generalNotes,
    loading: notesLoading,
    saveNote,
    removeNote,
    refresh: refreshNotes,
  } = useGeneralNotes(selectedDate);

  // Load overrides for the month
  useEffect(() => {
    getDatesWithOverrides(monthRange.start, monthRange.end).then(
      setDatesWithOverrides
    );
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
    router.push("/today");
  }, [router]);

  const handleAddNote = useCallback(() => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  }, []);

  const handleEditNote = useCallback((note: GeneralNote) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
  }, []);

  const handleSaveNote = useCallback(
    async (
      note: Omit<GeneralNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
    ) => {
      const savedNote = await saveNote(note);
      await refreshNotes();
      return savedNote;
    },
    [saveNote, refreshNotes]
  );

  const handleDeleteNote = useCallback(
    async (id: string) => {
      await removeNote(id);
    },
    [removeNote]
  );

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

      <main className="w-full px-4 sm:px-6 py-5">
        <CalendarGrid
          year={viewDate.year}
          month={viewDate.month}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          datesWithNotes={datesWithNotes}
          datesWithOverrides={datesWithOverrides}
          datesWithGeneralNotes={datesWithGeneralNotes}
          weekStart={settings.weekStart}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Selected date info */}
        <div className="mt-4 p-5 bg-white rounded-2xl shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {formatDateDisplay(selectedDate)}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                {datesWithNotes.has(selectedDate) && (
                  <span className="text-xs text-amber-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Has class notes
                  </span>
                )}
                {datesWithGeneralNotes.has(selectedDate) && (
                  <span className="text-xs text-green-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    Has notes
                  </span>
                )}
                {datesWithOverrides.has(selectedDate) && (
                  <span className="text-xs text-blue-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
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

        {/* General notes section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Notes</h4>
            <Button variant="ghost" size="sm" onClick={handleAddNote}>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Note
            </Button>
          </div>

          {notesLoading ? (
            <div className="py-8 text-center text-gray-400">Loading...</div>
          ) : generalNotes.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p>No notes for this date</p>
              <button
                onClick={handleAddNote}
                className="mt-2 text-primary-500 font-medium hover:underline"
              >
                Add your first note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {generalNotes.map((note) => (
                <GeneralNoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleEditNote(note)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-1 py-5 text-sm text-gray-500">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Class notes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span>Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Schedule changes</span>
            </div>
          </div>
        </div>
      </main>

      {/* Note Modal */}
      <GeneralNoteModal
        isOpen={isNoteModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        initialNote={editingNote}
        defaultDate={selectedDate}
      />
    </>
  );
}
