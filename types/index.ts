// Base weekly schedule entry (from CSV import)
export interface SubjectSchedule {
  id: string; // UUID
  subjectName: string;
  weekday: number; // 0 (Sunday) - 6 (Saturday)
  startTime: string; // "HH:mm" 24-hour format
  endTime: string; // "HH:mm"
  location?: string;
  professor?: string;
  color?: string; // Hex color or preset name
}

// Per-day schedule modification
export interface DayOverride {
  id: string; // UUID
  date: string; // "YYYY-MM-DD"
  baseScheduleId: string | null; // null for "add" type
  overrideType: "edit" | "cancel" | "add";
  subjectName: string;
  startTime: string;
  endTime: string;
  location?: string;
  professor?: string;
  color?: string;
}

// Note for a specific class on a specific date
export interface ClassNote {
  id: string; // UUID
  date: string; // "YYYY-MM-DD"
  classInstanceKey: string; // "${date}:${baseScheduleId}" or "${date}:override:${overrideId}"
  subjectName: string; // For display without lookup
  startTime: string; // For display
  noteText: string;
  updatedAt: string; // ISO timestamp
}

// User preferences
export interface AppSettings {
  id: "app-settings"; // Singleton key
  weekStart: "monday" | "sunday";
  timeFormat: "12h" | "24h";
  lastImportedFileName?: string;
  lastImportedAt?: string; // ISO timestamp
  schemaVersion: number;
}

// Resolved class for display (base + override applied)
export interface ResolvedClass {
  instanceKey: string; // ClassInstanceKey
  baseScheduleId: string | null;
  overrideId: string | null;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  professor?: string;
  color?: string;
  isCanceled: boolean;
  isOverridden: boolean;
  isAdded: boolean; // True if from "add" override
  hasNote: boolean;
}

// CSV row before validation
export interface CSVRawRow {
  subject_name?: string;
  subject?: string;
  day_of_week?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  professor?: string;
  color?: string;
  [key: string]: string | undefined;
}

// Validation error
export interface CSVValidationError {
  row: number;
  column: string;
  message: string;
}

// Default subject colors
export const SUBJECT_COLORS = {
  coral: "#F97B5C",
  sky: "#5CA3F9",
  mint: "#5CF9A3",
  lavender: "#A35CF9",
  gold: "#F9C75C",
  rose: "#F95CA3",
  teal: "#5CF9E8",
  orange: "#F9A35C",
} as const;

export type SubjectColorName = keyof typeof SUBJECT_COLORS;

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  id: "app-settings",
  weekStart: "monday",
  timeFormat: "12h",
  schemaVersion: 1,
};
