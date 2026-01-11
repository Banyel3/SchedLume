/**
 * CSV Template System for SchedLume
 *
 * This module defines the canonical CSV format for importing/exporting schedules.
 * The same format is used for:
 * 1. Blank template downloads
 * 2. Current schedule exports
 * 3. Import validation
 */

import { SubjectSchedule } from "@/types";
import { WEEKDAYS } from "./constants";
import { getAllBaseSchedules } from "./db/scheduleStore";

// =============================================================================
// CANONICAL CSV FORMAT DEFINITION
// =============================================================================

/**
 * Official CSV column headers in exact order.
 * This is the canonical format that will be used for both export and import.
 */
export const CSV_HEADERS = [
  "subject_name",
  "day_of_week",
  "start_time",
  "end_time",
  "location",
  "professor",
  "color",
] as const;

export type CSVHeader = (typeof CSV_HEADERS)[number];

/**
 * Column definitions with metadata
 */
export const CSV_COLUMN_DEFINITIONS: Record<
  CSVHeader,
  {
    required: boolean;
    description: string;
    examples: string[];
    format?: string;
  }
> = {
  subject_name: {
    required: true,
    description: "Name of the class or subject",
    examples: ["Mathematics", "English Literature", "Computer Science 101"],
  },
  day_of_week: {
    required: true,
    description: "Day of the week when the class occurs",
    examples: ["Monday", "Tuesday", "Wed", "Thu"],
    format: "Full name (Monday-Sunday) or abbreviation (Mon-Sun)",
  },
  start_time: {
    required: true,
    description: "Class start time",
    examples: ["09:00", "14:30", "9:00 AM", "2:30 PM"],
    format: "24-hour (HH:mm) or 12-hour (H:mm AM/PM)",
  },
  end_time: {
    required: true,
    description: "Class end time",
    examples: ["10:30", "16:00", "10:30 AM", "4:00 PM"],
    format: "24-hour (HH:mm) or 12-hour (H:mm AM/PM)",
  },
  location: {
    required: false,
    description: "Room number or location",
    examples: ["Room 201", "Lab A", "Building B, Floor 3"],
  },
  professor: {
    required: false,
    description: "Instructor name",
    examples: ["Dr. Smith", "Prof. Johnson", "Ms. Davis"],
  },
  color: {
    required: false,
    description: "Color for the class card (optional)",
    examples: ["#F97B5C", "#4ECDC4", "coral", "teal"],
    format:
      "Hex color (#RRGGBB) or preset name (coral, teal, purple, green, blue, orange)",
  },
};

/**
 * Accepted day of week values (for documentation)
 */
export const ACCEPTED_DAY_VALUES = {
  full: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  numeric: ["0", "1", "2", "3", "4", "5", "6"], // Discouraged but supported
};

// =============================================================================
// CSV GENERATION
// =============================================================================

/**
 * Escape a CSV field value according to RFC 4180
 * - Wrap in quotes if contains comma, newline, or quote
 * - Escape quotes by doubling them
 */
export function escapeCSVField(value: string | undefined | null): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const str = String(value);

  // Check if escaping is needed
  if (
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r") ||
    str.includes('"')
  ) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generate a CSV row from an array of values
 */
export function generateCSVRow(values: (string | undefined | null)[]): string {
  return values.map(escapeCSVField).join(",");
}

/**
 * Generate the header row for the CSV
 */
export function generateCSVHeaderRow(): string {
  return CSV_HEADERS.join(",");
}

/**
 * Convert a SubjectSchedule to a CSV row
 */
export function scheduleToCSVRow(schedule: SubjectSchedule): string {
  const values: (string | undefined)[] = [
    schedule.subjectName,
    WEEKDAYS[schedule.weekday], // Convert weekday number to full name
    schedule.startTime,
    schedule.endTime,
    schedule.location,
    schedule.professor,
    schedule.color,
  ];

  return generateCSVRow(values);
}

/**
 * Generate a complete CSV string from schedules
 */
