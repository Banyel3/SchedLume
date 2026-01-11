import { ResolvedClass } from "@/types";
import { getBaseSchedulesByWeekday } from "../db/scheduleStore";
import { getOverridesByDate } from "../db/overrideStore";
import { getNotesForDate } from "../db/noteStore";

/**
 * Generate a unique key for a class instance on a specific date
 */
export function generateClassInstanceKey(
  date: string,
  baseScheduleId: string | null,
  overrideId: string | null,
  isAdded: boolean
): string {
  if (isAdded && overrideId) {
    return `${date}:override:${overrideId}`;
  }
  if (baseScheduleId) {
    return `${date}:${baseScheduleId}`;
  }
  // Fallback for edge cases
  return `${date}:unknown:${overrideId || "none"}`;
}

/**
 * Get the fully resolved schedule for a specific date
 * Combines base weekly schedule with any date-specific overrides
 */
export async function getScheduleForDate(
  date: string
): Promise<ResolvedClass[]> {
  const dateObj = new Date(date);
  const weekday = dateObj.getDay();

  // 1. Get base schedule for this weekday
  const baseSchedules = await getBaseSchedulesByWeekday(weekday);

  // 2. Get overrides for this specific date
  const overrides = await getOverridesByDate(date);

  // 3. Get notes for this date (for hasNote flag)
  const notes = await getNotesForDate(date);
  const noteKeys = new Set(notes.map((n) => n.classInstanceKey));

  // 4. Build resolved class list
  const resolved: ResolvedClass[] = [];

  // Process base schedules
  for (const base of baseSchedules) {
    const override = overrides.find((o) => o.baseScheduleId === base.id);
    const instanceKey = generateClassInstanceKey(
      date,
      base.id,
      override?.id ?? null,
      false
    );

    if (override?.overrideType === "cancel") {
      // Canceled class - still show but marked as canceled
      resolved.push({
        instanceKey,
        baseScheduleId: base.id,
        overrideId: override.id,
        subjectName: base.subjectName,
        date,
        startTime: base.startTime,
        endTime: base.endTime,
        location: base.location,
        professor: base.professor,
        color: base.color,
        isCanceled: true,
        isOverridden: false,
        isAdded: false,
        hasNote: noteKeys.has(instanceKey),
      });
    } else if (override?.overrideType === "edit") {
      // Edited class - use override values
      resolved.push({
        instanceKey,
        baseScheduleId: base.id,
        overrideId: override.id,
        subjectName: override.subjectName,
        date,
        startTime: override.startTime,
        endTime: override.endTime,
        location: override.location,
        professor: override.professor,
        color: override.color ?? base.color,
        isCanceled: false,
        isOverridden: true,
        isAdded: false,
        hasNote: noteKeys.has(instanceKey),
      });
    } else {
      // Regular class - use base values
      resolved.push({
        instanceKey,
        baseScheduleId: base.id,
        overrideId: null,
        subjectName: base.subjectName,
        date,
        startTime: base.startTime,
        endTime: base.endTime,
        location: base.location,
        professor: base.professor,
        color: base.color,
        isCanceled: false,
        isOverridden: false,
        isAdded: false,
        hasNote: noteKeys.has(instanceKey),
      });
    }
  }

  // Add "add" type overrides (one-off classes)
  const addOverrides = overrides.filter((o) => o.overrideType === "add");
  for (const add of addOverrides) {
    const instanceKey = generateClassInstanceKey(date, null, add.id, true);
    resolved.push({
      instanceKey,
      baseScheduleId: null,
      overrideId: add.id,
      subjectName: add.subjectName,
      date,
      startTime: add.startTime,
      endTime: add.endTime,
      location: add.location,
      professor: add.professor,
      color: add.color,
      isCanceled: false,
      isOverridden: false,
      isAdded: true,
      hasNote: noteKeys.has(instanceKey),
    });
  }

  // Sort by start time
  return resolved.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
