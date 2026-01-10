'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui';
import { DayOverride, ResolvedClass } from '@/types';
import { upsertOverride, deleteOverride } from '@/lib/db/overrideStore';
import { parseTime } from '@/lib/csv/validator';
import { WEEKDAYS } from '@/lib/constants';
import { getWeekday } from '@/lib/utils/date';

interface DayOverrideFormProps {
  date: string;
  existingClass?: ResolvedClass;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

type OverrideAction = 'edit' | 'cancel' | 'add';

export function DayOverrideForm({ date, existingClass, onSave, onCancel, onDelete }: DayOverrideFormProps) {
  const isEditing = !!existingClass;
  const weekdayName = WEEKDAYS[getWeekday(date)];

  const [action, setAction] = useState<OverrideAction>(
    existingClass?.isCanceled ? 'cancel' : isEditing ? 'edit' : 'add'
  );
  const [subjectName, setSubjectName] = useState(existingClass?.subjectName || '');
  const [startTime, setStartTime] = useState(existingClass?.startTime || '09:00');
  const [endTime, setEndTime] = useState(existingClass?.endTime || '10:00');
  const [location, setLocation] = useState(existingClass?.location || '');
  const [professor, setProfessor] = useState(existingClass?.professor || '');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError('');

    // Validate
    if (action !== 'cancel') {
      if (!subjectName.trim()) {
        setError('Subject name is required');
        return;
      }

      const parsedStart = parseTime(startTime);
      const parsedEnd = parseTime(endTime);

      if (!parsedStart || !parsedEnd) {
        setError('Invalid time format');
        return;
      }

      if (parsedEnd <= parsedStart) {
        setError('End time must be after start time');
        return;
      }
    }

    try {
      setSaving(true);

      const override: DayOverride = {
        id: existingClass?.overrideId || uuidv4(),
        date,
        baseScheduleId: existingClass?.baseScheduleId || null,
        overrideType: action,
        subjectName: subjectName.trim(),
        startTime,
        endTime,
        location: location.trim() || undefined,
        professor: professor.trim() || undefined,
      };

      await upsertOverride(override);
      onSave?.();
    } catch (err) {
      setError('Failed to save override');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingClass?.overrideId) return;

    try {
      setSaving(true);
      await deleteOverride(existingClass.overrideId);
      onDelete?.();
    } catch (err) {
      setError('Failed to delete override');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Class' : 'Add Class'}
        </h3>
        <p className="text-sm text-gray-500">{weekdayName}, {date}</p>
      </div>

      {/* Action selector (only for existing classes) */}
      {isEditing && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Action</label>
          <div className="flex gap-2">
            <button
              onClick={() => setAction('edit')}
              className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                action === 'edit'
                  ? 'bg-primary-50 border-primary-400 text-primary-700'
                  : 'border-surface-300 text-gray-600 hover:bg-surface-100'
              }`}
            >
              Modify
            </button>
            <button
              onClick={() => setAction('cancel')}
              className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                action === 'cancel'
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'border-surface-300 text-gray-600 hover:bg-surface-100'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Form fields (hidden if canceling) */}
      {action !== 'cancel' && (
        <>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject Name *
            </label>
            <input
              id="subject"
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Physics"
              className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                End Time *
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Room 101"
              className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="professor" className="text-sm font-medium text-gray-700">
              Professor
            </label>
            <input
              id="professor"
              type="text"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="e.g., Dr. Smith"
              className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>
        </>
      )}

      {/* Cancel message */}
      {action === 'cancel' && (
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700">
            This will mark <strong>{subjectName}</strong> as canceled for this day only.
            The class will still appear in your schedule but marked as canceled.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1" disabled={saving}>
          {saving ? 'Saving...' : action === 'cancel' ? 'Mark as Canceled' : 'Save'}
        </Button>
      </div>

      {/* Delete button for overrides */}
      {existingClass?.overrideId && !existingClass.isAdded && (
        <button
          onClick={handleDelete}
          disabled={saving}
          className="w-full text-center text-sm text-red-500 hover:text-red-700 py-2"
        >
          Remove override (restore to base schedule)
        </button>
      )}

      {/* Delete button for added classes */}
      {existingClass?.isAdded && (
        <button
          onClick={handleDelete}
          disabled={saving}
          className="w-full text-center text-sm text-red-500 hover:text-red-700 py-2"
        >
          Delete this class
        </button>
      )}
    </div>
  );
}
