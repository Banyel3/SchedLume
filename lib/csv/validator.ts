import { v4 as uuidv4 } from "uuid";
import {
  SubjectSchedule,
  CSVRawRow,
  CSVValidationError,
  SUBJECT_COLORS,
} from "@/types";
import { DAY_MAP } from "../constants";
import { mapHeaders, getMappedValue } from "./headerMapper";

export interface ValidationResult {
  isValid: boolean;
  schedules: SubjectSchedule[];
  errors: CSVValidationError[];
}

/**
 * Parse a day of week value to a number (0-6)
 */
export function parseDay(value: string): number | null {
  const normalized = value.toLowerCase().trim();
  const result = DAY_MAP[normalized];
  return result !== undefined ? result : null;
}

/**
 * Parse a time string to HH:mm format
 * Accepts: HH:mm, H:mm, HH:mm AM/PM, H:mm AM/PM
 */
export function parseTime(value: string): string | null {
  const trimmed = value.trim();

  // Try 24-hour format: HH:mm or H:mm
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1]);
    const m = parseInt(match24[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }
  }

  // Try 12-hour format: H:mm AM/PM or HH:mm AM/PM
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = parseInt(match12[2]);
    const period = match12[3].toLowerCase();

    if (period === "pm" && h < 12) h += 12;
    if (period === "am" && h === 12) h = 0;

    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }
  }

  return null;
}

/**
 * Validate a color value
 * Returns undefined if color is empty, invalid, or not provided
 * This allows assignColors() to auto-assign colors later
 */
function validateColor(color: string | undefined): string | undefined {
  if (!color || color.trim() === "") return undefined;

  const trimmed = color.trim().toLowerCase();

  // Check if it's a preset color name
  if (trimmed in SUBJECT_COLORS) {
    return SUBJECT_COLORS[trimmed as keyof typeof SUBJECT_COLORS];
  }

  // Check if it's a valid hex color
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed;
  }

  // Check if it's a short hex color and expand it
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const expanded = trimmed
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded}`;
  }

  return undefined;
}

/**
 * Assign colors to subjects that don't have one
 */
function assignColors(schedules: SubjectSchedule[]): SubjectSchedule[] {
  const colorKeys = Object.keys(
    SUBJECT_COLORS
  ) as (keyof typeof SUBJECT_COLORS)[];
  const subjectColors = new Map<string, string>();
  let colorIndex = 0;

  return schedules.map((schedule) => {
    if (schedule.color) {
      return schedule;
    }

    // Check if we already assigned a color to this subject
    let color = subjectColors.get(schedule.subjectName);

    if (!color) {
      // Assign a new color
      color = SUBJECT_COLORS[colorKeys[colorIndex % colorKeys.length]];
      subjectColors.set(schedule.subjectName, color);
      colorIndex++;
    }

    return { ...schedule, color };
  });
}

/**
 * Validate CSV rows and convert to SubjectSchedule objects
 */
export function validateCSV(
  rows: CSVRawRow[],
  rawHeaders: string[]
): ValidationResult {
  const errors: CSVValidationError[] = [];
  const schedules: SubjectSchedule[] = [];
  const headerMap = mapHeaders(rawHeaders);

  // Check required columns exist
  const required = ["subject_name", "day_of_week", "start_time", "end_time"];
  for (const col of required) {
    if (!headerMap.has(col)) {
      errors.push({
        row: 0,
        column: col,
        message: `Missing required column: ${col}. Check that your CSV has headers like "subject", "day", "start_time", "end_time".`,
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, schedules: [], errors };
  }

  // Validate each row
  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 for header and 1-indexing

    const subjectName = getMappedValue(row, headerMap, "subject_name");
    const dayRaw = getMappedValue(row, headerMap, "day_of_week");
    const startRaw = getMappedValue(row, headerMap, "start_time");
    const endRaw = getMappedValue(row, headerMap, "end_time");
    const location = getMappedValue(row, headerMap, "location");
    const professor = getMappedValue(row, headerMap, "professor");
    const colorRaw = getMappedValue(row, headerMap, "color");

    // Validate subject name
    if (!subjectName) {
      errors.push({
        row: rowNum,
        column: "subject_name",
        message: "Subject name is required",
      });
      return;
    }

    // Validate day of week
    if (!dayRaw) {
      errors.push({
        row: rowNum,
        column: "day_of_week",
        message: "Day of week is required",
      });
      return;
    }

    const weekday = parseDay(dayRaw);
    if (weekday === null) {
      errors.push({
        row: rowNum,
        column: "day_of_week",
        message: `Invalid day: "${dayRaw}". Use Monday-Sunday, Mon-Sun, or 0-6.`,
      });
      return;
    }

    // Validate start time
    if (!startRaw) {
      errors.push({
        row: rowNum,
        column: "start_time",
        message: "Start time is required",
      });
      return;
    }

    const startTime = parseTime(startRaw);
    if (!startTime) {
      errors.push({
        row: rowNum,
        column: "start_time",
        message: `Invalid time: "${startRaw}". Use HH:mm or H:mm AM/PM format.`,
      });
      return;
    }

    // Validate end time
    if (!endRaw) {
      errors.push({
        row: rowNum,
        column: "end_time",
        message: "End time is required",
      });
      return;
    }

    const endTime = parseTime(endRaw);
    if (!endTime) {
      errors.push({
        row: rowNum,
        column: "end_time",
        message: `Invalid time: "${endRaw}". Use HH:mm or H:mm AM/PM format.`,
      });
      return;
    }

    // Validate time order
    if (endTime <= startTime) {
      errors.push({
        row: rowNum,
        column: "end_time",
        message: `End time (${endTime}) must be after start time (${startTime})`,
      });
      return;
    }

    // Create schedule entry
    // Note: professor and color are optional - if not provided, they default gracefully:
    // - professor: undefined (won't show in UI)
    // - color: undefined here, but assignColors() will auto-assign from preset palette
    const professorValue = professor?.trim() || undefined;
    const colorValue = validateColor(colorRaw);

    schedules.push({
      id: uuidv4(),
      subjectName,
      weekday,
      startTime,
      endTime,
      location: location?.trim() || undefined,
      professor: professorValue,
      color: colorValue,
    });
  });

  // If there are errors, don't return any schedules (all-or-nothing)
  if (errors.length > 0) {
    return { isValid: false, schedules: [], errors };
  }

  // Assign colors to subjects without one
  const coloredSchedules = assignColors(schedules);

  return {
    isValid: true,
    schedules: coloredSchedules,
    errors: [],
  };
}
