"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useSelectedDate,
  useSchedule,
  useSettings,
  useSwipeNavigation,
  useDatesWithNotes,
} from "@/hooks";
import { AppHeader, DateStrip } from "@/components/layout";
import { ClassList, ClassDetail } from "@/components/schedule";
import { DayOverrideForm } from "@/components/forms";
import { Modal, Button } from "@/components/ui";
import { ResolvedClass } from "@/types";
import { formatDateDisplay, isToday, addDays } from "@/lib/utils/date";

export default function TodayPage() {
  const { selectedDate, setSelectedDate, goToPrevDay, goToNextDay } =
    useSelectedDate();
  const { schedule, loading, refresh } = useSchedule(selectedDate);
  const { settings } = useSettings();

  // Get dates with notes for the date strip
  const dateRange = useMemo(() => {
    const start = addDays(selectedDate, -7);
    const end = addDays(selectedDate, 7);
    return { start, end };
  }, [selectedDate]);

  const { datesWithNotes } = useDatesWithNotes(dateRange.start, dateRange.end);

  // Modal states
  const [selectedClass, setSelectedClass] = useState<ResolvedClass | null>(
    null
  );
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ResolvedClass | null>(null);

  // Swipe navigation
  useSwipeNavigation({
    onSwipeLeft: goToNextDay,
    onSwipeRight: goToPrevDay,
  });

  const handleClassClick = useCallback((classData: ResolvedClass) => {
    setSelectedClass(classData);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedClass(null);
    refresh(); // Refresh to update note indicators
  }, [refresh]);

  const handleOpenOverrideForm = useCallback((classData?: ResolvedClass) => {
    setEditingClass(classData || null);
    setShowOverrideForm(true);
  }, []);

  const handleCloseOverrideForm = useCallback(() => {
    setShowOverrideForm(false);
    setEditingClass(null);
  }, []);

  const handleOverrideSave = useCallback(() => {
    handleCloseOverrideForm();
    refresh();
  }, [handleCloseOverrideForm, refresh]);

  const title = isToday(selectedDate)
    ? "Today's Classes"
    : formatDateDisplay(selectedDate);

  return (
    <>
      <AppHeader
        title={title}
        subtitle={
          isToday(selectedDate) ? formatDateDisplay(selectedDate) : undefined
        }
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenOverrideForm()}
            aria-label="Add class"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
        }
      />

      <DateStrip
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        datesWithNotes={datesWithNotes}
      />

      <main className="w-full px-4 sm:px-6 py-5">
        <ClassList
          classes={schedule}
          loading={loading}
          timeFormat={settings.timeFormat}
          onClassClick={handleClassClick}
        />
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

      {/* Override Form Modal */}
      <Modal
        isOpen={showOverrideForm}
        onClose={handleCloseOverrideForm}
        title={editingClass ? "Edit Class" : "Add Class"}
      >
        <DayOverrideForm
          date={selectedDate}
          existingClass={editingClass || undefined}
          onSave={handleOverrideSave}
          onCancel={handleCloseOverrideForm}
          onDelete={handleOverrideSave}
        />
      </Modal>
    </>
  );
}