export function schedulesToCSV(schedules: SubjectSchedule[]): string {
  const lines: string[] = [
    generateCSVHeaderRow(),
    ...schedules.map(scheduleToCSVRow),
  ];

  return lines.join("\n");
}

/**
 * Generate a blank CSV template with only headers
 */
export function generateBlankTemplate(): string {
  return generateCSVHeaderRow();
}

/**
 * Generate a CSV template with example rows for user reference
 */
export function generateExampleTemplate(): string {
  const exampleRows = [
    ["Mathematics", "Monday", "09:00", "10:30", "Room 201", "Dr. Smith", ""],
    ["Physics", "Monday", "11:00", "12:30", "Lab A", "Prof. Johnson", ""],
    [
      "English Literature",
      "Tuesday",
      "09:00",
      "10:30",
      "Room 105",
      "Ms. Davis",
      "",
    ],
    [
      "Computer Science",
      "Wednesday",
      "14:00",
      "16:00",
      "Lab B",
      "Dr. Chen",
      "",
    ],
  ];

  const lines: string[] = [
    generateCSVHeaderRow(),
    ...exampleRows.map((row) => generateCSVRow(row)),
  ];

  return lines.join("\n");
}

// =============================================================================
// CSV EXPORT FUNCTIONS
// =============================================================================

/**
 * Download a string as a file in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/csv"
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Download a blank CSV template
 */
export function downloadBlankTemplate(): void {
  const content = generateBlankTemplate();
  downloadFile(content, "schedlume-template.csv");
}

/**
 * Download a CSV template with example data
 */
export function downloadExampleTemplate(): void {
  const content = generateExampleTemplate();
  downloadFile(content, "schedlume-example.csv");
}

/**
 * Export current schedule as CSV
 */
export async function downloadScheduleCSV(): Promise<void> {
  const schedules = await getAllBaseSchedules();

  if (schedules.length === 0) {
    throw new Error("No schedule data to export");
  }

  // Sort by weekday, then by start time
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.weekday !== b.weekday) {
      return a.weekday - b.weekday;
    }
    return a.startTime.localeCompare(b.startTime);
  });

  const content = schedulesToCSV(sortedSchedules);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(content, `schedlume-schedule-${date}.csv`);
}

// =============================================================================
// TEMPLATE VALIDATION
// =============================================================================

/**
 * Check if headers exactly match the official template
 */
export function headersMatchTemplate(headers: string[]): boolean {
  if (headers.length !== CSV_HEADERS.length) {
    return false;
  }

  return headers.every(
    (header, index) => header.toLowerCase().trim() === CSV_HEADERS[index]
  );
}

/**
 * Get a user-friendly error message for header mismatch
 */
export function getHeaderMismatchMessage(headers: string[]): string {
  const expected = CSV_HEADERS.join(", ");
  const received = headers.join(", ");

  return (
    `Your CSV headers do not match the official template format.\n\n` +
    `Expected: ${expected}\n` +
    `Received: ${received}\n\n` +
    `Please download the official template from Settings and use it as a starting point.`
  );
}

// =============================================================================
// DOCUMENTATION HELPERS
// =============================================================================

/**
 * Generate human-readable documentation for the CSV format
 */
export function getFormatDocumentation(): string {
  const lines: string[] = [
    "# SchedLume CSV Format",
    "",
    "## Required Columns",
    "",
  ];

  // Required columns
  for (const header of CSV_HEADERS) {
    const def = CSV_COLUMN_DEFINITIONS[header];
    if (def.required) {
      lines.push(`### ${header}`);
      lines.push(def.description);
      if (def.format) {
        lines.push(`Format: ${def.format}`);
      }
      lines.push(`Examples: ${def.examples.join(", ")}`);
      lines.push("");
    }
  }

  lines.push("## Optional Columns");
  lines.push("");

  // Optional columns
  for (const header of CSV_HEADERS) {
    const def = CSV_COLUMN_DEFINITIONS[header];
    if (!def.required) {
      lines.push(`### ${header}`);
      lines.push(def.description);
      if (def.format) {
        lines.push(`Format: ${def.format}`);
      }
      lines.push(`Examples: ${def.examples.join(", ")}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
