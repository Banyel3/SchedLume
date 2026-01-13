"use client";

import { useState, useCallback, useEffect } from "react";
import type { GeneralNote } from "@/types";
import { getToday } from "@/lib/utils/date";

interface GeneralNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    note: Omit<GeneralNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => Promise<GeneralNote>;
  onDelete?: (id: string) => Promise<void>;
  initialNote?: GeneralNote | null;
  defaultDate: string;
}

export function GeneralNoteModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialNote,
  defaultDate,
}: GeneralNoteModalProps) {
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Populate form when editing an existing note
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setNoteText(initialNote.noteText || "");
      setHasDueDate(initialNote.hasDueDate);
      setDueDate(initialNote.dueDate || "");
    } else {
      setTitle("");
      setNoteText("");
      setHasDueDate(false);
      setDueDate("");
    }
  }, [initialNote, isOpen]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: initialNote?.id,
        date: defaultDate,
        title: title.trim(),
        noteText: noteText.trim() || undefined,
        hasDueDate,
        dueDate: hasDueDate && dueDate ? dueDate : undefined,
      });
      onClose();
    } catch (error) {
      console.error("[GeneralNoteModal] Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [title, noteText, hasDueDate, dueDate, defaultDate, initialNote, onSave, onClose]);

  const handleDelete = useCallback(async () => {
    if (!initialNote?.id || !onDelete) return;

    if (!confirm("Delete this note?")) return;

    setIsDeleting(true);
    try {
      await onDelete(initialNote.id);
      onClose();
    } catch (error) {
      console.error("[GeneralNoteModal] Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [initialNote, onDelete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-t-3xl sm:rounded-2xl shadow-xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialNote ? "Edit Note" : "Add Note"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-surface-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="e.g., Quiz tomorrow, Project deadline"
              className="w-full px-4 py-3 text-base border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400"
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
          </div>

          {/* Note text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optional)
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
              placeholder="Add details..."
              className="w-full px-4 py-3 text-base border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Due date toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Set due date reminder
            </label>
            <button
              onClick={() => setHasDueDate(!hasDueDate)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                hasDueDate ? "bg-primary-400" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  hasDueDate ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Due date picker */}
          {hasDueDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={getToday()}
                className="w-full px-4 py-3 text-base border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                You&apos;ll receive reminders 3, 2, and 1 day(s) before this date.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-surface-200 pb-safe">
          {initialNote && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-3 text-red-500 font-medium rounded-xl hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-5 py-3 text-gray-600 font-medium rounded-xl hover:bg-surface-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="px-5 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
