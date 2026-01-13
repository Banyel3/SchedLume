// App-wide constants

export const DB_NAME = "schedlume-db";
export const DB_VERSION = 2;

export const STORE_NAMES = {
  BASE_SCHEDULES: "baseSchedules",
  OVERRIDES: "overrides",
  NOTES: "notes",
  SETTINGS: "settings",
  GENERAL_NOTES: "generalNotes",
  NOTIFICATION_RECORDS: "notificationRecords",
} as const;

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAYS_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const DAY_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  "0": 0,
  monday: 1,
  mon: 1,
  "1": 1,
  tuesday: 2,
  tue: 2,
  "2": 2,
  wednesday: 3,
  wed: 3,
  "3": 3,
  thursday: 4,
  thu: 4,
  "4": 4,
  friday: 5,
  fri: 5,
  "5": 5,
  saturday: 6,
  sat: 6,
  "6": 6,
};

export const HEADER_ALIASES: Record<string, string[]> = {
  subject_name: [
    "subject_name",
    "subject",
    "class",
    "course",
    "class_name",
    "course_name",
    "name",
  ],
  day_of_week: ["day_of_week", "day", "weekday"],
  start_time: ["start_time", "start", "from", "begin", "starts"],
  end_time: ["end_time", "end", "to", "finish", "ends"],
  location: ["location", "room", "place", "venue", "classroom"],
  professor: ["professor", "teacher", "instructor", "lecturer", "prof"],
  color: ["color", "colour"],
};

export const NOTE_MAX_LENGTH = 1000;
export const DEBOUNCE_MS = 1000;
export const SWIPE_THRESHOLD = 50;
